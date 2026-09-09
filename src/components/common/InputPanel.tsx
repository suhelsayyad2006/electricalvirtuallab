import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (val: number) => void;
}

export function SliderInput({ label, value, min, max, step = 1, unit, onChange }: SliderInputProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="bg-gray-100 px-2 py-1 rounded text-sm font-semibold text-blue-700 font-mono">
          {value.toFixed(step < 1 ? 2 : 0)} <span className="text-gray-500 font-sans">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between mt-1 text-xs text-gray-400 font-medium">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

export function InputPanel({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl shrink-0">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
