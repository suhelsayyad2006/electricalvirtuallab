import React, { useState, useMemo, useEffect } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import Oscilloscope from '../../components/common/Oscilloscope';
import { calculateSolarPV } from '../../lib/math/solarPV';
import { Sun, Cloud, CloudRain } from 'lucide-react';

export default function Lab07() {
  const [G, setG] = useState(1000); // Irradiance W/m2
  const [T, setT] = useState(25); // Temperature C
  const [Ns_panels, setNs_panels] = useState(2); // Panels in series
  const [Np, setNp] = useState(1); // Panels in parallel
  const [mpptEnabled, setMpptEnabled] = useState(false);
  const [V_load, setV_load] = useState(60); // Operating voltage if MPPT off

  const results = useMemo(() => {
    // If MPPT is enabled, the operating voltage is automatically set to Vmp
    // But we need the Vmp first, so we do a quick dry run
    const dryRun = calculateSolarPV(G, T, 60, Np, Ns_panels, 0);
    const actual_V_load = mpptEnabled ? dryRun.Vmp : V_load;
    return calculateSolarPV(G, T, 60, Np, Ns_panels, actual_V_load);
  }, [G, T, Ns_panels, Np, mpptEnabled, V_load]);

  // Weather presets
  const setWeather = (preset: 'sunny' | 'cloudy' | 'rainy') => {
    if (preset === 'sunny') { setG(1000); setT(35); }
    if (preset === 'cloudy') { setG(400); setT(22); }
    if (preset === 'rainy') { setG(150); setT(18); }
  };

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <InputPanel title="Solar Array & Environment">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Weather Presets</h4>
            <div className="flex gap-2">
               <button onClick={() => setWeather('sunny')} className="flex-1 flex flex-col items-center p-2 bg-yellow-50 text-yellow-600 rounded border border-yellow-200 hover:bg-yellow-100">
                  <Sun size={20} /> <span className="text-xs mt-1">Sunny</span>
               </button>
               <button onClick={() => setWeather('cloudy')} className="flex-1 flex flex-col items-center p-2 bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100">
                  <Cloud size={20} /> <span className="text-xs mt-1">Cloudy</span>
               </button>
               <button onClick={() => setWeather('rainy')} className="flex-1 flex flex-col items-center p-2 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100">
                  <CloudRain size={20} /> <span className="text-xs mt-1">Rainy</span>
               </button>
            </div>
          </div>
          
          <SliderInput label="Irradiance (G)" value={G} min={0} max={1200} step={10} unit="W/m²" onChange={setG} />
          <SliderInput label="Temperature (T)" value={T} min={-10} max={60} unit="°C" onChange={setT} />
          
          <div className="border-t pt-4 mt-2">
             <h4 className="font-semibold text-sm mb-2 text-gray-700">Array Configuration</h4>
             <SliderInput label="Panels in Series" value={Ns_panels} min={1} max={10} unit="" onChange={setNs_panels} />
             <SliderInput label="Strings in Parallel" value={Np} min={1} max={5} unit="" onChange={setNp} />
          </div>
          
          <div className="border-t pt-4 mt-2">
             <div className="flex justify-between items-center mb-4">
               <h4 className="font-semibold text-sm text-gray-700">MPPT Controller</h4>
               <button 
                 onClick={() => setMpptEnabled(!mpptEnabled)}
                 className={`px-3 py-1 text-xs font-bold rounded ${mpptEnabled ? 'bg-green-500 text-white shadow' : 'bg-gray-200 text-gray-600'}`}
               >
                 {mpptEnabled ? 'ON (Tracking)' : 'OFF (Manual)'}
               </button>
             </div>
             
             {!mpptEnabled && (
                <SliderInput label="Operating Voltage (Load)" value={V_load} min={0} max={results.Voc * 1.1 || 100} step={1} unit="V" onChange={setV_load} />
             )}
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Output Power</div>
             <div className="text-2xl font-bold text-amber-500 mt-1">{results.P_op} W</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Maximum Power (Pmax)</div>
             <div className="text-xl font-bold text-gray-800 mt-1">{results.Pmax} W</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Operating Voltage</div>
             <div className="text-xl font-bold text-blue-600 mt-1">{results.V_op} V</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-sm text-gray-500 font-medium">Operating Current</div>
             <div className="text-xl font-bold text-red-600 mt-1">{results.I_op} A</div>
          </div>
        </div>

        <div className="flex-1 h-64 bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-inner">
           {/* Add a marker to the curve array for the operating point */}
           {(() => {
               // We will just use the graph, but inject a "marker" point by adding a separate line,
               // or just rely on the tooltip. For simplicity, we just show the curve.
               return (
                  <Oscilloscope 
                    title="PV Array Characteristics (I-V and P-V Curves)"
                    data={results.curve}
                    xKey="voltage"
                    xLabel="Voltage (V)"
                    yLabel="Current (A) / Power (W)"
                    lines={[
                      { key: 'current', name: 'Current (A)', color: '#ef4444', yAxisId: 'left' },
                      { key: 'power', name: 'Power (W)', color: '#f59e0b', yAxisId: 'right' }
                    ]}
                  />
               )
           })()}
        </div>
        
        {/* Simple Solar Array Visualizer */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-center relative overflow-hidden h-40">
           <div className="absolute inset-0 bg-blue-50/50"></div>
           
           {/* Sun indicating Irradiance */}
           <div 
             className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl transition-opacity duration-1000"
             style={{ opacity: G / 1200 }}
           ></div>
           
           <div className="relative z-10 flex gap-2">
             {/* Render Grid of Panels */}
             {Array.from({ length: Np }).map((_, col) => (
                <div key={col} className="flex flex-col gap-1">
                  {Array.from({ length: Math.min(Ns_panels, 5) }).map((_, row) => ( // Cap visually at 5 per string
                     <div key={row} className="w-16 h-8 bg-blue-900 rounded border border-blue-400 grid grid-cols-4 grid-rows-2 gap-[1px] p-[1px]">
                        {Array.from({length: 8}).map((_, i) => <div key={i} className="bg-blue-800"></div>)}
                     </div>
                  ))}
                  {Ns_panels > 5 && <div className="text-center text-xs font-bold text-gray-500">+{Ns_panels - 5} more</div>}
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 7: Solar PV & MPPT"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">Photovoltaic (PV) cells convert sunlight directly into electricity. A solar panel's output is highly dependent on solar irradiance (sunlight intensity) and temperature.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">I-V and P-V Curves</h3>
          <p className="mb-4 text-gray-700">The current-voltage (I-V) curve shows all possible operating points of a solar panel. The power-voltage (P-V) curve reveals a single Maximum Power Point (MPP) where the panel produces the most energy.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Irradiance (G):</strong> Directly affects the Short-Circuit Current (Isc). More sun = more current.</li>
            <li><strong>Temperature (T):</strong> Inversely affects the Open-Circuit Voltage (Voc). Hotter panels are less efficient.</li>
            <li><strong>MPPT:</strong> Maximum Power Point Tracking is an electronic algorithm (usually in a DC-DC converter) that constantly adjusts the operating voltage to stay exactly at the peak of the P-V curve.</li>
          </ul>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
