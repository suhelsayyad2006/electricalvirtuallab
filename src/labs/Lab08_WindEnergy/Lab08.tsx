import React, { useState, useMemo } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateWindEnergy } from '../../lib/math/windEnergy';
import { Wind, Cloud } from 'lucide-react';

export default function Lab08() {
  const [v, setV] = useState(12); // Wind speed m/s
  const [pitch, setPitch] = useState(0); // degrees
  const [R, setR] = useState(40); // radius m
  const [load, setLoad] = useState(1500); // kW (High default implies grid connection)

  const results = useMemo(() => calculateWindEnergy(v, pitch, R, load), 
    [v, pitch, R, load]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Wind & Turbine Parameters">
          <SliderInput label="Wind Speed" value={v} min={0} max={30} step={0.5} unit="m/s" onChange={setV} />
          <SliderInput label="Blade Pitch Angle" value={pitch} min={0} max={30} step={1} unit="°" onChange={setPitch} />
          <SliderInput label="Turbine Radius" value={R} min={10} max={80} unit="m" onChange={setR} />
          
          <div className="border-t pt-4 mt-2">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Grid / Load Connection</h4>
            <SliderInput label="Requested Load" value={load} min={0} max={3000} step={50} unit="kW" onChange={setLoad} />
          </div>
        </InputPanel>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-1">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Status</h3>
          <div className={`text-sm font-bold p-2 rounded mb-4 text-center ${
              results.state.includes('Operating') ? 'bg-green-100 text-green-700' :
              results.state.includes('limited') ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
          }`}>
              {results.state}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
               <div className="text-xs text-gray-500 font-semibold">Available Wind Pwr</div>
               <div className="font-bold text-gray-700">{results.P_wind} kW</div>
            </div>
            <div className="bg-blue-50 p-2 rounded border border-blue-100">
               <div className="text-xs text-blue-600 font-semibold">Power Coeff (Cp)</div>
               <div className="font-bold text-blue-800">{results.Cp}</div>
            </div>
            <div className="bg-amber-50 p-2 rounded border border-amber-100">
               <div className="text-xs text-amber-600 font-semibold">Turbine Torque</div>
               <div className="font-bold text-amber-800">{results.torque} kNm</div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-100">
               <div className="text-xs text-green-600 font-semibold">Electrical Pwr</div>
               <div className="font-bold text-green-800">{results.P_elec} kW</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Visualizer */}
        <div className="bg-sky-100 rounded-xl border border-sky-200 p-8 flex items-center justify-center relative overflow-hidden h-64 shadow-inner">
           <div className="absolute top-4 left-4 text-sky-800 font-mono text-sm flex items-center gap-2">
             <Wind size={20} className={v > 5 ? "animate-pulse" : ""} /> Wind Speed: {v} m/s
           </div>
           
           {/* Clouds passing by based on wind speed */}
           <div className="absolute top-10 left-10 text-white/50" style={{ transform: `translateX(${v * 10}px)` }}><Cloud size={64} fill="currentColor"/></div>
           <div className="absolute top-20 right-20 text-white/40" style={{ transform: `translateX(${v * 15}px)` }}><Cloud size={48} fill="currentColor"/></div>

           {/* Wind Turbine */}
           <div className="relative flex flex-col items-center mt-12">
             {/* Rotor */}
             <div 
                className="absolute z-10 w-2 h-2 flex items-center justify-center -top-24 origin-center"
                style={{ animation: `spin ${results.rpm > 0 ? 60 / results.rpm : 0}s linear infinite` }}
             >
                {/* Hub */}
                <div className="w-4 h-4 bg-gray-400 rounded-full z-20 absolute"></div>
                {/* 3 Blades */}
                <div className="absolute w-2 h-32 bg-gray-100 rounded-t-full shadow-md origin-bottom -top-32" style={{ transform: `rotate(0deg)` }}></div>
                <div className="absolute w-2 h-32 bg-gray-100 rounded-t-full shadow-md origin-bottom -top-32" style={{ transform: `rotate(120deg)` }}></div>
                <div className="absolute w-2 h-32 bg-gray-100 rounded-t-full shadow-md origin-bottom -top-32" style={{ transform: `rotate(240deg)` }}></div>
             </div>
             
             {/* Nacelle */}
             <div className="w-16 h-8 bg-gray-100 rounded-lg shadow-lg z-0 -top-24 absolute -ml-8"></div>
             
             {/* Tower */}
             <div className="w-4 h-48 bg-gray-300 absolute -top-20 z-0 shadow-inner" style={{ background: 'linear-gradient(to right, #d1d5db, #f3f4f6, #9ca3af)' }}></div>
           </div>
           
           <style dangerouslySetInnerHTML={{__html: `
             @keyframes spin { 100% { transform: rotate(360deg); } }
           `}} />
        </div>

        {/* Graphs */}
        <div className="flex-1">
            <Oscilloscope 
              title="Power Curve (Generated Power vs Wind Speed at current Pitch)"
              data={results.curve}
              xKey="wind"
              xLabel="Wind Speed (m/s)"
              yLabel="Electrical Power (kW)"
              lines={[
                { key: 'power', name: 'Power (kW)', color: '#10b981', yAxisId: 'left' }
              ]}
            />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 8: Wind Energy Conversion"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A wind turbine captures kinetic energy from the wind and converts it into electrical power through a generator.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Power in the Wind</h3>
          <p className="mb-2 text-gray-700">The total available power in the wind is given by: <strong>P = ½ ρ A v³</strong>, where ρ is air density, A is swept area, and v is wind speed.</p>
          <p className="mb-4 text-gray-700">Notice that power is proportional to the <em>cube</em> of the wind speed. A small increase in wind speed yields a massive increase in power.</p>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Betz Limit and Power Coefficient (Cp)</h3>
          <p className="mb-4 text-gray-700">A turbine cannot capture 100% of the wind's energy (or the wind would stop completely behind the turbine). The theoretical maximum is 59.3% (the Betz Limit). The actual fraction captured is Cp, which varies based on the pitch angle of the blades and the rotational speed of the turbine.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
