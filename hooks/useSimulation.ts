
import { useState, useEffect, useCallback } from 'react';
import { CellState, Scenario } from '../types';

interface SimulationState {
  concentration: number;
  temperature: number;
  stomataOpen: boolean;
  cellState: CellState;
  netFlow: number; // -1 for out, 0 for equilibrium, 1 for in
  scenario: Scenario;
  explanation: {
    title: string;
    description: string;
  };
}

const getExplanation = (cellState: CellState, concentration: number): { title: string; description: string } => {
  switch (cellState) {
    case CellState.Turgid:
      return {
        title: 'Cell is Turgid (Healthy)',
        description: 'Water is entering the cell because the external solution is hypotonic (low solute concentration). The cell swells and becomes firm, which is the ideal state for most plant cells.',
      };
    case CellState.Flaccid:
      return {
        title: 'Cell is Flaccid (Isotonic)',
        description: 'The external solution is isotonic. Water moves in and out of the cell at equal rates. The cell is neither swollen nor shrunken, but lacks the turgor pressure for optimal plant support.',
      };
    case CellState.Plasmolyzed:
      return {
        title: 'Cell is Plasmolyzed (Shrinking)',
        description: `Watch closely! Water is rapidly leaving the cell because the external solution is hypertonic (high solute concentration). This process, called plasmolysis, causes the cell membrane to pull away from the cell wall.`,
      };
    default:
      return {
        title: 'Observing Osmosis',
        description: 'Adjust the controls to see how the plant cell reacts to its environment.'
      };
  }
};

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>({
    concentration: 50,
    temperature: 50,
    stomataOpen: true,
    cellState: CellState.Flaccid,
    netFlow: 0,
    scenario: Scenario.Normal,
    explanation: getExplanation(CellState.Flaccid, 50),
  });

  useEffect(() => {
    const internalPotential = 50; // Constant for simplicity
    const externalPotential = state.concentration;
    
    // Stomata being open increases water loss, simulated as increasing external potential
    const stomataEffect = state.stomataOpen ? 5 : 0;
    const waterPotentialDifference = internalPotential - (externalPotential + stomataEffect);

    let newCellState: CellState;
    let newNetFlow: number;

    if (waterPotentialDifference > 15) {
      newCellState = CellState.Turgid;
      newNetFlow = 1;
    } else if (waterPotentialDifference < -15) {
      newCellState = CellState.Plasmolyzed;
      newNetFlow = -1;
    } else {
      newCellState = CellState.Flaccid;
      newNetFlow = 0;
    }

    setState(prevState => ({
      ...prevState,
      cellState: newCellState,
      netFlow: newNetFlow,
      explanation: getExplanation(newCellState, prevState.concentration),
    }));
  }, [state.concentration, state.stomataOpen]);

  const setConcentration = (value: number) => {
    setState(prevState => ({ ...prevState, concentration: value }));
  };

  const setTemperature = (value: number) => {
    setState(prevState => ({ ...prevState, temperature: value }));
  };

  const setStomataOpen = (isOpen: boolean) => {
    setState(prevState => ({ ...prevState, stomataOpen: isOpen }));
  };
  
  const setScenario = useCallback((scenario: Scenario) => {
    setState(prevState => {
      let concentration = 50;
      let temperature = 50;
      let stomataOpen = true;

      switch(scenario) {
        case Scenario.Drought:
          concentration = 90;
          temperature = 85;
          stomataOpen = false;
          break;
        case Scenario.Freshwater:
          concentration = 10;
          temperature = 40;
          stomataOpen = true;
          break;
        case Scenario.Normal:
        default:
          concentration = 50;
          temperature = 50;
          stomataOpen = true;
          break;
      }
      return {
        ...prevState,
        scenario,
        concentration,
        temperature,
        stomataOpen
      };
    });
  }, []);

  return { state, setConcentration, setTemperature, setStomataOpen, setScenario };
};
