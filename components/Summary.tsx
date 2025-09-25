
import React from 'react';

interface SummaryProps {
  onClose: () => void;
}

export const Summary: React.FC<SummaryProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full p-8 shadow-2xl relative animate-fade-in">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Osmosis Learning Recap</h2>
        <p className="text-slate-300 mb-6">
          Congratulations on completing your lab session! Here are the key takeaways from your experiments.
        </p>

        <ul className="space-y-4 text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">&#10003;</span>
            <div>
              <h4 className="font-semibold text-white">Water Potential is Key</h4>
              <p className="text-sm">Osmosis is the movement of water from an area of high water potential to an area of low water potential across a semi-permeable membrane.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">&#10003;</span>
            <div>
              <h4 className="font-semibold text-white">Solution Types Matter</h4>
              <p className="text-sm"><strong className="text-green-400">Hypotonic (Low Solute):</strong> Water enters the cell, making it turgid. <br/><strong className="text-yellow-400">Isotonic (Equal Solute):</strong> No net water movement; cell is flaccid. <br/><strong className="text-red-400">Hypertonic (High Solute):</strong> Water leaves the cell, causing plasmolysis.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">&#10003;</span>
            <div>
              <h4 className="font-semibold text-white">Environmental Impact</h4>
              <p className="text-sm">Real-world conditions like drought (hypertonic soil) or flooding with pure water (hypotonic environment) directly impact plant cells and overall plant health through osmosis.</p>
            </div>
          </li>
        </ul>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close summary"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <button
            onClick={onClose}
            className="mt-8 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
            Continue Experimenting
        </button>
      </div>
    </div>
  );
};
