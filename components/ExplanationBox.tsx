
import React from 'react';

interface ExplanationBoxProps {
  title: string;
  description: string;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({ title, description }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-cyan-400 mb-2">{title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
};
