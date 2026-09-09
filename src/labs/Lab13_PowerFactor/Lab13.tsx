import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import { calculatePowerFactor } from '../../lib/math/powerFactor';
import { Zap, TrendingDown, DollarSign } from 'lucide-react';

export default function Lab13() {
  const [Vrms] = useState(230); // V
  const [Pload, setPload] = useState(100); // kW
  const [initialPf, setInitialPf] = useState(0.65); // Lagging
  const [Cbank, setCbank] = useState(50); // kVAR

  const results = useMemo(() => calculatePowerFactor(Vrms, Pload, initialPf, Cbank), 
    [Vrms, Pload, initialPf, Cbank]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Plant & Compensation Setup">
          <SliderInput label="Active Power Demand (P)" value={Pload} min={50} max={500} step={10} unit="kW" onChange={setPload} />
          <SliderInput label="Uncompensated Power Factor" value={initialPf} min={0.5} max={0.95} step={0.01} unit="" onChange={setInitialPf} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Capacitor Bank Control</h4>
             <SliderInput label="Capacitor Size (Qc)" value={Cbank} min={0} max={500} step={5} unit="kVAR" onChange={setCbank} />
          </div>
        </InputPanel>
        
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
           <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><DollarSign size={18}/> Economic Impact</h3>
           <div className="space-y-2 text-sm text-emerald-900">
              <div className="flex justify-between border-b border-emerald-200 pb-1">
                 <span>Uncompensated Penalty:</span>
                 <span className="font-mono">Rs {results.penalty1.toLocaleString()} /yr</span>
              </div>
              <div className="flex justify-between border-b border-emerald-200 pb-1">
                 <span>New Penalty (incl. overcorrection):</span>
                 <span className="font-mono">Rs {results.penalty2.toLocaleString()} /yr</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 pt-1 text-base">
                 <span>Net Savings:</span>
                 <span className="font-mono">Rs {results.total_savings.toLocaleString()} /yr</span>
              </div>
           </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Target PF</div>
                 <div className={`text-2xl font-bold ${results.new_pf >= 0.95 && !results.isLeading ? 'text-green-600' : 'text-red-600'}`}>
                    {results.new_pf.toFixed(3)}
                 </div>
                 <div className="text-[10px] text-gray-400 uppercase">{results.isLeading ? 'Leading (Overcorrected)' : 'Lagging'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Line Current Reduction</div>
                 <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                    <TrendingDown size={20}/>
                    {Math.max(0, results.I1 - results.I2).toFixed(1)} A
                 </div>
                 <div className="text-[10px] text-gray-400 uppercase">From {results.I1}A to {results.I2}A</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Apparent Power (S2)</div>
                 <div className="text-2xl font-bold text-indigo-600">{results.S2}</div>
                 <div className="text-[10px] text-gray-400 uppercase">kVA (Was {results.S1})</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Reactive Power (Q2)</div>
                 <div className="text-2xl font-bold text-orange-600">{Math.abs(results.Q2)}</div>
                 <div className="text-[10px] text-gray-400 uppercase">kVAR (Was {results.Q1})</div>
              </div>
          </div>
        </div>

        {/* Power Triangle Visualizer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative shadow-inner flex-1">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Power Triangle Phasor Diagram</div>
           
           <div className="relative w-full h-full max-h-[300px] flex items-end justify-start pl-10 pb-10 mt-10">
              {/* Axes */}
              <div className="absolute bottom-10 left-10 right-10 h-0.5 bg-slate-700"></div> {/* Real Axis */}
              <div className="absolute bottom-10 left-10 top-10 w-0.5 bg-slate-700"></div> {/* Imag Axis */}
              
              {/* Scaling factors */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 300" preserveAspectRatio="xMinYMax meet">
                 <g transform="translate(0, 300) scale(1, -1)">
                     {/* P (Active Power) */}
                     <line x1="0" y1="0" x2={results.P} y2="0" stroke="#16a34a" strokeWidth="4" />
                     <text x={results.P / 2} y="-10" fill="#16a34a" fontSize="12" transform="scale(1, -1)">P = {results.P} kW</text>
                     
                     {/* Q1 (Initial Reactive Power) */}
                     <line x1={results.P} y1="0" x2={results.P} y2={results.Q1} stroke="#ef4444" strokeWidth="4" strokeDasharray="5,5" />
                     
                     {/* S1 (Initial Apparent Power) */}
                     <line x1="0" y1="0" x2={results.P} y2={results.Q1} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
                     
                     {/* Qc (Capacitor Bank) */}
                     <line x1={results.P} y1={results.Q1} x2={results.P} y2={results.Q2} stroke="#eab308" strokeWidth="6" />
                     
                     {/* Q2 (New Reactive Power) */}
                     <line x1={results.P} y1="0" x2={results.P} y2={results.Q2} stroke="#3b82f6" strokeWidth="4" />
                     
                     {/* S2 (New Apparent Power) */}
                     <line x1="0" y1="0" x2={results.P} y2={results.Q2} stroke="#3b82f6" strokeWidth="3" />
                     
                     {/* Labels for S2 and Qc */}
                     <text x={results.P + 10} y={-results.Q2/2} fill="#3b82f6" fontSize="12" transform="scale(1, -1)">New Q</text>
                     <text x={results.P + 20} y={-(results.Q1 + results.Q2)/2} fill="#eab308" fontSize="12" transform="scale(1, -1)">-Qc</text>
                 </g>
              </svg>
           </div>
           
           <div className="absolute bottom-4 right-4 bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Initial State (S1, Q1)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> New State (S2, Q2)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Capacitor Injection (-Qc)</div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 13: Power Factor Correction"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">Most industrial loads (like induction motors) are highly inductive, causing them to draw large amounts of reactive power (kVAR). This results in a poor (lagging) power factor.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Why Correct It?</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Reduced Line Current:</strong> Reactive power sloshes back and forth in the lines, causing $I^2R$ heat losses. Canceling it locally reduces the total current drawn from the utility.</li>
            <li><strong>Avoid Penalties:</strong> Utilities charge massive penalties (measured in kVAh or peak kVA) for poor power factors, usually if it drops below 0.90 or 0.95.</li>
          </ul>
          <p className="text-gray-700">We correct it by installing Capacitor Banks in parallel with the load. Capacitors draw <em>leading</em> reactive power, which mathematically cancels out the <em>lagging</em> reactive power of the motors.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
