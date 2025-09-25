
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl lg:text-5xl font-bold text-cyan-400 tracking-tight">
        Interactive Osmosis Lab
      </h1>
      <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">
        You are in control of the environment around a plant cell. Your mission is to observe osmosis in action and understand how water balance is critical for life.
      </p>
    </header>
  );
};
