import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateDistribution } from '../../lib/math/distribution';
import { Activity, AlertTriangle, CheckCircle2, Factory } from 'lucide-react';

export default function Lab19() {
  const [Vsource] = useState(11.0); // kV
  const [length] = useState(10); // km
  
  const [load1, setLoad1] = useState(500); // kW
  const [load2, setLoad2] = useState(800); // kW
  const [load3, setLoad3] = useState(1200); // kW

  const results = useMemo(() => calculateDistribution(
    Vsource, length, 
    0.3, 0.4, // R, X per km
    load1, 0.85, 2.0, // Load 1 at 2km
    load2, 0.85, 6.0, // Load 2 at 6km
    load3, 0.85, 10.0 // Load 3 at 10km
  ), [Vsource, length, load1, load2, load3]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Radial Feeder Loads (11kV)">
          <div className="text-xs text-gray-500 mb-4">A standard 11kV radial feeder with 3 industrial loads spaced along a 10km line. Adjust the power demand of each factory.</div>
          
          <SliderInput label="Factory 1 (at 2 km)" value={load1} min={0} max={2000} step={100} unit="kW" onChange={setLoad1} />
          <SliderInput label="Factory 2 (at 6 km)" value={load2} min={0} max={2000} step={100} unit="kW" onChange={setLoad2} />
          <SliderInput label="Factory 3 (at 10 km)" value={load3} min={0} max={2000} step={100} unit="kW" onChange={setLoad3} />
          
          <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-200">
             <strong>Compliance:</strong> Utility regulations require voltage at the furthest point to remain within 5% of nominal (10.45 kV).
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className={`rounded-xl border p-4 shadow-sm flex-none ${results.isCompliant ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 font-bold text-xl">
                 {results.isCompliant ? (
                    <><CheckCircle2 size={36} className="text-green-600"/> <span className="text-green-700">WITHIN LIMITS</span></>
                 ) : (
                    <><AlertTriangle size={36} className="text-red-600 animate-pulse"/> <span className="text-red-700">VOLTAGE DROP VIOLATION</span></>
                 )}
              </div>
              
              <div className="flex gap-6 border-l pl-4 border-gray-300">
                 <div className="text-center">
                    <div className="text-xs text-gray-600 font-bold uppercase">End-of-Line Voltage</div>
                    <div className={`text-2xl font-bold ${results.isCompliant ? 'text-blue-700' : 'text-red-600'}`}>{results.end_voltage} kV</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-gray-600 font-bold uppercase">Total Line Losses</div>
                    <div className="text-2xl font-bold text-orange-600">{results.total_loss_kW} kW</div>
                 </div>
              </div>
          </div>
        </div>

        {/* Visualizer: Single Line Diagram */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex items-center justify-between relative shadow-inner flex-none overflow-hidden h-32">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-xs">Single Line Diagram (Radial Feeder)</div>
           
           <div className="w-full h-full flex items-center mt-4">
              <div className="text-white text-center flex flex-col items-center mr-4">
                 <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
                 <div className="text-[10px] mt-1">Source<br/>11.0kV</div>
              </div>
              
              <div className="flex-1 h-1 bg-gray-500 relative">
                 {/* Node 1 */}
                 <div className="absolute top-0 left-[20%] w-0.5 h-6 bg-gray-500">
                    <Factory className={`absolute top-6 -left-3 ${load1 > 1500 ? 'text-red-400' : 'text-gray-400'}`} size={24} />
                    <div className="absolute -top-6 -left-4 text-[10px] text-gray-400">2km</div>
                 </div>
                 
                 {/* Node 2 */}
                 <div className="absolute top-0 left-[60%] w-0.5 h-6 bg-gray-500">
                    <Factory className={`absolute top-6 -left-3 ${load2 > 1500 ? 'text-red-400' : 'text-gray-400'}`} size={24} />
                    <div className="absolute -top-6 -left-4 text-[10px] text-gray-400">6km</div>
                 </div>
                 
                 {/* Node 3 */}
                 <div className="absolute top-0 left-[100%] w-0.5 h-6 bg-gray-500">
                    <Factory className={`absolute top-6 -left-3 ${load3 > 1500 ? 'text-red-400' : 'text-gray-400'}`} size={24} />
                    <div className="absolute -top-6 -left-4 text-[10px] text-gray-400">10km</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Graphs */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-2 shadow-sm min-h-[250px]">
            <Oscilloscope 
              title="Voltage Profile (Distance vs Voltage)"
              data={results.profile}
              xKey="distance"
              xLabel="Distance from Source (km)"
              yLabel="Voltage (kV)"
              lines={[
                { key: 'voltage', name: 'Voltage (kV)', color: results.isCompliant ? '#3b82f6' : '#ef4444' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 19: Distribution System Voltage Drop"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">In a radial distribution system, power flows in a single direction from the substation to the consumers. Because the distribution lines have impedance (R + jX), voltage drops as you move further away from the source.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Voltage Regulation:</strong> Utilities are legally required to deliver voltage within a strict tolerance (usually $\pm 5\%$). If the voltage drops too low, motors will overheat and electronics may fail.</li>
            <li><strong>Line Losses:</strong> Power lost as heat in the wires ($I^2R$). High loads at the end of a long line cause massive current draw, leading to exponential increases in both voltage drop and line losses.</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
