import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ExplanationBox } from './components/ExplanationBox';
import { ScenarioController } from './components/ScenarioController';
import { Summary } from './components/Summary';
import { useSimulation } from './hooks/useSimulation';
import type { Scenario } from './types';

// FIX: Changed return type from JSX.Element to React.JSX.Element to resolve namespace issue.
export default function App(): React.JSX.Element {
  const {
    state,
    setConcentration,
    setTemperature,
    setStomataOpen,
    setScenario,
  } = useSimulation();
  
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Show summary after 5 minutes of interaction
    const timer = setTimeout(() => {
      setShowSummary(true);
    }, 5 * 60 * 1000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-7xl">
        <Header />
        
        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 rounded-xl bg-slate-800/50 border border-slate-700 shadow-2xl overflow-hidden aspect-video lg:aspect-auto">
            <SimulationCanvas
              cellState={state.cellState}
              temperature={state.temperature}
              netFlow={state.netFlow}
            />
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <ControlPanel
              concentration={state.concentration}
              temperature={state.temperature}
              stomataOpen={state.stomataOpen}
              onConcentrationChange={setConcentration}
              onTemperatureChange={setTemperature}
              onStomataChange={setStomataOpen}
              currentScenario={state.scenario}
            />
            <ExplanationBox title={state.explanation.title} description={state.explanation.description} />
            <ScenarioController onScenarioChange={setScenario} currentScenario={state.scenario} />
          </div>
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Osmosis Lab Simulator &copy; 2024. A tool for visualizing biological processes.</p>
        </footer>
      </div>

      {showSummary && <Summary onClose={() => setShowSummary(false)} />}
    </div>
  );
}