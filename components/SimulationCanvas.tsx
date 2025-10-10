import React, { useState, useEffect, useRef } from 'react';
import { CellState, Molecule } from '../types';

interface SimulationCanvasProps {
  cellState: CellState;
  temperature: number;
  netFlow: number;
}

const CELL_WIDTH = 400;
const CELL_HEIGHT = 220;

const generateMolecules = (count: number, isInside: boolean, canvasWidth: number, canvasHeight: number): Molecule[] => {
  const molecules: Molecule[] = [];
  for (let i = 0; i < count; i++) {
    const buffer = 10;
    const x = isInside 
      ? (canvasWidth / 2) - (CELL_WIDTH / 4) + Math.random() * (CELL_WIDTH / 2) 
      : buffer + Math.random() * (canvasWidth - buffer * 2);
    const y = isInside
      ? (canvasHeight / 2) - (CELL_HEIGHT / 4) + Math.random() * (CELL_HEIGHT / 2)
      : buffer + Math.random() * (canvasHeight - buffer * 2);

    molecules.push({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      isInside,
    });
  }
  return molecules;
};

const generateMembranePath = (cellState: CellState, canvasWidth: number, canvasHeight: number): string => {
    const wallWidth = CELL_WIDTH;
    const wallHeight = CELL_HEIGHT;
    const rx = 40; // horizontal radius for corners
    const ry = 60; // vertical radius for corners

    const left = (canvasWidth - wallWidth) / 2;
    const top = (canvasHeight - wallHeight) / 2;
    const right = left + wallWidth;
    const bottom = top + wallHeight;
    const centerX = left + wallWidth / 2;
    const centerY = top + wallHeight / 2;

    let pullFactor = 0;
    switch (cellState) {
        case CellState.Turgid:
            pullFactor = -0.05; // Negative pulls outwards (convex)
            break;
        case CellState.Flaccid:
            pullFactor = 0.05; // Slightly pulled inwards (concave)
            break;
        case CellState.Plasmolyzed:
            pullFactor = 0.45; // Strongly pulled inwards (very concave)
            break;
    }
    
    // Points where rounded corners end and straight sides begin
    const p1 = { x: left + rx, y: top }; 
    const p2 = { x: right - rx, y: top };
    const p3 = { x: right, y: top + ry };
    const p4 = { x: right, y: bottom - ry };
    const p5 = { x: right - rx, y: bottom };
    const p6 = { x: left + rx, y: bottom };
    const p7 = { x: left, y: bottom - ry };
    const p8 = { x: left, y: top + ry };
    
    // Corners of the cell wall bounding box, used as control points for corner curves
    const c1 = { x: left, y: top };
    const c2 = { x: right, y: top };
    const c3 = { x: right, y: bottom };
    const c4 = { x: left, y: bottom };

    // Control points for the sides, pulled based on cell state
    const topControl = { x: centerX, y: top + (pullFactor * wallHeight) };
    const bottomControl = { x: centerX, y: bottom - (pullFactor * wallHeight) };
    const leftControl = { x: left + (pullFactor * wallWidth), y: centerY };
    const rightControl = { x: right - (pullFactor * wallWidth), y: centerY };
    
    // Using Quadratic Bezier curves (Q) for all segments for smooth transitions.
    return `
        M ${p1.x} ${p1.y}
        Q ${topControl.x} ${topControl.y}, ${p2.x} ${p2.y}
        Q ${c2.x} ${c2.y}, ${p3.x} ${p3.y}
        Q ${rightControl.x} ${rightControl.y}, ${p4.x} ${p4.y}
        Q ${c3.x} ${c3.y}, ${p5.x} ${p5.y}
        Q ${bottomControl.x} ${bottomControl.y}, ${p6.x} ${p6.y}
        Q ${c4.x} ${c4.y}, ${p7.x} ${p7.y}
        Q ${leftControl.x} ${leftControl.y}, ${p8.x} ${p8.y}
        Q ${c1.x} ${c1.y}, ${p1.x} ${p1.y}
        Z
    `;
};


export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ cellState, temperature, netFlow }) => {
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // This scale is now only for the physics boundary, not the visual shape
  const cellScale = cellState === CellState.Turgid ? 1.0 : cellState === CellState.Plasmolyzed ? 0.75 : 0.9;
  const vacuoleScale = cellState === CellState.Turgid ? 1.0 : cellState === CellState.Plasmolyzed ? 0.6 : 0.85;
  
  const membranePath = canvasSize.width > 0 ? generateMembranePath(cellState, canvasSize.width, canvasSize.height) : '';

  useEffect(() => {
    if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
        setMolecules([
            ...generateMolecules(70, false, width, height),
            ...generateMolecules(30, true, width, height)
        ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let lastFlowTime = 0;
    const flowInterval = 150; // Increased frequency of molecule transfer
    const flowAmount = 2; // Increased number of molecules transferred at once

    const animate = (timestamp: number) => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const speed = 0.5 + (temperature / 100) * 1.5;

      setMolecules(prevMolecules => {
        let newMolecules = prevMolecules.map(m => {
          let newX = m.x + m.vx * speed;
          let newY = m.y + m.vy * speed;
          let newVx = m.vx;
          let newVy = m.vy;

          if (newX <= 0 || newX >= width) newVx = -newVx;
          if (newY <= 0 || newY >= height) newVy = -newVy;

          const cellLeft = (width - CELL_WIDTH) / 2;
          const cellRight = (width + CELL_WIDTH) / 2;
          const cellTop = (height - CELL_HEIGHT) / 2;
          const cellBottom = (height + CELL_HEIGHT) / 2;
          
          if (m.isInside) {
             const scaledWidth = CELL_WIDTH * cellScale;
             const scaledHeight = CELL_HEIGHT * cellScale;
             const membraneLeft = (width - scaledWidth) / 2;
             const membraneRight = (width + scaledWidth) / 2;
             const membraneTop = (height - scaledHeight) / 2;
             const membraneBottom = (height + scaledHeight) / 2;
             if (newX <= membraneLeft || newX >= membraneRight) newVx = -newVx;
             if (newY <= membraneTop || newY >= membraneBottom) newVy = -newVy;
          } else {
            if (newX > cellLeft && newX < cellRight && newY > cellTop && newY < cellBottom) {
                if (m.x <= cellLeft || m.x >= cellRight) newVx = -newVx;
                if (m.y <= cellTop || m.y >= cellBottom) newVy = -newVy;
            }
          }

          return { ...m, x: newX, y: newY, vx: newVx, vy: newVy };
        });

        if (timestamp - lastFlowTime > flowInterval) {
            lastFlowTime = timestamp;
            if (netFlow !== 0) {
              const movingIn = netFlow === 1;
              let movedCount = 0;
              newMolecules = newMolecules.map(m => {
                if (m.isInside !== movingIn && movedCount < flowAmount) {
                  movedCount++;
                  return { ...m, isInside: movingIn };
                }
                return m;
              });
            }
        }
        return newMolecules;
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [temperature, netFlow, cellScale]);


  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900 relative">
      <svg width="100%" height="100%">
        <defs>
            <radialGradient id="grad-vacuole" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: 'rgba(107, 203, 255, 0.7)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(56, 157, 224, 0.9)', stopOpacity: 1}} />
            </radialGradient>
             <radialGradient id="grad-cytoplasm" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: 'rgba(100, 220, 180, 0.3)', stopOpacity: 1}} />
                <stop offset="80%" style={{stopColor: 'rgba(60, 180, 140, 0.5)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(40, 150, 120, 0.6)', stopOpacity: 1}} />
            </radialGradient>
        </defs>
      
        {/* Cell Wall (static) */}
        <rect
          x={`calc(50% - ${CELL_WIDTH / 2}px)`}
          y={`calc(50% - ${CELL_HEIGHT / 2}px)`}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          rx="40"
          ry="60"
          fill="none"
          stroke="rgba(94, 81, 62, 0.8)"
          strokeWidth="12"
        />

        {/* Cell Membrane (dynamic path) */}
        <path
          d={membranePath}
          fill="url(#grad-cytoplasm)"
          stroke="#4ade80"
          strokeWidth="3"
          style={{ transition: 'd 1s ease-in-out' }}
        />

        {/* Vacuole (scales) */}
        <ellipse
            cx="50%"
            cy="50%"
            rx={CELL_WIDTH * 0.4}
            ry={CELL_HEIGHT * 0.35}
            fill="url(#grad-vacuole)"
            className="origin-center transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${vacuoleScale})` }}
        />
        
        {/* Molecules */}
        {molecules.map(m => (
          <circle key={m.id} cx={m.x} cy={m.y} r="4" fill={m.isInside ? '#67e8f9' : '#bae6fd'} opacity="0.8" />
        ))}
      </svg>
    </div>
  );
};
