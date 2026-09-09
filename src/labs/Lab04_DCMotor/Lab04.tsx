import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateDCMotorCharacteristics } from '../../lib/math/dcmotor';

export default function Lab04() {
  const [Va, setVa] = useState(220); // Armature Voltage
  const [Ra, setRa] = useState(1.5); // Armature Resistance
  const [If, setIf] = useState(2.0); // Field Current
  const [Tl, setTl] = useState(20);  // Load Torque

  const results = useMemo(() => calculateDCMotorCharacteristics(Va, Ra, If, Tl), [Va, Ra, If, Tl]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="DC Motor Parameters">
          <SliderInput label="Armature Voltage (Va)" value={Va} min={0} max={300} unit="V" onChange={setVa} />
          <SliderInput label="Field Current (If)" value={If} min={0.5} max={5} step={0.1} unit="A" onChange={setIf} />
          <SliderInput label="Armature Resistance (Ra)" value={Ra} min={0.1} max={5} step={0.1} unit="Ω" onChange={setRa} />
          <div className="border-t pt-4 mt-2">
            <SliderInput label="Load Torque (Tl)" value={Tl} min={0} max={results.maxTorque * 0.9} step={1} unit="Nm" onChange={setTl} />
          </div>
        </InputPanel>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-1">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Real-Time Measurements</h3>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-semibold mb-1">Rotor Speed</div>
              <div className="text-2xl font-mono text-blue-900">{results.speed_rpm} <span className="text-sm">RPM</span></div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-sm text-red-600 font-semibold mb-1">Armature Current</div>
              <div className="text-2xl font-mono text-red-900">{results.Ia} <span className="text-sm">A</span></div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-semibold mb-1">Efficiency</div>
              <div className="text-2xl font-mono text-green-900">{results.efficiency}<span className="text-sm">%</span></div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600 font-semibold mb-1">Back EMF</div>
              <div className="text-2xl font-mono text-purple-900">{results.Eb} <span className="text-sm">V</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
           {/* Animated Motor Visualization */}
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">Visual Motor Assembly</div>
           <div className="relative">
             {/* Stator */}
             <div className="w-48 h-48 rounded-full border-8 border-slate-600 flex items-center justify-center bg-slate-800 shadow-2xl relative">
                {/* Rotor */}
                <div 
                  className="w-32 h-32 rounded-full border-4 border-amber-600 flex items-center justify-center bg-slate-700 relative"
                  style={{ animation: `spin ${results.speed_rpm > 0 ? 60 / results.speed_rpm : 0}s linear infinite` }}
                >
                  {/* Commutator segments */}
                  <div className="w-1 h-32 bg-amber-500 absolute"></div>
                  <div className="w-32 h-1 bg-amber-500 absolute"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-slate-900 z-10"></div>
                </div>
                {/* Field windings */}
                <div className="absolute -left-6 w-8 h-16 bg-orange-800 rounded"></div>
                <div className="absolute -right-6 w-8 h-16 bg-orange-800 rounded"></div>
             </div>
           </div>
           
           <style dangerouslySetInnerHTML={{__html: `
             @keyframes spin { 100% { transform: rotate(360deg); } }
           `}} />
        </div>
        
        <div className="h-64">
            <Oscilloscope 
              title="DC Motor Characteristics (Torque vs Speed & Current)"
              data={results.curve}
              xKey="torque"
              xLabel="Torque (Nm)"
              yLabel="Speed (RPM)"
              lines={[
                { key: 'speed', name: 'Speed (RPM)', color: '#3b82f6', yAxisId: 'left' },
                { key: 'current', name: 'Armature Current (A)', color: '#ef4444', yAxisId: 'right' },
                { key: 'efficiency', name: 'Efficiency (%)', color: '#10b981', yAxisId: 'right' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 4: DC Motor & Speed Control"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A DC motor converts direct current electrical energy into mechanical energy. The principles are based on electromagnetism.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Governing Equations</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Voltage Equation:</strong> V = Eb + Ia * Ra</li>
            <li><strong>Back EMF (Eb):</strong> Eb = k * Φ * ω</li>
            <li><strong>Torque (T):</strong> T = k * Φ * Ia</li>
          </ul>
          <p className="text-gray-700">By adjusting the Armature Voltage (Va) or the Field Current (If), we can control the speed of the motor under varying load conditions.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment module coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report generation module coming soon.</p></div>}
    />
  );
}
