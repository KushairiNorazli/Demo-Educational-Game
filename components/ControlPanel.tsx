
import React from 'react';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { Scenario } from '../types';

interface ControlPanelProps {
  concentration: number;
  temperature: number;
  stomataOpen: boolean;
  onConcentrationChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
  onStomataChange: (isOpen: boolean) => void;
  currentScenario: Scenario;
}

const Slider: React.FC<{
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: number;
    disabled?: boolean;
}> = ({ id, label, value, min, max, minLabel, maxLabel, onChange, step = 1, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
            {label}
        </label>
        <input
            id={id}
            type="range"
            min={min}
            max={max}
            value={value}
            step={step}
            onChange={onChange}
            disabled={disabled}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  concentration,
  temperature,
  stomataOpen,
  onConcentrationChange,
  onTemperatureChange,
  onStomataChange,
  currentScenario
}) => {
    const isScenarioActive = currentScenario !== Scenario.Normal;
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <WaterDropIcon />
                Simulation Controls
            </h2>
            
            <Slider
                id="concentration"
                label={`External Solution: ${concentration}% Solute`}
                value={concentration}
                onChange={(e) => onConcentrationChange(Number(e.target.value))}
                min={0}
                max={100}
                minLabel="Pure Water"
                maxLabel="Concentrated Salt"
                disabled={isScenarioActive}
            />

            <Slider
                id="temperature"
                label={`Temperature: ${temperature}°C`}
                value={temperature}
                onChange={(e) => onTemperatureChange(Number(e.target.value))}
                min={0}
                max={100}
                minLabel="Low"
                maxLabel="High"
                disabled={isScenarioActive}
            />

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Stomata Control</label>
                <div className="flex items-center justify-center bg-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => onStomataChange(true)}
                        disabled={isScenarioActive}
                        className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${stomataOpen ? 'bg-cyan-500 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-600'}`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => onStomataChange(false)}
                        disabled={isScenarioActive}
                        className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${!stomataOpen ? 'bg-cyan-500 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-600'}`}
                    >
                        Closed
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {stomataOpen ? 'Open stomata allow gas exchange but increase water loss.' : 'Closed stomata conserve water but limit photosynthesis.'}
                </p>
            </div>
             {isScenarioActive && (
                <p className="text-xs text-center text-yellow-400 bg-yellow-900/30 p-2 rounded-md">
                    Controls are locked during a scenario. Change to "Normal Lab" to enable controls.
                </p>
            )}
        </div>
    );
};
