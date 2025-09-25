
import React from 'react';
import { Scenario } from '../types';

interface ScenarioControllerProps {
  currentScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
}

const scenarios = [
  { id: Scenario.Normal, name: 'Normal Lab' },
  { id: Scenario.Drought, name: 'Drought Stress' },
  { id: Scenario.Freshwater, name: 'Freshwater Flood' },
];

export const ScenarioController: React.FC<ScenarioControllerProps> = ({ currentScenario, onScenarioChange }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 shadow-lg">
      <h3 className="text-md font-bold text-white mb-3 text-center">Advanced Scenarios</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => onScenarioChange(scenario.id)}
            className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
              currentScenario === scenario.id
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {scenario.name}
          </button>
        ))}
      </div>
    </div>
  );
};
