import React, { useState, useMemo, useEffect } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateRelay } from '../../lib/math/relays';
import { Clock, ShieldAlert } from 'lucide-react';

export default function Lab11() {
  const [Ifault, setIfault] = useState(2500); // A
  const [CTp, setCTp] = useState(400); // A
  const [CTs] = useState(5); // A
  const [PS, setPS] = useState(100); // %
  const [TMS, setTMS] = useState(0.5); // Multiplier
  const [curveType, setCurveType] = useState<'standard' | 'very' | 'extremely'>('standard');

  const [isFaulting, setIsFaulting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [tripped, setTripped] = useState(false);

  const results = useMemo(() => calculateRelay(Ifault, CTp, CTs, PS, TMS, curveType), 
    [Ifault, CTp, CTs, PS, TMS, curveType]);

  // Relay Trip Animation Logic
  useEffect(() => {
    let interval: any;
    if (isFaulting && !tripped) {
       interval = setInterval(() => {
          setTimer(prev => {
             const next = prev + 0.05;
             if (typeof results.t_trip === 'number' && next >= results.t_trip) {
                 setTripped(true);
                 setIsFaulting(false);
                 return results.t_trip;
             }
             // If no trip
             if (results.t_trip === 'No Trip' && next > 5) {
                 setIsFaulting(false);
                 return 0;
             }
             return next;
          });
       }, 50);
    }
    return () => clearInterval(interval);
  }, [isFaulting, tripped, results.t_trip]);

  const handleTestFault = () => {
      setTimer(0);
      setTripped(false);
      setIsFaulting(true);
  };

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Relay & Fault Settings">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">IEC Curve Type</h4>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              value={curveType}
              onChange={(e) => setCurveType(e.target.value as any)}
            >
              <option value="standard">Standard Inverse</option>
              <option value="very">Very Inverse</option>
              <option value="extremely">Extremely Inverse</option>
            </select>
          </div>
          
          <SliderInput label="Fault Current (Primary)" value={Ifault} min={100} max={10000} step={100} unit="A" onChange={setIfault} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Relay Configuration</h4>
             <SliderInput label="CT Primary Rating" value={CTp} min={100} max={1000} step={100} unit="A" onChange={setCTp} />
             <div className="text-xs text-gray-500 mb-4 ml-1">CT Secondary fixed at 5A</div>
             
             <SliderInput label="Plug Setting (PS)" value={PS} min={50} max={200} step={25} unit="%" onChange={setPS} />
             <SliderInput label="Time Multiplier (TMS)" value={TMS} min={0.1} max={1.0} step={0.1} unit="" onChange={setTMS} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-none">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex gap-6">
                 <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Relay Current</div>
                    <div className="text-2xl font-bold text-gray-800">{results.I_relay} A</div>
                 </div>
                 <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Pickup Current</div>
                    <div className="text-2xl font-bold text-blue-600">{results.I_pickup} A</div>
                 </div>
                 <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">PSM</div>
                    <div className="text-2xl font-bold text-orange-600">{results.PSM}</div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 border-l pl-4">
                 <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 font-bold uppercase">Calculated Trip Time</div>
                    <div className="text-2xl font-bold text-red-600">{typeof results.t_trip === 'number' ? `${results.t_trip} s` : results.t_trip}</div>
                 </div>
                 
                 <button 
                   onClick={handleTestFault}
                   disabled={isFaulting || typeof results.t_trip === 'string'}
                   className="ml-4 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                 >
                   <ShieldAlert size={20} /> INJECT FAULT
                 </button>
              </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-none">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative shadow-inner h-48">
               <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Induction Disk Relay</div>
               
               {/* Animated Relay Disk */}
               <div className="relative w-24 h-24 mt-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-600 bg-gradient-to-br from-slate-400 to-slate-500 shadow-xl flex items-center justify-center">
                     <div className="w-1 h-12 bg-red-500 absolute origin-bottom -top-6 rounded shadow-sm"
                          style={{ 
                              transform: `rotate(${tripped ? 90 : (isFaulting ? (timer / (results.t_trip as number)) * 90 : 0)}deg)`,
                              transition: isFaulting ? 'transform 0.05s linear' : 'transform 0.5s ease-out'
                          }}
                     ></div>
                     <div className="w-4 h-4 bg-slate-800 rounded-full z-10 border-2 border-slate-400"></div>
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative shadow-inner h-48">
               <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm flex items-center gap-2"><Clock size={16}/> Trip Timer</div>
               
               <div className={`font-mono text-6xl font-bold tracking-wider ${tripped ? 'text-red-500 animate-pulse' : (isFaulting ? 'text-yellow-400' : 'text-slate-600')}`}>
                  {timer.toFixed(2)}<span className="text-2xl">s</span>
               </div>
               
               {tripped && <div className="absolute bottom-4 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded uppercase tracking-widest">Breaker Tripped</div>}
            </div>
        </div>

        {/* Graphs */}
        <div className="flex-1 min-h-[250px]">
            <Oscilloscope 
              title="IDMT Characteristic Curve (Time vs PSM)"
              data={results.curve}
              xKey="psm"
              xLabel="Plug Setting Multiplier (PSM)"
              yLabel="Operating Time (s)"
              lines={[
                { key: 'time', name: 'Trip Time (s)', color: '#3b82f6', yAxisId: 'left' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 11: Protective Relays (IDMT)"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">An Inverse Definite Minimum Time (IDMT) relay operates such that its operating time is inversely proportional to the fault current magnitude. The higher the fault current, the faster it trips.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Settings</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Plug Setting (PS):</strong> Determines the pickup current. Pickup = CT_Secondary × (PS / 100).</li>
            <li><strong>Plug Setting Multiplier (PSM):</strong> The severity of the fault relative to pickup. PSM = Fault_Current / Pickup. The relay only operates if PSM &gt; 1.</li>
            <li><strong>Time Multiplier Setting (TMS):</strong> Shifts the entire curve up or down to coordinate with other relays in the network.</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
