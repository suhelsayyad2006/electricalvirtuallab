import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculatePIDResponse } from '../../lib/math/pidControl';
import { Activity, Settings, RotateCcw } from 'lucide-react';

export default function Lab20() {
  const [Kp, setKp] = useState(10);
  const [Ki, setKi] = useState(5);
  const [Kd, setKd] = useState(0.1);
  const [setpoint, setSetpoint] = useState(100); // rad/s
  const [disturbance, setDisturbance] = useState(5); // Nm

  const results = useMemo(() => calculatePIDResponse(Kp, Ki, Kd, setpoint, disturbance), [Kp, Ki, Kd, setpoint, disturbance]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="PID Controller Tuning">
          <SliderInput label="Proportional (Kp)" value={Kp} min={0} max={50} step={1} unit="" onChange={setKp} />
          <SliderInput label="Integral (Ki)" value={Ki} min={0} max={20} step={0.5} unit="" onChange={setKi} />
          <SliderInput label="Derivative (Kd)" value={Kd} min={0} max={2} step={0.05} unit="" onChange={setKd} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">System Parameters</h4>
             <SliderInput label="Target Speed (Setpoint)" value={setpoint} min={50} max={200} step={10} unit="rad/s" onChange={setSetpoint} />
             <SliderInput label="Load Disturbance (at t=2.5s)" value={disturbance} min={0} max={20} step={1} unit="Nm" onChange={setDisturbance} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-none">
          <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Overshoot</div>
                 <div className={`text-2xl font-bold ${results.overshoot_percent > 20 ? 'text-red-600' : 'text-green-600'}`}>
                    {results.overshoot_percent}%
                 </div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Settling Time</div>
                 <div className="text-2xl font-bold text-blue-600">
                    {results.settling_time < 5.0 ? `${results.settling_time}s` : '> 5.0s'}
                 </div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center border">
                 <div className="text-[10px] text-gray-500 font-bold uppercase">Steady State Error</div>
                 <div className={`text-2xl font-bold ${results.steady_state_error > 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {results.steady_state_error}
                 </div>
              </div>
          </div>
        </div>

        {/* Visualizer: Block Diagram & Motor Animation */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative shadow-inner flex-none h-48 overflow-hidden">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Control Loop</div>
           
           <div className="w-full flex items-center justify-center gap-4 mt-6 text-xs text-white font-mono">
              <div className="flex flex-col items-center">
                  <div className="bg-blue-600 px-3 py-2 rounded">Setpoint</div>
                  <div className="h-4 w-0.5 bg-gray-500"></div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-slate-700 p-2 rounded-full border-2 border-slate-500 w-8 h-8 flex items-center justify-center">Σ</div>
              <div className="text-gray-400">→</div>
              <div className="bg-green-600 p-3 rounded border border-green-500 text-center">
                 PID Controller<br/><span className="text-[10px] opacity-80">Kp={Kp} Ki={Ki} Kd={Kd}</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-orange-600 p-3 rounded border border-orange-500 flex items-center gap-2">
                 <RotateCcw className="animate-spin" style={{ animationDuration: `${300 / setpoint}s` }} size={16}/>
                 DC Motor Plant
              </div>
           </div>
           
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-20 border-b-2 border-l-2 border-gray-500 rounded-bl-xl border-dashed"></div>
           <div className="absolute bottom-6 right-1/4 -translate-y-1/2 text-gray-400 text-[10px]">Feedback Loop</div>
        </div>

        {/* Graphs */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-2 shadow-sm min-h-[250px]">
            <Oscilloscope 
              title="Step Response & Disturbance Rejection"
              data={results.response}
              xKey="time"
              xLabel="Time (Seconds)"
              yLabel="Speed (rad/s)"
              lines={[
                { key: 'setpoint', name: 'Setpoint', color: '#9ca3af', strokeDasharray: '5 5' },
                { key: 'speed', name: 'Motor Speed', color: '#3b82f6' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 20: Motor Control Systems (PID Tuning)"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A Proportional-Integral-Derivative (PID) controller continuously calculates an error value as the difference between a desired setpoint and a measured process variable.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Proportional (Kp):</strong> Provides an overall control action proportional to the current error. Too high causes oscillation and overshoot.</li>
            <li><strong>Integral (Ki):</strong> Integrates past errors to eliminate steady-state error. It ensures the motor exactly hits the setpoint, but can cause sluggishness or windup.</li>
            <li><strong>Derivative (Kd):</strong> Predicts future errors based on the rate of change. It dampens the system, reducing overshoot, but is highly sensitive to noise.</li>
          </ul>
          <p className="text-gray-700 mt-4"><strong>Objective:</strong> Tune the controller to achieve a fast settling time, minimal overshoot, and zero steady-state error, even when a load disturbance is injected at t=2.5s.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
