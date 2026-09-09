import React, { useState, useEffect } from 'react';
import ExperimentLayout from '../../components/layout/ExperimentLayout';
import { InputPanel, SliderInput } from '../../components/common/InputPanel';
import { calculateSmartGrid } from '../../lib/math/smartGrid';
import { Sun, Wind, Factory, Home, Building2, Battery, Zap } from 'lucide-react';

export default function Lab09() {
  // Generation (kW)
  const [solar, setSolar] = useState(200);
  const [wind, setWind] = useState(300);
  const [conventional, setConventional] = useState(500);
  
  // Loads (kW)
  const [resLoad, setResLoad] = useState(300);
  const [comLoad, setComLoad] = useState(400);
  const [indLoad, setIndLoad] = useState(300);
  
  // Battery
  const [soc, setSoc] = useState(50); // %
  const [capacity] = useState(2000); // kWh
  
  // Scenarios
  const setScenario = (preset: 'night' | 'peak' | 'windy') => {
      if (preset === 'night') { setSolar(0); setWind(100); setResLoad(200); setComLoad(100); setIndLoad(400); setConventional(600); }
      if (preset === 'peak') { setSolar(400); setWind(150); setResLoad(600); setComLoad(700); setIndLoad(500); setConventional(800); }
      if (preset === 'windy') { setSolar(100); setWind(800); setResLoad(300); setComLoad(400); setIndLoad(300); setConventional(100); }
  };

  const results = calculateSmartGrid(solar, wind, conventional, resLoad, comLoad, indLoad, capacity, soc);

  // Simple interval to update battery SOC over time based on flow
  useEffect(() => {
     const timer = setInterval(() => {
         setSoc(prev => {
             // socRate is % per hour. Update every second for simulation speed (1 sec = 1 min approx, or just arbitrary speed)
             const newSoc = prev + (results.socRate / 60); 
             if (newSoc >= 100) return 100;
             if (newSoc <= 0) return 0;
             return newSoc;
         });
     }, 1000);
     return () => clearInterval(timer);
  }, [results.socRate]);

  const simulationContent = (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto">
        <InputPanel title="Smart Grid Operations">
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Scenarios</h4>
            <div className="flex gap-2">
               <button onClick={() => setScenario('night')} className="flex-1 py-1 bg-gray-700 text-white rounded text-xs">Night Time</button>
               <button onClick={() => setScenario('peak')} className="flex-1 py-1 bg-orange-500 text-white rounded text-xs">Peak Demand</button>
               <button onClick={() => setScenario('windy')} className="flex-1 py-1 bg-sky-500 text-white rounded text-xs">High Wind</button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2 text-green-700 flex items-center gap-1"><Zap size={14}/> Generation</h4>
            <SliderInput label="Solar PV" value={solar} min={0} max={1000} step={10} unit="kW" onChange={setSolar} />
            <SliderInput label="Wind Farm" value={wind} min={0} max={1000} step={10} unit="kW" onChange={setWind} />
            <SliderInput label="Conventional (Diesel/Gas)" value={conventional} min={0} max={1500} step={50} unit="kW" onChange={setConventional} />
          </div>
          
          <div className="border-t pt-4 mt-2">
            <h4 className="font-semibold text-sm mb-2 text-red-700 flex items-center gap-1"><Home size={14}/> Demand</h4>
            <SliderInput label="Residential Load" value={resLoad} min={0} max={1000} step={10} unit="kW" onChange={setResLoad} />
            <SliderInput label="Commercial Load" value={comLoad} min={0} max={1000} step={10} unit="kW" onChange={setComLoad} />
            <SliderInput label="Industrial Load" value={indLoad} min={0} max={1500} step={50} unit="kW" onChange={setIndLoad} />
          </div>
        </InputPanel>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-xs text-gray-500 font-bold uppercase">Total Generation</div>
             <div className="text-2xl font-bold text-green-600 mt-1">{results.totalGen} kW</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
             <div className="text-xs text-gray-500 font-bold uppercase">Total Demand</div>
             <div className="text-2xl font-bold text-red-600 mt-1">{results.totalLoad} kW</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-100 origin-bottom transition-all duration-1000" style={{ height: `${soc}%`, top: `${100 - soc}%`}}></div>
             <div className="relative z-10">
                 <div className="text-xs text-gray-700 font-bold uppercase">Battery SOC</div>
                 <div className="text-2xl font-bold text-blue-900 mt-1">{soc.toFixed(1)} %</div>
                 <div className="text-xs text-blue-700 font-mono mt-1">{results.batteryFlow > 0 ? `+${results.batteryFlow}kW` : results.batteryFlow < 0 ? `${results.batteryFlow}kW` : 'Idle'}</div>
             </div>
          </div>
          <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center ${results.frequency < 49.5 || results.frequency > 50.5 ? 'animate-pulse bg-red-50' : ''}`}>
             <div className="text-xs text-gray-500 font-bold uppercase">Grid Freq</div>
             <div className={`text-2xl font-bold mt-1 ${results.frequency < 49.5 || results.frequency > 50.5 ? 'text-red-600' : 'text-gray-800'}`}>{results.frequency.toFixed(2)} Hz</div>
          </div>
        </div>

        {/* Network Diagram */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex-1 flex flex-col relative overflow-hidden shadow-inner min-h-[400px]">
           <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm z-20">Network Power Flow</div>
           <div className={`absolute top-4 right-4 font-mono text-sm font-bold z-20 px-3 py-1 rounded ${results.status.includes('CRITICAL') ? 'bg-red-600 text-white animate-bounce' : 'bg-green-600 text-white'}`}>
              {results.status}
           </div>
           
           <div className="flex-1 relative flex items-center justify-center mt-8">
              {/* Central Busbar */}
              <div className="absolute w-2 h-64 bg-yellow-500 rounded-full z-10 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
              
              {/* Generators (Left) */}
              <div className="absolute left-10 top-10 flex items-center gap-4">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-24 z-20">
                    <Sun className="mx-auto text-yellow-400 mb-1" /> {solar}kW
                 </div>
                 <div className="w-24 h-1 bg-green-500 relative overflow-hidden"><div className="absolute inset-0 bg-white/50 w-4 animate-[slideRight_1s_linear_infinite]"></div></div>
              </div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-24 z-20">
                    <Wind className="mx-auto text-sky-400 mb-1" /> {wind}kW
                 </div>
                 <div className="w-24 h-1 bg-green-500 relative overflow-hidden"><div className="absolute inset-0 bg-white/50 w-4 animate-[slideRight_1s_linear_infinite]"></div></div>
              </div>
              <div className="absolute left-10 bottom-10 flex items-center gap-4">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-24 z-20">
                    <Factory className="mx-auto text-gray-400 mb-1" /> {conventional}kW
                 </div>
                 <div className="w-24 h-1 bg-green-500 relative overflow-hidden"><div className="absolute inset-0 bg-white/50 w-4 animate-[slideRight_1s_linear_infinite]"></div></div>
              </div>

              {/* Loads (Right) */}
              <div className="absolute right-10 top-10 flex items-center gap-4 flex-row-reverse">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-24 z-20">
                    <Home className="mx-auto text-orange-400 mb-1" /> {resLoad}kW
                 </div>
                 <div className="w-24 h-1 bg-red-500 relative overflow-hidden"><div className="absolute inset-0 bg-white/50 w-4 animate-[slideRight_1s_linear_infinite]"></div></div>
              </div>
              <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4 flex-row-reverse">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-24 z-20">
                    <Building2 className="mx-auto text-purple-400 mb-1" /> {comLoad}kW
                 </div>
                 <div className="w-24 h-1 bg-red-500 relative overflow-hidden"><div className="absolute inset-0 bg-white/50 w-4 animate-[slideRight_1s_linear_infinite]"></div></div>
              </div>
              <div className="absolute right-10 bottom-10 flex items-center gap-4 flex-row-reverse">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-24 z-20">
                    <Factory className="mx-auto text-red-400 mb-1" /> {indLoad}kW
                 </div>
                 <div className="w-24 h-1 bg-red-500 relative overflow-hidden"><div className="absolute inset-0 bg-white/50 w-4 animate-[slideRight_1s_linear_infinite]"></div></div>
              </div>
              
              {/* Battery & Grid (Bottom) */}
              <div className="absolute bottom-4 flex gap-16">
                 <div className="flex flex-col items-center">
                    <div className={`h-16 w-1 ${results.batteryFlow > 0 ? 'bg-green-500' : results.batteryFlow < 0 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-28 z-20 flex flex-col items-center">
                       <Battery className={results.batteryFlow > 0 ? "text-green-400" : "text-gray-400"} /> 
                       <span className="text-xs mt-1 font-mono">{soc.toFixed(0)}%</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className={`h-16 w-1 ${results.gridExport > 0 ? 'bg-green-500' : results.gridExport < 0 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white w-28 z-20 flex flex-col items-center">
                       <Zap className={results.gridExport > 0 ? "text-green-400" : results.gridExport < 0 ? "text-red-400" : "text-gray-400"} /> 
                       <span className="text-xs mt-1">External Grid</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <style dangerouslySetInnerHTML={{__html: `
             @keyframes slideRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(500%); } }
           `}} />
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="Lab 9: Smart Grid Simulation"
      theoryContent={
        <div className="p-8 max-w-4xl mx-auto bg-white my-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Theory & Objectives</h2>
          <p className="mb-4 text-gray-700">A Smart Grid dynamically balances power generation and power consumption (load) in real-time. Because electricity cannot be easily stored on a massive scale without batteries, Generation must equal Demand at every second.</p>
          <h3 className="text-xl font-semibold mb-2 mt-6">Frequency as a Balance Indicator</h3>
          <p className="mb-4 text-gray-700">Grid frequency (nominally 50Hz or 60Hz) is the heartbeat of the power system.
          <br/><br/>
          If Demand &gt; Generation, the generators slow down under the heavy load, and frequency drops. If it drops too far, the grid collapses resulting in a blackout.
          <br/><br/>
          If Generation &gt; Demand, the generators speed up, and frequency rises, which can damage equipment.</p>
          <p className="text-gray-700">Use the interactive controls to balance the grid, utilizing the Battery Energy Storage System (BESS) and External Grid connections to mitigate deficits or surpluses.</p>
        </div>
      }
      simulationContent={simulationContent}
      assessmentContent={<div className="p-8"><p>Assessment coming soon.</p></div>}
      reportContent={<div className="p-8"><p>Report module under construction.</p></div>}
    />
  );
}
