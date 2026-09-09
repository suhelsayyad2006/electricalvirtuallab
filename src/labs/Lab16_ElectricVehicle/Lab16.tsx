import React, { useState, useEffect, useRef } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateEVPowertrain } from '../../lib/math/evPowertrain';
import { Battery, Zap, Gauge, Car, Activity } from 'lucide-react';

export default function Lab16() {
  const [throttle, setThrottle] = useState(50); // %
  const [incline, setIncline] = useState(0); // degrees
  const [mass, setMass] = useState(1800); // kg
  const [battCap, setBattCap] = useState(75); // kWh

  // Live state for interactive driving
  const [speed, setSpeed] = useState(0); // km/h
  const [soc, setSoc] = useState(100); // %
  
  const lastTime = useRef(Date.now());

  const results = calculateEVPowertrain(throttle, incline, battCap, mass, speed);

  // Real-time integration loop
  useEffect(() => {
    const interval = setInterval(() => {
       const now = Date.now();
       const dt = (now - lastTime.current) / 1000; // seconds
       lastTime.current = now;
       
       setSpeed(prev => {
          let next = prev + (results.acceleration * 3.6 * dt);
          if (next < 0) next = 0;
          if (next > 200) next = 200; // top speed limit
          return next;
       });
       
       setSoc(prev => {
          // Power in kW, energy in kWh. 
          // Energy consumed in dt = Power * (dt / 3600)
          const energy_consumed = results.P_batt_kW * (dt / 3600);
          let next = prev - (energy_consumed / battCap) * 100;
          if (next > 100) next = 100;
          if (next < 0) next = 0;
          return next;
       });
       
    }, 50); // 20 FPS simulation
    return () => clearInterval(interval);
  }, [results.acceleration, results.P_batt_kW, battCap]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto">
        <InputPanel title="EV Controls & Specs">
          <div className="border-b pb-4 mb-4">
             <h4 className="font-semibold text-sm mb-2 text-gray-700 flex items-center gap-2"><Gauge size={16}/> Driver Inputs</h4>
             <SliderInput label="Throttle / Accelerator" value={throttle} min={0} max={100} step={1} unit="%" onChange={setThrottle} />
             <div className="text-xs text-gray-500 mt-1 italic">Set throttle to 0 on a downhill to engage Regen Braking.</div>
          </div>
          
          <div className="border-b pb-4 mb-4">
             <h4 className="font-semibold text-sm mb-2 text-gray-700 flex items-center gap-2"><Car size={16}/> Environment</h4>
             <SliderInput label="Road Incline" value={incline} min={-15} max={20} step={1} unit="°" onChange={setIncline} />
             <div className="text-xs text-gray-500 mt-1">{incline > 0 ? 'Uphill' : (incline < 0 ? 'Downhill' : 'Flat Road')}</div>
          </div>
          
          <div>
             <h4 className="font-semibold text-sm mb-2 text-gray-700 flex items-center gap-2"><Battery size={16}/> Vehicle Specs</h4>
             <SliderInput label="Vehicle Mass" value={mass} min={1200} max={3000} step={100} unit="kg" onChange={setMass} />
             <SliderInput label="Battery Capacity" value={battCap} min={40} max={120} step={5} unit="kWh" onChange={setBattCap} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
           <div className="bg-slate-900 text-white p-4 rounded-xl shadow-inner border border-slate-700 flex flex-col items-center justify-center">
              <Gauge size={24} className="mb-1 text-sky-400" />
              <div className="text-3xl font-mono font-bold">{speed.toFixed(0)}</div>
              <div className="text-xs font-bold uppercase text-slate-400">km/h</div>
           </div>
           
           <div className="bg-slate-900 text-white p-4 rounded-xl shadow-inner border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
              <Battery size={24} className="mb-1 text-green-400 relative z-10" />
              <div className="text-3xl font-mono font-bold relative z-10">{soc.toFixed(1)}<span className="text-lg">%</span></div>
              <div className="text-xs font-bold uppercase text-slate-400 relative z-10">State of Charge</div>
              {/* Battery level background fill */}
              <div className="absolute bottom-0 left-0 right-0 bg-green-900/40" style={{ height: `${soc}%` }}></div>
           </div>

           <div className={`text-white p-4 rounded-xl shadow-inner border flex flex-col items-center justify-center ${results.isRegen ? 'bg-emerald-900 border-emerald-700' : 'bg-slate-900 border-slate-700'}`}>
              <Zap size={24} className={`mb-1 ${results.isRegen ? 'text-emerald-300' : 'text-orange-400'}`} />
              <div className="text-3xl font-mono font-bold">
                 {Math.abs(results.P_batt_kW).toFixed(1)}
              </div>
              <div className="text-xs font-bold uppercase text-slate-400">{results.isRegen ? 'kW (REGEN CHARGE)' : 'kW (DISCHARGE)'}</div>
           </div>

           <div className="bg-slate-900 text-white p-4 rounded-xl shadow-inner border border-slate-700 flex flex-col items-center justify-center">
              <Activity size={24} className="mb-1 text-purple-400" />
              <div className="text-3xl font-mono font-bold">{results.range_est === 999 ? '∞' : results.range_est}</div>
              <div className="text-xs font-bold uppercase text-slate-400">Est. Range (km)</div>
           </div>
        </div>

        {/* Real-time Environment Visualizer */}
        <div className="bg-sky-100 rounded-xl border border-sky-200 p-8 flex items-center justify-center relative overflow-hidden h-40 shadow-inner flex-none">
           {/* Incline Visual */}
           <div 
             className="absolute bottom-0 left-0 right-0 h-16 bg-slate-600 origin-bottom-left transition-transform duration-500 ease-out"
             style={{ transform: `rotate(${-incline}deg) scaleX(1.5)` }}
           >
              {/* Road markings */}
              <div className="w-full h-1 bg-yellow-400 absolute top-2 border-dashed border-t-8 border-transparent" style={{ animation: `slideLeft ${speed > 0 ? 100 / speed : 0}s linear infinite` }}></div>
           </div>
           
           {/* Car */}
           <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-slate-800 transition-transform duration-500 ease-out" style={{ transform: `rotate(${-incline}deg)` }}>
              <svg width="100" height="40" viewBox="0 0 100 40">
                 <path d="M10,40 L90,40 C95,40 100,35 100,30 L95,15 C93,10 85,5 75,5 L40,5 C30,5 20,10 15,20 L5,25 C2,27 0,30 0,35 C0,38 5,40 10,40 Z" fill="#1e293b"/>
                 {/* Wheels */}
                 <circle cx="25" cy="40" r="8" fill="#000" className={speed > 0 ? "animate-spin" : ""} style={{ transformOrigin: "25px 40px", animationDuration: speed > 0 ? `${10 / speed}s` : '0s' }}/>
                 <circle cx="75" cy="40" r="8" fill="#000" className={speed > 0 ? "animate-spin" : ""} style={{ transformOrigin: "75px 40px", animationDuration: speed > 0 ? `${10 / speed}s` : '0s' }}/>
                 <circle cx="25" cy="40" r="4" fill="#94a3b8"/>
                 <circle cx="75" cy="40" r="4" fill="#94a3b8"/>
              </svg>
           </div>
           
           <style dangerouslySetInnerHTML={{__html: `
             @keyframes slideLeft { 100% { transform: translateX(-50%); } }
           `}} />
        </div>

        {/* Graphs */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
            <Oscilloscope 
              title="Drive Cycle Projection (Full Throttle Acceleration 0-20s)"
              data={results.run_data}
              xKey="time"
              xLabel="Time (s)"
              yLabel="Speed / Power"
              lines={[
                { key: 'speed', name: 'Speed (km/h)', color: '#3b82f6', yAxisId: 'left' },
                { key: 'power', name: 'Power (kW)', color: '#ef4444', yAxisId: 'left' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 16: Electric Vehicle Powertrain"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">An EV powertrain consists of a high-voltage battery pack, an inverter, and a traction motor. The energy required to move the vehicle must overcome three main resistive forces:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Rolling Resistance:</strong> Friction between the tires and the road.</li>
            <li><strong>Aerodynamic Drag:</strong> Air resistance, which increases exponentially with the <em>square</em> of the vehicle's speed.</li>
            <li><strong>Grade Resistance:</strong> The force of gravity when climbing a hill.</li>
          </ul>
          <h3 className="text-xl font-semibold mb-2 mt-6">Regenerative Braking</h3>
          <p className="text-gray-700">Unlike internal combustion engine vehicles, EVs can reverse the flow of power. When coasting downhill, the motor acts as a generator, capturing the vehicle's kinetic and potential energy and pushing it back into the battery.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
