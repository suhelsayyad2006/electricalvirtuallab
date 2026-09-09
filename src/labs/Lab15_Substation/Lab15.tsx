import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateSubstationGrounding } from '../../lib/math/substation';
import { ShieldCheck, ShieldAlert, Grid } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Lab15() {
  const [IfkA, setIfkA] = useState(10); // kA
  const [tc, setTc] = useState(0.5); // seconds
  const [rho, setRho] = useState(100); // Ohm-m (Soil)
  const [rhos, setRhos] = useState(3000); // Ohm-m (Gravel)
  const [L, setL] = useState(50); // m
  const [W, setW] = useState(50); // m
  const [N, setN] = useState(5); // Conductors

  const results = useMemo(() => calculateSubstationGrounding(IfkA, tc, rho, rhos, 0.15, L, W, N), 
    [IfkA, tc, rho, rhos, L, W, N]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto">
        <InputPanel title="Substation Grid Parameters">
          <div className="border-b pb-4 mb-4">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Fault Data</h4>
             <SliderInput label="Fault Current (If)" value={IfkA} min={1} max={50} step={1} unit="kA" onChange={setIfkA} />
             <SliderInput label="Clearing Time (tc)" value={tc} min={0.1} max={1.5} step={0.1} unit="s" onChange={setTc} />
          </div>
          
          <div className="border-b pb-4 mb-4">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Soil & Surface</h4>
             <SliderInput label="Soil Resistivity (ρ)" value={rho} min={50} max={1000} step={50} unit="Ω-m" onChange={setRho} />
             <SliderInput label="Surface Gravel (ρs)" value={rhos} min={1000} max={5000} step={500} unit="Ω-m" onChange={setRhos} />
          </div>
          
          <div>
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Grid Geometry</h4>
             <SliderInput label="Grid Length" value={L} min={20} max={200} step={10} unit="m" onChange={setL} />
             <SliderInput label="Grid Width" value={W} min={20} max={200} step={10} unit="m" onChange={setW} />
             <SliderInput label="Parallel Conductors" value={N} min={3} max={20} step={1} unit="" onChange={setN} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className={`rounded-xl border p-4 shadow-sm flex-none ${results.isSafe ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3 font-bold text-xl">
                {results.isSafe ? (
                   <><ShieldCheck size={36} className="text-green-600"/> <span className="text-green-700">GRID DESIGN SAFE</span></>
                ) : (
                   <><ShieldAlert size={36} className="text-red-600 animate-pulse"/> <span className="text-red-700">GRID DESIGN UNSAFE</span></>
                )}
             </div>
             
             <div className="flex gap-6">
                <div className="text-center">
                   <div className="text-xs text-gray-600 font-bold uppercase">Grid Resistance</div>
                   <div className="text-2xl font-bold text-gray-900">{results.R_grid} Ω</div>
                </div>
                <div className="text-center border-l pl-6 border-gray-300">
                   <div className="text-xs text-gray-600 font-bold uppercase">Ground Potential Rise</div>
                   <div className="text-2xl font-bold text-purple-700">{results.GPR} V</div>
                </div>
             </div>
          </div>
        </div>

        {/* Visualizer & Charts */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top-Down Grid View */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative shadow-inner">
               <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm flex items-center gap-2"><Grid size={16}/> Mesh Layout</div>
               
               <div 
                 className="border-2 border-orange-500 relative flex items-center justify-center bg-orange-900/20"
                 style={{ width: '80%', height: '80%' }}
               >
                  {/* Vertical lines */}
                  {Array.from({ length: N }).map((_, i) => (
                     <div key={`v-${i}`} className="absolute top-0 bottom-0 bg-orange-500" style={{ left: `${(i / (N - 1)) * 100}%`, width: '2px' }}></div>
                  ))}
                  {/* Horizontal lines (approximated for aspect ratio) */}
                  {Array.from({ length: N }).map((_, i) => (
                     <div key={`h-${i}`} className="absolute left-0 right-0 bg-orange-500" style={{ top: `${(i / (N - 1)) * 100}%`, height: '2px' }}></div>
                  ))}
               </div>
               <div className="absolute bottom-4 text-slate-400 text-xs">Total Conductor Buried: {results.Lc} m</div>
            </div>
            
            {/* Bar Chart comparing Tolerable vs Actual */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
               <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">Touch & Step Potentials</h3>
               <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart
                     data={results.data}
                     margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                   >
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }} />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="Actual" fill={results.isSafe ? "#f59e0b" : "#ef4444"} />
                     <Bar dataKey="Tolerable" fill="#10b981" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 15: Substation Grounding Design"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">The grounding grid of a substation must safely dissipate massive fault currents into the earth while ensuring human safety.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Safety Criteria (IEEE 80)</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Touch Voltage:</strong> The potential difference between a person's hand (touching grounded equipment) and their feet. If the actual mesh voltage exceeds the tolerable touch voltage, the design is lethal.</li>
            <li><strong>Step Voltage:</strong> The potential difference between a person's two feet spaced 1 meter apart.</li>
            <li><strong>Ground Potential Rise (GPR):</strong> The maximum electrical potential the substation grid reaches relative to distant earth during a fault. (GPR = Fault Current × Grid Resistance).</li>
          </ul>
          <p className="text-gray-700">To fix an unsafe design, you can add more buried conductors, increase the grid area, or add a thicker layer of high-resistivity surface gravel (crushed rock) to insulate the operator's feet.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
