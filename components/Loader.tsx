
import React from 'react';
import { SpinnerIcon } from './icons';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
      <SpinnerIcon className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
      <p className="text-slate-300 text-lg font-medium">{text}</p>
    </div>
  );
};

export default Loader;
