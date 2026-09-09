import { NavLink } from 'react-router-dom';
import { Zap } from 'lucide-react';

const labs = [
  { id: 1, name: "RLC Circuit" },
  { id: 2, name: "Three-Phase Power" },
  { id: 3, name: "Transformer Lab" },
  { id: 4, name: "DC Motor Control" },
  { id: 5, name: "Induction Motor" },
  { id: 6, name: "Power Electronics" },
  { id: 7, name: "Solar PV + MPPT" },
  { id: 8, name: "Wind Energy" },
  { id: 9, name: "Smart Grid" },
  { id: 10, name: "Fault Simulation" },
  { id: 11, name: "Relay Protection" },
  { id: 12, name: "Machine Fault" },
  { id: 13, name: "Battery & Energy" },
  { id: 14, name: "EV Powertrain" },
  { id: 15, name: "Distribution Network" },
  { id: 16, name: "Power Factor" },
  { id: 17, name: "Substation Lab" },
  { id: 18, name: "High Voltage" },
  { id: 19, name: "PLC Automation" },
  { id: 20, name: "Microgrid" },
];

export default function Sidebar() {
  return (
    <div className="w-72 bg-slate-900 text-white flex flex-col h-full shrink-0 shadow-lg z-10">
      <div className="p-4 bg-slate-950 flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2 text-blue-400">
          <Zap className="text-yellow-400" />
          EE Virtual Lab
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {labs.map(lab => (
          <NavLink
            key={lab.id}
            to={`/lab/${lab.id}`}
            className={({ isActive }) =>
              `block p-3 rounded mb-1 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 shadow-md' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`
            }
          >
            <span className="opacity-60 mr-2 font-mono">{String(lab.id).padStart(2, '0')}.</span> 
            {lab.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
