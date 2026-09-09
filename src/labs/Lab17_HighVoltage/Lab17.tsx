import React, { useState, useMemo, useEffect } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculatePaschensLaw } from '../../lib/math/highVoltage';
import { Zap, ShieldAlert, Wind } from 'lucide-react';

export default function Lab17() {
  const [gasType, setGasType] = useState<'Air' | 'SF6'>('Air');
  const [pressure, setPressure] = useState(1.0); // atm
  const [gap, setGap] = useState(10); // mm
  const [appliedVoltage, setAppliedVoltage] = useState(10); // kV

  const [isSparking, setIsSparking] = useState(false);

  const results = useMemo(() => calculatePaschensLaw(gasType, pressure, gap), [gasType, pressure, gap]);

  // Check for breakdown
  useEffect(() => {
     if (appliedVoltage >= (results.Vb_kV as number)) {
         setIsSparking(true);
     } else {
         setIsSparking(false);
     }
  }, [appliedVoltage, results.Vb_kV]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Test Cell Configuration">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Dielectric Medium (Gas)</h4>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              value={gasType}
              onChange={(e) => setGasType(e.target.value as any)}
            >
              <option value="Air">Standard Air</option>
              <option value="SF6">Sulfur Hexafluoride (SF6)</option>
            </select>
          </div>
          
          <SliderInput label="Gas Pressure" value={pressure} min={0.1} max={5.0} step={0.1} unit="atm" onChange={setPressure} />
          <SliderInput label="Electrode Gap Distance" value={gap} min={1} max={50} step={1} unit="mm" onChange={setGap} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-red-700 flex items-center gap-2"><Zap size={16}/> High Voltage Source</h4>
             <SliderInput label="Applied Voltage" value={appliedVoltage} min={0} max={150} step={1} unit="kV" onChange={setAppliedVoltage} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className={`rounded-xl border p-4 shadow-sm flex-none ${isSparking ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 font-bold text-xl">
                 {isSparking ? (
                    <><ShieldAlert size={36} className="text-red-600 animate-pulse"/> <span className="text-red-700">DIELECTRIC BREAKDOWN</span></>
                 ) : (
                    <><Wind size={36} className="text-blue-500"/> <span className="text-slate-700">INSULATING STATE</span></>
                 )}
              </div>
              
              <div className="flex gap-6 border-l pl-4 border-gray-300">
                 <div className="text-center">
                    <div className="text-xs text-gray-600 font-bold uppercase">Applied Voltage</div>
                    <div className={`text-2xl font-bold ${isSparking ? 'text-red-600' : 'text-gray-800'}`}>{appliedVoltage} kV</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-gray-600 font-bold uppercase">Breakdown Threshold</div>
                    <div className="text-2xl font-bold text-purple-700">{results.Vb_kV} kV</div>
                 </div>
              </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex items-center justify-center relative shadow-inner h-64 flex-none overflow-hidden">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Electrode Test Cell</div>
           
           <div className="relative flex items-center justify-center w-full h-full">
              {/* Left Electrode (HV) */}
              <div className="absolute left-10 w-16 h-24 bg-gradient-to-r from-gray-500 to-gray-300 rounded-r-3xl shadow-lg border-r-4 border-gray-400 flex items-center justify-end" style={{ transform: `translateX(-${gap}px)` }}>
                 <div className="text-xs font-bold text-red-600 absolute -top-6 whitespace-nowrap">HV Terminal</div>
              </div>
              
              {/* Right Electrode (GND) */}
              <div className="absolute right-10 w-16 h-24 bg-gradient-to-l from-gray-500 to-gray-300 rounded-l-3xl shadow-lg border-l-4 border-gray-400 flex items-center justify-start" style={{ transform: `translateX(${gap}px)` }}>
                 <div className="text-xs font-bold text-green-500 absolute -top-6">GND</div>
              </div>

              {/* Spark Animation */}
              {isSparking && (
                 <svg className="absolute w-full h-24 z-10 animate-pulse" preserveAspectRatio="none">
                    <path d={`M ${150 - gap} 48 Q 200 ${Math.random()*100} 250 48 T ${350 + gap} 48`} stroke="#eab308" strokeWidth="4" fill="none" className="drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 10px #eab308)' }} />
                    <path d={`M ${150 - gap} 48 Q 200 ${Math.random()*100} 250 48 T ${350 + gap} 48`} stroke="#fff" strokeWidth="2" fill="none" />
                 </svg>
              )}
              
              {/* Gas Particles */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: gasType === 'SF6' ? 'radial-gradient(circle, #22c55e 1px, transparent 1px)' : 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: `${10 / pressure}px ${10 / pressure}px` }}></div>
           </div>
           
           <div className="absolute bottom-4 left-4 font-mono text-xs text-sky-400">Pressure: {pressure} atm | Gap: {gap} mm</div>
        </div>

        {/* Graphs */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-2 shadow-sm min-h-[250px]">
            <Oscilloscope 
              title="Paschen Curve (Breakdown Voltage vs p·d)"
              data={results.curve}
              xKey="pd"
              xLabel="Pressure × Gap (Torr·cm)"
              yLabel="Breakdown Voltage (kV)"
              lines={[
                { key: 'Vb_kV', name: `Vb (${gasType})`, color: gasType === 'SF6' ? '#10b981' : '#3b82f6' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 17: High Voltage Breakdown (Paschen's Law)"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">Paschen's Law governs the voltage required to trigger an electric arc across a gap in a gas. The breakdown voltage $V_b$ is a non-linear function of the product of gas pressure ($p$) and gap distance ($d$).</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>The Paschen Minimum:</strong> At a specific $p \cdot d$ value, the breakdown voltage reaches an absolute minimum. Decreasing the gap distance further actually <em>increases</em> the required voltage because there aren't enough gas molecules to trigger an electron avalanche!</li>
            <li><strong>SF6 (Sulfur Hexafluoride):</strong> An electronegative gas heavily used in modern Gas Insulated Substations (GIS). It "eats" free electrons, drastically increasing the breakdown voltage compared to standard air.</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
