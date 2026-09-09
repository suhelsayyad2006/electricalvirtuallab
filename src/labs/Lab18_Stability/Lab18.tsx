import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateStability } from '../../lib/math/stability';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Lab18() {
  const [Pm, setPm] = useState(1.0); // pu
  const [H, setH] = useState(5.0); // sec
  const [tc, setTc] = useState(0.2); // sec

  const results = useMemo(() => calculateStability(Pm, H, tc), [Pm, H, tc]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Generator & Fault Parameters">
          <SliderInput label="Mechanical Power (Pm)" value={Pm} min={0.5} max={1.4} step={0.05} unit="pu" onChange={setPm} />
          <SliderInput label="Generator Inertia (H)" value={H} min={2.0} max={10.0} step={0.5} unit="s" onChange={setH} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-red-700 flex items-center gap-2">Fault Clearing</h4>
             <SliderInput label="Fault Clearing Time (tc)" value={tc} min={0.05} max={0.5} step={0.01} unit="s" onChange={setTc} />
          </div>
          
          <div className="mt-4 bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
             <strong>Equal Area Criterion:</strong> The system remains stable if the Decelerating Area (above Pm) is greater than the Accelerating Area (below Pm).
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className={`rounded-xl border p-4 shadow-sm flex-none ${results.isStable ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 font-bold text-xl">
                 {results.isStable ? (
                    <><CheckCircle2 size={36} className="text-green-600"/> <span className="text-green-700">SYSTEM STABLE</span></>
                 ) : (
                    <><ShieldAlert size={36} className="text-red-600 animate-pulse"/> <span className="text-red-700">OUT OF STEP (UNSTABLE)</span></>
                 )}
              </div>
              
              <div className="flex gap-6 border-l pl-4 border-gray-300">
                 <div className="text-center">
                    <div className="text-xs text-gray-600 font-bold uppercase">Initial Angle (δ0)</div>
                    <div className="text-2xl font-bold text-blue-700">{results.delta_0}°</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-gray-600 font-bold uppercase">Crit. Clearing Time</div>
                    <div className="text-2xl font-bold text-purple-700">{results.tc_crit} s</div>
                 </div>
              </div>
          </div>
        </div>

        {/* Visualizer: Swing Equation Pendulum Analogy */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex items-center justify-center relative shadow-inner flex-none h-48 overflow-hidden">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Rotor Angle Analogy</div>
           
           <div className="relative w-full h-full flex justify-center">
               <div className="absolute top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
               {/* Pendulum Arm representing Rotor Angle */}
               <div 
                 className="absolute top-2 w-1 bg-gradient-to-b from-blue-400 to-blue-600 origin-top rounded-full flex justify-center items-end"
                 style={{ 
                     height: '100px', 
                     transform: `rotate(${results.isStable ? results.delta_0 : 90}deg)`,
                     transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                     animation: results.isStable ? 'none' : 'spin 2s linear infinite'
                 }}
               >
                   <div className="w-10 h-10 bg-slate-200 border-4 border-slate-400 rounded-full absolute -bottom-5 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <span className="text-[10px] font-bold text-slate-700">N</span>
                   </div>
               </div>
           </div>
           
           <div className="absolute bottom-4 right-4 font-mono text-xs text-slate-400">
               {results.isStable ? 'Rotor settles to new steady state' : 'Rotor slips poles (Loss of Synchronism)'}
           </div>
        </div>

        {/* Graphs */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-2 shadow-sm min-h-[250px]">
            <Oscilloscope 
              title="Power-Angle Curves (Equal Area Criterion)"
              data={results.curves}
              xKey="delta"
              xLabel="Rotor Angle (Degrees)"
              yLabel="Electrical Power (pu)"
              lines={[
                { key: 'P_pre', name: 'Pre-Fault', color: '#9ca3af', strokeDasharray: '5 5' },
                { key: 'P_during', name: 'During Fault', color: '#ef4444' },
                { key: 'P_post', name: 'Post-Fault', color: '#3b82f6' },
                { key: 'Pm', name: 'Mechanical Power', color: '#10b981' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 18: Power System Stability (Swing Equation)"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">Transient stability is the ability of a power system to maintain synchronism when subjected to a severe disturbance, such as a short-circuit fault.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>The Swing Equation:</strong> Governs the motion of the generator rotor. When a fault occurs, electrical power drops but mechanical power remains constant, causing the rotor to accelerate.</li>
            <li><strong>Critical Clearing Time (tc):</strong> The maximum time a fault can remain on the system before the generator accelerates past the point of no return.</li>
            <li><strong>Equal Area Criterion:</strong> A graphical method to determine stability without solving the differential equation. The area of acceleration (during the fault) must be less than or equal to the area of deceleration (after the fault is cleared).</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
