import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import { calculateTransformer } from '../../lib/math/transformer';
import { Zap, Activity } from 'lucide-react';

export default function Lab03() {
  const [V1, setV1] = useState(230); // Primary voltage
  const [f, setF] = useState(50); // Frequency
  const [a, setA] = useState(2); // Turns ratio N1/N2
  const [loadS, setLoadS] = useState(1000); // VA
  const [loadPf, setLoadPf] = useState(0.8);
  const [mode, setMode] = useState<'open_circuit' | 'short_circuit' | 'load'>('load');

  const results = useMemo(() => calculateTransformer(V1, f, a, loadS, loadPf, mode), 
    [V1, f, a, loadS, loadPf, mode]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Transformer Parameters">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Test Mode</h4>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="load">Normal Load Test</option>
              <option value="open_circuit">Open Circuit Test</option>
              <option value="short_circuit">Short Circuit Test</option>
            </select>
          </div>
          
          <SliderInput label="Primary Voltage (V1)" value={V1} min={10} max={400} unit="V" onChange={setV1} />
          <SliderInput label="Turns Ratio (N1/N2)" value={a} min={0.1} max={10} step={0.1} unit="" onChange={setA} />
          
          {mode === 'load' && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold text-sm mb-2 text-gray-700">Secondary Load</h4>
              <SliderInput label="Apparent Power (S)" value={loadS} min={0} max={5000} step={100} unit="VA" onChange={setLoadS} />
              <SliderInput label="Power Factor" value={loadPf} min={0.1} max={1.0} step={0.05} unit="" onChange={setLoadPf} />
            </div>
          )}
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Visualizer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex-1 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
           <h3 className="absolute top-4 left-4 text-slate-400 font-mono text-sm flex items-center gap-2"><Zap size={16}/> Magnetic Flux Simulation</h3>
           
           <div className="relative w-64 h-64 border-[16px] border-slate-600 rounded-lg flex items-center justify-center">
             {/* Core Flux Animation */}
             <div className="absolute inset-0 border-[8px] border-blue-500/30 rounded opacity-50" style={{ animation: `pulse ${1/f}s infinite alternate` }}></div>
             
             {/* Primary Winding */}
             <div className="absolute -left-8 w-12 h-32 bg-orange-700/80 rounded-sm border-y-8 border-orange-500 flex flex-col justify-around py-2 shadow-lg">
                <div className="w-full h-1 bg-orange-400"></div><div className="w-full h-1 bg-orange-400"></div><div className="w-full h-1 bg-orange-400"></div>
                <div className="absolute -left-16 text-center">
                  <div className="text-white font-mono text-sm">{V1}V</div>
                  <div className="text-red-400 font-mono text-xs text-nowrap">I₁ = {results.I1}A</div>
                </div>
             </div>

             {/* Secondary Winding */}
             <div className="absolute -right-8 w-12 h-32 bg-amber-700/80 rounded-sm border-y-8 border-amber-500 flex flex-col justify-around py-2 shadow-lg">
                <div className="w-full h-1 bg-amber-400"></div><div className="w-full h-1 bg-amber-400"></div>
                <div className="absolute -right-20 text-center">
                  <div className="text-white font-mono text-sm">{results.V2}V</div>
                  <div className="text-red-400 font-mono text-xs text-nowrap">I₂ = {results.I2}A</div>
                </div>
             </div>
           </div>
           
           <style dangerouslySetInnerHTML={{__html: `
             @keyframes pulse { 0% { box-shadow: 0 0 10px #3b82f6; } 100% { box-shadow: 0 0 40px #3b82f6, inset 0 0 20px #3b82f6; } }
           `}} />
        </div>

        {/* Meters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Efficiency</div>
            <div className="text-xl font-bold text-green-600">{results.efficiency}%</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">V. Regulation</div>
            <div className="text-xl font-bold text-blue-600">{results.regulation}%</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Core Loss</div>
            <div className="text-xl font-bold text-orange-600">{results.P_core} W</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Copper Loss</div>
            <div className="text-xl font-bold text-red-600">{results.P_cu} W</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 3: Transformer Virtual Lab"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A transformer transfers electrical energy between two or more circuits through electromagnetic induction. A varying current in one coil of the transformer produces a varying magnetic flux, which, in turn, induces a varying electromotive force across a second coil wound around the same core.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Transformer Tests</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Open-Circuit Test:</strong> Determines the no-load parameters (Core loss, Magnetizing branch).</li>
            <li><strong>Short-Circuit Test:</strong> Determines the series impedance parameters (Copper loss, Equivalent resistance and reactance).</li>
            <li><strong>Load Test:</strong> Evaluates Voltage Regulation and Efficiency under varying load conditions.</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
