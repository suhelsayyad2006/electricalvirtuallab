import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateThreePhase } from '../../lib/math/threePhase';

export default function Lab02() {
  const [Vll, setVll] = useState(415); // V
  const [f, setF] = useState(50); // Hz
  const [balanced, setBalanced] = useState(true);
  
  // Phase A Load
  const [zMagA, setZMagA] = useState(20);
  const [pfA, setPfA] = useState(0.8);
  
  // Phase B/C Loads (used only if unbalanced)
  const [zMagB, setZMagB] = useState(20);
  const [pfB, setPfB] = useState(0.8);
  const [zMagC, setZMagC] = useState(20);
  const [pfC, setPfC] = useState(0.8);

  const results = useMemo(() => {
    const loads = balanced 
      ? [{Z: zMagA, pf: pfA}, {Z: zMagA, pf: pfA}, {Z: zMagA, pf: pfA}]
      : [{Z: zMagA, pf: pfA}, {Z: zMagB, pf: pfB}, {Z: zMagC, pf: pfC}];
      
    return calculateThreePhase(Vll, f, loads);
  }, [Vll, f, balanced, zMagA, pfA, zMagB, pfB, zMagC, pfC]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Three-Phase Source & Load">
          <SliderInput label="Line-to-Line Voltage" value={Vll} min={100} max={600} step={5} unit="V" onChange={setVll} />
          <SliderInput label="Frequency" value={f} min={50} max={60} step={1} unit="Hz" onChange={setF} />
          
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-700">Load Conditions</h4>
              <button 
                onClick={() => setBalanced(!balanced)}
                className={`px-3 py-1 text-xs font-bold rounded ${balanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {balanced ? 'BALANCED' : 'UNBALANCED'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 block">Phase A Load</span>
                <SliderInput label="Impedance (Z)" value={zMagA} min={1} max={100} unit="Ω" onChange={setZMagA} />
                <SliderInput label="Power Factor" value={pfA} min={0.1} max={1.0} step={0.05} unit="" onChange={setPfA} />
              </div>
              
              {!balanced && (
                <>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2 block">Phase B Load</span>
                    <SliderInput label="Impedance (Z)" value={zMagB} min={1} max={100} unit="Ω" onChange={setZMagB} />
                    <SliderInput label="Power Factor" value={pfB} min={0.1} max={1.0} step={0.05} unit="" onChange={setPfB} />
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 block">Phase C Load</span>
                    <SliderInput label="Impedance (Z)" value={zMagC} min={1} max={100} unit="Ω" onChange={setZMagC} />
                    <SliderInput label="Power Factor" value={pfC} min={0.1} max={1.0} step={0.05} unit="" onChange={setPfC} />
                  </div>
                </>
              )}
            </div>
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Total Real Power</div>
             <div className="text-xl font-bold text-gray-800 mt-1">{(results.power.P_tot / 1000).toFixed(2)} kW</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Total Reactive Power</div>
             <div className="text-xl font-bold text-gray-800 mt-1">{(results.power.Q_tot / 1000).toFixed(2)} kVAR</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Apparent Power</div>
             <div className="text-xl font-bold text-gray-800 mt-1">{(results.power.S_tot / 1000).toFixed(2)} kVA</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-red-500 font-medium">Neutral Current</div>
             <div className="text-xl font-bold text-red-600 mt-1">{results.phasors.In.mag.toFixed(2)} A</div>
          </div>
        </div>

        <div className="flex-1 min-h-[250px]">
          <Oscilloscope 
            title="Three-Phase Voltages (Line-to-Neutral)"
            data={results.waveforms}
            xKey="time"
            xLabel="Time (ms)"
            yLabel="Voltage (V)"
            lines={[
              { key: 'va', name: 'Phase A Voltage', color: '#ef4444' }, // Red
              { key: 'vb', name: 'Phase B Voltage', color: '#eab308' }, // Yellow
              { key: 'vc', name: 'Phase C Voltage', color: '#3b82f6' }  // Blue
            ]}
          />
        </div>
        
        <div className="flex-1 min-h-[250px]">
          <Oscilloscope 
            title="Three-Phase Currents"
            data={results.waveforms}
            xKey="time"
            xLabel="Time (ms)"
            yLabel="Current (A)"
            lines={[
              { key: 'ia', name: 'Phase A Current', color: '#ef4444' }, // Red
              { key: 'ib', name: 'Phase B Current', color: '#eab308' }, // Yellow
              { key: 'ic', name: 'Phase C Current', color: '#3b82f6' }  // Blue
            ]}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 2: Three-Phase Power System"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A three-phase power system is an AC electrical network that consists of three alternating currents of the same frequency, which reach their peak values at different times, with a phase separation of 120 degrees.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Balanced vs. Unbalanced Loads</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Balanced Load:</strong> The impedances in all three phases are identical in magnitude and phase angle. The neutral current is precisely zero.</li>
            <li><strong>Unbalanced Load:</strong> The impedances differ, causing the currents in each phase to vary. This results in a non-zero neutral current flowing back to the source (in a wye-connected system).</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
