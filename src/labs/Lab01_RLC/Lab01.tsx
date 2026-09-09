import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateRLCTransient, calculateRLCResonance } from '../../lib/math/rlc';

export default function Lab01() {
  const [R, setR] = useState(10); // Ohms
  const [L, setL] = useState(10); // mH
  const [C, setC] = useState(10); // uF
  const [V, setV] = useState(12); // Volts
  const [mode, setMode] = useState<'transient' | 'resonance'>('transient');

  const transientData = useMemo(() => calculateRLCTransient(R, L, C, V, 0.05, 200), [R, L, C, V]);
  const { fr, data: resonanceData } = useMemo(() => calculateRLCResonance(R, L, C, V), [R, L, C, V]);

  // Derived properties for display
  const alpha = R / (2 * (L * 1e-3));
  const w0 = 1 / Math.sqrt((L * 1e-3) * (C * 1e-6));
  const dampingRatio = alpha / w0;
  
  let dampingType = "Underdamped";
  if (Math.abs(dampingRatio - 1) < 0.01) dampingType = "Critically Damped";
  else if (dampingRatio > 1) dampingType = "Overdamped";

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Circuit Parameters">
          <SliderInput label="Resistance (R)" value={R} min={1} max={100} unit="Ω" onChange={setR} />
          <SliderInput label="Inductance (L)" value={L} min={1} max={100} unit="mH" onChange={setL} />
          <SliderInput label="Capacitance (C)" value={C} min={1} max={100} unit="μF" onChange={setC} />
          <SliderInput label="Voltage (V)" value={V} min={1} max={50} unit="V" onChange={setV} />
          
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Analysis Mode</h4>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md ${mode === 'transient' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setMode('transient')}
              >
                Transient
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md ${mode === 'resonance' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setMode('resonance')}
              >
                AC Resonance
              </button>
            </div>
          </div>
        </InputPanel>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Calculated Results</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Resonant Freq (f₀):</span> <span className="font-mono font-medium">{fr.toFixed(2)} Hz</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Damping Ratio (ζ):</span> <span className="font-mono font-medium">{dampingRatio.toFixed(3)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Response Type:</span> <span className="font-medium text-blue-600">{dampingType}</span></div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="flex-1">
          {mode === 'transient' ? (
            <Oscilloscope 
              title="Transient Response (Step Input)"
              data={transientData}
              xKey="time_ms"
              xLabel="Time (ms)"
              yLabel="Voltage (V)"
              lines={[
                { key: 'voltage', name: 'Capacitor Voltage (V)', color: '#3b82f6', yAxisId: 'left' },
                { key: 'current', name: 'Current (mA)', color: '#ef4444', yAxisId: 'right' }
              ]}
            />
          ) : (
            <Oscilloscope 
              title="Frequency Response (AC Resonance)"
              data={resonanceData}
              xKey="frequency"
              xLabel="Frequency (Hz)"
              yLabel="Current (mA)"
              lines={[
                { key: 'current', name: 'Current (mA)', color: '#ef4444', yAxisId: 'left' },
                { key: 'phase', name: 'Phase Angle (°)', color: '#8b5cf6', yAxisId: 'right' }
              ]}
            />
          )}
        </div>
        <div className="h-48 bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-center">
           {/* Interactive Diagram Placeholder */}
           <div className="text-center">
             <div className="text-gray-400 mb-2">Circuit Diagram</div>
             <div className="font-mono text-xs p-4 bg-gray-50 border rounded-lg inline-block">
               [ V: {V}V ] ---- [ R: {R}Ω ] ---- [ L: {L}mH ] ---- [ C: {C}μF ] ---- GND
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 1: RLC Circuit – Transient & Resonance"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">The RLC circuit is a fundamental electrical circuit consisting of a Resistor (R), an Inductor (L), and a Capacitor (C), connected in series or in parallel.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Transient Response</h3>
          <p className="mb-2 text-gray-700">When a DC voltage is suddenly applied (step response), the circuit exhibits one of three behaviors based on the damping factor:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li><strong>Underdamped:</strong> The voltage oscillates as it settles to the final value.</li>
            <li><strong>Critically Damped:</strong> The voltage reaches the final value in the shortest time without oscillating.</li>
            <li><strong>Overdamped:</strong> The voltage slowly approaches the final value without oscillating.</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report generation module coming soon.</p></div>}
    />
  );
}
