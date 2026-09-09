import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateInductionMotor } from '../../lib/math/inductionMotor';
import { RefreshCcw } from 'lucide-react';

export default function Lab05() {
  const [V_line, setV_line] = useState(415); // V
  const [f, setF] = useState(50); // Hz
  const [poles, setPoles] = useState(4); 
  const [Tl, setTl] = useState(10); // Load Torque (Nm)

  const results = useMemo(() => calculateInductionMotor(V_line, f, poles, Tl), 
    [V_line, f, poles, Tl]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Induction Motor Parameters">
          <SliderInput label="Supply Voltage (V Line)" value={V_line} min={200} max={600} unit="V" onChange={setV_line} />
          <SliderInput label="Frequency" value={f} min={10} max={100} unit="Hz" onChange={setF} />
          
          <div className="mb-4 mt-2">
            <label className="text-sm font-medium text-gray-700 block mb-2">Number of Poles</label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map(p => (
                <button 
                  key={p}
                  onClick={() => setPoles(p)}
                  className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition ${poles === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
             <SliderInput label="Load Torque" value={Tl} min={0} max={results.maxTorque * 1.2} step={1} unit="Nm" onChange={setTl} />
             {Tl > results.maxTorque && (
                 <div className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-200 mt-2">
                     Warning: Motor Stalled (Torque &gt; Breakdown Torque)
                 </div>
             )}
          </div>
        </InputPanel>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-1">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Real-Time Telemetry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Rotor Speed</div>
              <div className="text-2xl font-mono font-bold text-blue-700">{results.speed} <span className="text-sm">RPM</span></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Synch. Speed</div>
              <div className="text-xl font-mono text-gray-600">{results.Ns} <span className="text-sm">RPM</span></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Slip</div>
              <div className="text-xl font-mono text-orange-600">{(results.slip * 100).toFixed(2)} %</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Stator Current</div>
              <div className="text-xl font-mono text-red-600">{results.I1} <span className="text-sm">A</span></div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 uppercase font-semibold">Power Factor</div>
              <div className="text-xl font-mono text-green-700">{results.pf}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Visualizer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex items-center justify-center relative shadow-inner overflow-hidden h-64">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm flex items-center gap-2">
             <RefreshCcw size={16} className="animate-spin" style={{animationDuration: '3s'}}/>
             Magnetic Field & Rotor Animation
           </div>
           
           <div className="relative w-40 h-40">
             {/* Stator Magnetic Field (Rotates at Ns) */}
             <div 
               className="absolute inset-0 border-8 border-dashed border-blue-500/50 rounded-full"
               style={{ animation: `spin ${results.Ns > 0 ? 60 / results.Ns : 0}s linear infinite` }}
             ></div>
             
             {/* Rotor (Rotates at N_rotor) */}
             <div 
               className="absolute inset-2 bg-slate-700 rounded-full border-4 border-amber-600 flex items-center justify-center overflow-hidden shadow-xl"
               style={{ animation: `spin ${results.speed > 0 ? 60 / results.speed : 0}s linear infinite` }}
             >
                {/* Squirrel Cage Bars representation */}
                {[0, 45, 90, 135].map(deg => (
                   <div key={deg} className="absolute w-full h-2 bg-slate-500/30" style={{ transform: `rotate(${deg}deg)` }}></div>
                ))}
                <div className="w-6 h-6 bg-slate-800 rounded-full z-10 border-2 border-slate-900"></div>
             </div>
           </div>
           
           <style dangerouslySetInnerHTML={{__html: `
             @keyframes spin { 100% { transform: rotate(360deg); } }
           `}} />
        </div>

        {/* Torque-Speed Curve */}
        <div className="flex-1">
            <Oscilloscope 
              title="Torque-Speed Characteristic Curve"
              data={results.curve}
              xKey="speed"
              xLabel="Rotor Speed (RPM)"
              yLabel="Torque (Nm)"
              lines={[
                { key: 'torque', name: 'Developed Torque (Nm)', color: '#3b82f6', yAxisId: 'left' },
                { key: 'current', name: 'Rotor Current (A)', color: '#ef4444', yAxisId: 'right' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 5: Three-Phase Induction Motor"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">The 3-phase induction motor is the most common electric motor in industry. It operates on the principle of electromagnetic induction where a rotating magnetic field in the stator induces a current in the rotor.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Key Concepts</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Synchronous Speed (Ns):</strong> The speed of the rotating magnetic field, Ns = 120 * f / P.</li>
            <li><strong>Slip (s):</strong> The relative difference between synchronous speed and rotor speed. s = (Ns - Nr) / Ns. A motor must have slip to generate torque!</li>
            <li><strong>Torque-Speed Curve:</strong> Shows starting torque, pull-out (breakdown) torque, and the normal operating region (where the curve is nearly linear).</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
