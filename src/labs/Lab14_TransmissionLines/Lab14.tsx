import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateTransmissionLine } from '../../lib/math/transmissionLines';
import { Activity, Zap } from 'lucide-react';

export default function Lab14() {
  const [length, setLength] = useState(150); // km
  const [VrLL, setVrLL] = useState(220); // kV
  const [Pr, setPr] = useState(50); // MW
  const [pf, setPf] = useState(0.85); // Lagging
  const [isLagging, setIsLagging] = useState(true);

  // Typical 220kV Line Parameters
  const R_per_km = 0.08; 
  const L_per_km = 1.2;
  const C_per_km = 0.009;

  const results = useMemo(() => calculateTransmissionLine(length, R_per_km, L_per_km, C_per_km, VrLL, Pr, pf, isLagging), 
    [length, VrLL, Pr, pf, isLagging]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Transmission Line Settings">
          <SliderInput label="Line Length" value={length} min={10} max={500} step={10} unit="km" onChange={setLength} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Receiving End (Load)</h4>
             <SliderInput label="Voltage (Vr)" value={VrLL} min={110} max={400} step={10} unit="kV" onChange={setVrLL} />
             <SliderInput label="Active Power (Pr)" value={Pr} min={0} max={500} step={10} unit="MW" onChange={setPr} />
             
             {Pr > 0 && (
                <div className="mt-4">
                  <SliderInput label="Power Factor" value={pf} min={0.5} max={1.0} step={0.01} unit="" onChange={setPf} />
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setIsLagging(true)}
                      className={`flex-1 py-1 text-xs font-bold rounded ${isLagging ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >Lagging</button>
                    <button 
                      onClick={() => setIsLagging(false)}
                      className={`flex-1 py-1 text-xs font-bold rounded ${!isLagging ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >Leading</button>
                  </div>
                </div>
             )}
          </div>
          
          <div className="mt-4 bg-sky-50 p-3 rounded text-sm text-sky-800">
             <strong>Ferranti Effect Test:</strong> Set Active Power (Pr) to 0 MW on a line length &gt; 80km to observe the receiving end voltage rise above the sending end voltage.
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-none">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h3 className="font-bold text-gray-800 flex items-center gap-2"><Zap size={20}/> Substation Analysis</h3>
             <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               {results.model} Line Model
             </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Sending End Voltage</div>
                 <div className="text-2xl font-bold text-blue-700">{results.Vs_LL}</div>
                 <div className="text-[10px] text-gray-400 uppercase">kV (L-L)</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Sending End Current</div>
                 <div className="text-2xl font-bold text-indigo-700">{results.Is_mag}</div>
                 <div className="text-[10px] text-gray-400 uppercase">Amps</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Voltage Regulation</div>
                 <div className={`text-2xl font-bold ${results.ferranti ? 'text-red-600' : 'text-emerald-600'}`}>
                    {results.ferranti ? (results.regulation).toFixed(2) : results.regulation} %
                 </div>
                 <div className="text-[10px] text-gray-400 uppercase">{results.ferranti ? 'Negative (Ferranti)' : 'Normal'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Transmission Eff.</div>
                 <div className="text-2xl font-bold text-green-600">{Pr === 0 ? '--' : results.eff} %</div>
                 <div className="text-[10px] text-gray-400 uppercase">Efficiency</div>
              </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex items-center justify-between relative shadow-inner flex-none h-32">
           <div className="absolute top-2 left-2 text-slate-400 font-mono text-xs">Line Diagram</div>
           
           <div className="text-white text-center">
              <div className="font-bold text-lg text-blue-400">Sending Substation</div>
              <div className="font-mono text-sm">{results.Vs_LL} kV</div>
           </div>
           
           <div className="flex-1 h-2 mx-8 relative">
              <div className="absolute inset-0 bg-gray-500 rounded-full"></div>
              {results.ferranti && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 text-red-400 font-bold text-xs animate-pulse whitespace-nowrap">
                    WARNING: FERRANTI EFFECT DETECTED
                 </div>
              )}
           </div>
           
           <div className="text-white text-center">
              <div className="font-bold text-lg text-emerald-400">Receiving Substation</div>
              <div className="font-mono text-sm">{VrLL} kV</div>
           </div>
        </div>

        {/* Graphs */}
        <div className="flex-1 min-h-[250px] bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
            <Oscilloscope 
              title="Voltage Profile Along Transmission Line"
              data={results.profile}
              xKey="distance"
              xLabel="Distance from Sending End (km)"
              yLabel="Voltage (kV)"
              lines={[
                { key: 'voltage', name: 'Line Voltage (kV)', color: results.ferranti ? '#ef4444' : '#8b5cf6' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 14: Transmission Line Performance"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">Transmission lines are categorized by their physical length, which dictates which electrical parameters (R, L, C) must be modeled:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Short Line (&lt; 80 km):</strong> Only Resistance (R) and Inductance (L) are considered. Capacitance is negligible.</li>
            <li><strong>Medium Line (80 - 250 km):</strong> Shunt Capacitance (C) is significant and is usually modeled using a Nominal Pi (π) or T circuit.</li>
            <li><strong>Long Line (&gt; 250 km):</strong> Parameters are uniformly distributed across the line, requiring rigorous distributed-parameter equations.</li>
          </ul>
          <h3 className="text-xl font-semibold mb-2 mt-6">The Ferranti Effect</h3>
          <p className="text-gray-700">When a medium or long line is lightly loaded or open-circuited, the charging current flowing through the line's capacitance causes the receiving end voltage to become <em>higher</em> than the sending end voltage. This is known as the Ferranti Effect.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
