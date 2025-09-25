
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

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ cellState, temperature, netFlow }) => {
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // FIX: Initialize useRef with null as it expects an initial value.
  const animationFrameId = useRef<number | null>(null);

  const cellScale = cellState === CellState.Turgid ? 1.0 : cellState === CellState.Plasmolyzed ? 0.75 : 0.9;
  const vacuoleScale = cellState === CellState.Turgid ? 1.0 : cellState === CellState.Plasmolyzed ? 0.6 : 0.85;

  useEffect(() => {
    if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setMolecules([
            ...generateMolecules(70, false, width, height),
            ...generateMolecules(30, true, width, height)
        ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let lastFlowTime = 0;
    const flowInterval = 200; // ms between molecule transfers

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

          // Simple boundary check for cell
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
                // If outside molecule hits the cell wall, bounce it away
                if (m.x <= cellLeft || m.x >= cellRight) newVx = -newVx;
                if (m.y <= cellTop || m.y >= cellBottom) newVy = -newVy;
            }
          }

          return { ...m, x: newX, y: newY, vx: newVx, vy: newVy };
        });

        if (timestamp - lastFlowTime > flowInterval) {
            lastFlowTime = timestamp;
            if (netFlow === 1) { // Water flows in
                const outerMoleculeIndex = newMolecules.findIndex(m => !m.isInside);
                if (outerMoleculeIndex !== -1) newMolecules[outerMoleculeIndex].isInside = true;
            } else if (netFlow === -1) { // Water flows out
                const innerMoleculeIndex = newMolecules.findIndex(m => m.isInside);
                if (innerMoleculeIndex !== -1) newMolecules[innerMoleculeIndex].isInside = false;
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

        {/* Cell Membrane (scales) */}
        <rect
          x={`calc(50% - ${CELL_WIDTH / 2}px)`}
          y={`calc(50% - ${CELL_HEIGHT / 2}px)`}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          rx="40"
          ry="60"
          fill="url(#grad-cytoplasm)"
          stroke="#4ade80"
          strokeWidth="3"
          className="origin-center transition-transform duration-1000 ease-in-out"
          style={{ transform: `scale(${cellScale})` }}
        />

        {/* Vacuole (scales more) */}
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
