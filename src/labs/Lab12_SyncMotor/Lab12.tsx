import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateSyncMotor } from '../../lib/math/syncMotor';
import { Activity, AlertOctagon } from 'lucide-react';

export default function Lab12() {
  const [Pout, setPout] = useState(500); // kW
  const [Ef, setEf] = useState(4.5); // kV
  const [Vt, setVt] = useState(3.3); // kV

  const results = useMemo(() => calculateSyncMotor(Pout, Ef, Vt), [Pout, Ef, Vt]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Motor & Load Parameters">
          <SliderInput label="Mechanical Load (P)" value={Pout} min={100} max={2000} step={50} unit="kW" onChange={setPout} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Electrical Parameters</h4>
             <SliderInput label="Terminal Voltage (V) [L-N]" value={Vt} min={2.0} max={6.6} step={0.1} unit="kV" onChange={setVt} />
             <SliderInput label="Field Excitation (Ef) [L-N]" value={Ef} min={1.5} max={8.0} step={0.1} unit="kV" onChange={setEf} />
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
             <strong>Hint:</strong> Adjust the Field Excitation (Ef) to observe how the motor transitions between Lagging, Unity, and Leading power factors (V-Curve behavior).
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className={`rounded-xl border p-4 shadow-sm flex-none ${results.lostSync ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {results.lostSync ? (
                 <div className="flex items-center gap-3 text-red-600 font-bold text-xl">
                    <AlertOctagon size={32} />
                    MACHINE LOST SYNCHRONISM
                 </div>
              ) : (
                 <div className="flex gap-6 w-full justify-around">
                    <div className="text-center">
                       <div className="text-xs text-gray-500 font-bold uppercase">Armature Current (Ia)</div>
                       <div className="text-3xl font-bold text-blue-700">{results.Ia} <span className="text-lg">A</span></div>
                    </div>
                    <div className="text-center">
                       <div className="text-xs text-gray-500 font-bold uppercase">Power Factor</div>
                       <div className={`text-3xl font-bold ${results.pf_type === 'Leading' ? 'text-green-600' : (results.pf_type === 'Lagging' ? 'text-orange-600' : 'text-emerald-600')}`}>
                          {results.pf} <span className="text-sm uppercase block mt-1">{results.pf_type}</span>
                       </div>
                    </div>
                    <div className="text-center">
                       <div className="text-xs text-gray-500 font-bold uppercase">Load Angle (δ)</div>
                       <div className="text-3xl font-bold text-indigo-700">{results.delta}°</div>
                    </div>
                 </div>
              )}
          </div>
        </div>

        {/* Graphs */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex flex-col">
               <Oscilloscope 
                 title="V-Curve (Armature Current vs Excitation)"
                 data={results.curves}
                 xKey="Ef"
                 xLabel="Excitation Voltage Ef (kV)"
                 yLabel="Armature Current (A)"
                 lines={[
                   { key: 'Ia', name: 'Ia (A)', color: '#2563eb' }
                 ]}
               />
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex flex-col">
               <Oscilloscope 
                 title="Inverted V-Curve (Power Factor vs Excitation)"
                 data={results.curves}
                 xKey="Ef"
                 xLabel="Excitation Voltage Ef (kV)"
                 yLabel="Power Factor"
                 lines={[
                   { key: 'PF', name: 'Power Factor', color: '#16a34a' }
                 ]}
               />
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 12: Synchronous Motor V-Curves"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A synchronous motor has a unique property: its power factor can be controlled purely by varying its DC field excitation.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Under-excited (Ef &lt; V):</strong> The motor draws lagging reactive power (behaves like an inductor).</li>
            <li><strong>Normally excited:</strong> The motor draws zero reactive power (Unity Power Factor). Armature current is at its absolute minimum.</li>
            <li><strong>Over-excited (Ef &gt; V):</strong> The motor supplies reactive power to the grid (behaves like a capacitor, known as a synchronous condenser) and operates at a leading power factor.</li>
          </ul>
          <p className="text-gray-700">Plotting Armature Current vs Excitation yields a "V-shaped" curve. Plotting Power Factor vs Excitation yields an "Inverted V-shaped" curve.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
