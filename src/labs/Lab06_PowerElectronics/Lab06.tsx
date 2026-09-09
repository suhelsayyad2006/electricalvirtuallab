import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateConverter } from '../../lib/math/powerElectronics';

export default function Lab06() {
  const [type, setType] = useState<'buck' | 'boost' | 'buck-boost'>('buck');
  const [Vin, setVin] = useState(24); // V
  const [D, setD] = useState(0.5); // Duty Cycle
  const [f_sw, setFsw] = useState(20); // kHz
  const [R, setR] = useState(10); // Ohms
  const [L, setL] = useState(100); // mH
  const [C, setC] = useState(47); // uF

  const results = useMemo(() => calculateConverter(Vin, D, f_sw, R, L, C, type), 
    [Vin, D, f_sw, R, L, C, type]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Converter Parameters">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Topology</h4>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setType('buck')}
                className={`flex-1 py-1.5 text-xs font-bold rounded ${type === 'buck' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                BUCK (Step-Down)
              </button>
              <button 
                onClick={() => setType('boost')}
                className={`flex-1 py-1.5 text-xs font-bold rounded ${type === 'boost' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                BOOST (Step-Up)
              </button>
              <button 
                onClick={() => setType('buck-boost')}
                className={`flex-1 py-1.5 text-xs font-bold rounded ${type === 'buck-boost' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                BUCK-BOOST
              </button>
            </div>
          </div>
          
          <SliderInput label="Input Voltage (Vin)" value={Vin} min={5} max={100} unit="V" onChange={setVin} />
          <SliderInput label="Duty Cycle (D)" value={D} min={0.05} max={0.95} step={0.05} unit="" onChange={setD} />
          <SliderInput label="Switching Frequency" value={f_sw} min={1} max={100} unit="kHz" onChange={setFsw} />
          
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Filter & Load</h4>
            <SliderInput label="Inductor (L)" value={L} min={10} max={1000} step={10} unit="mH" onChange={setL} />
            <SliderInput label="Capacitor (C)" value={C} min={1} max={500} step={1} unit="μF" onChange={setC} />
            <SliderInput label="Load Resistor (R)" value={R} min={1} max={100} unit="Ω" onChange={setR} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Output Voltage</div>
             <div className="text-2xl font-bold text-blue-600 mt-1">{results.Vout} V</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Output Current</div>
             <div className="text-2xl font-bold text-red-600 mt-1">{results.Iout} A</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Voltage Ripple</div>
             <div className="text-xl font-bold text-gray-800 mt-1">{results.rippleV} V</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Conduction Mode</div>
             <div className={`text-xl font-bold mt-1 ${results.isCCM ? 'text-green-600' : 'text-orange-500'}`}>
               {results.isCCM ? 'CCM' : 'DCM'}
             </div>
          </div>
        </div>

        <div className="flex-1 min-h-[200px]">
          <Oscilloscope 
            title="PWM Gate Signal"
            data={results.waveforms}
            xKey="time"
            xLabel="Time (μs)"
            yLabel="Gate"
            lines={[
              { key: 'pwm', name: 'PWM Signal (0-1)', color: '#10b981' }
            ]}
          />
        </div>
        
        <div className="flex-1 min-h-[250px]">
          <Oscilloscope 
            title="Output Voltage & Inductor Current"
            data={results.waveforms}
            xKey="time"
            xLabel="Time (μs)"
            yLabel="Value"
            lines={[
              { key: 'Vout', name: 'Output Voltage (V)', color: '#3b82f6', yAxisId: 'left' },
              { key: 'IL', name: 'Inductor Current (A)', color: '#ef4444', yAxisId: 'right' }
            ]}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 6: Power Electronics Converters"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">DC-DC Converters use high-frequency switching to step-up or step-down DC voltages efficiently.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Buck Converter:</strong> Steps down voltage. Vout = D * Vin.</li>
            <li><strong>Boost Converter:</strong> Steps up voltage. Vout = Vin / (1 - D).</li>
            <li><strong>Buck-Boost Converter:</strong> Inverts polarity and can step up or down. Vout = -Vin * [D / (1-D)].</li>
          </ul>
          <p className="text-gray-700 mt-4"><strong>CCM vs DCM:</strong> Continuous Conduction Mode (CCM) occurs when the inductor current never falls to zero. Discontinuous Conduction Mode (DCM) happens at low loads when the inductor completely discharges during the switching cycle.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
