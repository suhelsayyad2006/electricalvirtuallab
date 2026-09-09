import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateFault } from '../../lib/math/faultSimulation';
import { Zap, AlertTriangle } from 'lucide-react';

export default function Lab10() {
  const [faultType, setFaultType] = useState<'SLG' | 'LL' | 'DLG' | 'LLL'>('SLG');
  const [faultLocation, setFaultLocation] = useState(50); // %
  const [lineLength, setLineLength] = useState(100); // km
  const [baseV, setBaseV] = useState(132); // kV

  const results = useMemo(() => calculateFault(faultType, faultLocation, lineLength, baseV), 
    [faultType, faultLocation, lineLength, baseV]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Fault Parameters">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Fault Type</h4>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setFaultType('SLG')} className={`py-2 text-xs font-bold rounded border ${faultType === 'SLG' ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>SLG (Line-Ground)</button>
               <button onClick={() => setFaultType('LL')} className={`py-2 text-xs font-bold rounded border ${faultType === 'LL' ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>LL (Line-Line)</button>
               <button onClick={() => setFaultType('DLG')} className={`py-2 text-xs font-bold rounded border ${faultType === 'DLG' ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>DLG (Double-Line-Ground)</button>
               <button onClick={() => setFaultType('LLL')} className={`py-2 text-xs font-bold rounded border ${faultType === 'LLL' ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>LLL (Three-Phase)</button>
            </div>
          </div>
          
          <div className="border-t pt-4">
             <SliderInput label="Base Voltage" value={baseV} min={11} max={400} step={11} unit="kV" onChange={setBaseV} />
             <SliderInput label="Total Line Length" value={lineLength} min={10} max={500} step={10} unit="km" onChange={setLineLength} />
             <SliderInput label="Fault Location" value={faultLocation} min={1} max={99} step={1} unit="% of line" onChange={setFaultLocation} />
          </div>
        </InputPanel>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-1">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
             <AlertTriangle size={18} className="text-red-500"/> Fault Analysis
          </h3>
          <div className="space-y-4">
             <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Peak Fault Currents (RMS)</div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                   <div className="bg-red-50 text-red-700 p-2 rounded text-center">
                      <div className="font-bold font-mono">{results.Ia} <span className="text-xs">kA</span></div>
                      <div className="text-[10px] uppercase">Phase A</div>
                   </div>
                   <div className="bg-yellow-50 text-yellow-700 p-2 rounded text-center">
                      <div className="font-bold font-mono">{results.Ib} <span className="text-xs">kA</span></div>
                      <div className="text-[10px] uppercase">Phase B</div>
                   </div>
                   <div className="bg-blue-50 text-blue-700 p-2 rounded text-center">
                      <div className="font-bold font-mono">{results.Ic} <span className="text-xs">kA</span></div>
                      <div className="text-[10px] uppercase">Phase C</div>
                   </div>
                </div>
             </div>
             
             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Relay Trip Time:</span>
                <span className="font-mono font-bold text-lg text-gray-800">{results.tripTime} ms</span>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Visual Single Line Diagram */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 relative overflow-hidden h-40 flex items-center shadow-inner">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Transmission Line Diagram</div>
           
           <div className="w-full relative flex items-center">
              {/* Substation A */}
              <div className="w-16 h-16 bg-slate-700 border-2 border-slate-500 rounded flex items-center justify-center text-white font-bold z-10">Sub A</div>
              
              {/* Transmission Line */}
              <div className="flex-1 h-2 bg-gray-400 relative">
                 {/* Fault Marker */}
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                   style={{ left: `${faultLocation}%` }}
                 >
                    <div className="text-red-500 animate-pulse"><Zap size={32} fill="currentColor"/></div>
                    <div className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap mt-1">
                       {faultType} Fault @ {faultLocation}%
                    </div>
                 </div>
              </div>
              
              {/* Substation B */}
              <div className="w-16 h-16 bg-slate-700 border-2 border-slate-500 rounded flex items-center justify-center text-white font-bold z-10">Sub B</div>
           </div>
        </div>

        {/* Current Waveforms */}
        <div className="flex-1 min-h-[200px]">
            <Oscilloscope 
              title="Phase Currents (Pre-Fault -> Fault -> Breaker Open)"
              data={results.waveforms}
              xKey="time"
              xLabel="Time (ms)"
              yLabel="Current (kA)"
              lines={[
                { key: 'ia', name: 'Phase A', color: '#ef4444' },
                { key: 'ib', name: 'Phase B', color: '#eab308' },
                { key: 'ic', name: 'Phase C', color: '#3b82f6' }
              ]}
            />
        </div>
        
        {/* Voltage Waveforms */}
        <div className="flex-1 min-h-[200px]">
            <Oscilloscope 
              title="Phase Voltages (Pre-Fault -> Fault -> Breaker Open)"
              data={results.waveforms}
              xKey="time"
              xLabel="Time (ms)"
              yLabel="Voltage (kV)"
              lines={[
                { key: 'va', name: 'Phase A', color: '#ef4444' },
                { key: 'vb', name: 'Phase B', color: '#eab308' },
                { key: 'vc', name: 'Phase C', color: '#3b82f6' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 10: Electrical Fault Simulation"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">Electrical faults in power systems cause massive surges of current that can destroy equipment. Protection systems (Relays and Circuit Breakers) must detect and isolate these faults within milliseconds.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Types of Faults</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>SLG (Single Line to Ground):</strong> Most common fault (70-80%). One phase touches the ground (e.g., a tree branch falls on a wire).</li>
            <li><strong>LL (Line to Line):</strong> Two phases short circuit together.</li>
            <li><strong>DLG (Double Line to Ground):</strong> Two phases touch the ground simultaneously.</li>
            <li><strong>LLL (Three-Phase):</strong> Most severe fault, but very rare (2-3%). All three phases short circuit.</li>
          </ul>
          <p className="text-gray-700">Notice on the oscilloscope that during the fault, the currents spike drastically, and the corresponding phase voltages drop (voltage dip/sag). Once the breaker trips (after the specified trip time), the current goes to zero, isolating the fault.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
