import React from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  speedMultiplier?: number;
  onSpeedChange?: (speed: number) => void;
}

export default function SimulationControls({
  isRunning,
  onToggle,
  onReset,
  speedMultiplier = 1,
  onSpeedChange
}: SimulationControlsProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-colors ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Start Simulation'}
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {onSpeedChange && (
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <FastForward size={16} /> Speed:
          </span>
          {[0.5, 1, 2, 5].map(speed => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                speedMultiplier === speed 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
