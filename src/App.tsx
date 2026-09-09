import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import PlaceholderLab from './labs/PlaceholderLab';
import Lab01 from './labs/Lab01_RLC/Lab01';
import Lab02 from './labs/Lab02_ThreePhase/Lab02';
import Lab03 from './labs/Lab03_Transformer/Lab03';
import Lab04 from './labs/Lab04_DCMotor/Lab04';
import Lab05 from './labs/Lab05_InductionMotor/Lab05';
import Lab06 from './labs/Lab06_PowerElectronics/Lab06';
import Lab07 from './labs/Lab07_SolarPV/Lab07';
import Lab08 from './labs/Lab08_WindEnergy/Lab08';
import Lab09 from './labs/Lab09_SmartGrid/Lab09';
import Lab10 from './labs/Lab10_FaultSimulation/Lab10';
import Lab11 from './labs/Lab11_ProtectiveRelays/Lab11';
import Lab12 from './labs/Lab12_SyncMotor/Lab12';
import Lab13 from './labs/Lab13_PowerFactor/Lab13';
import Lab14 from './labs/Lab14_TransmissionLines/Lab14';
import Lab15 from './labs/Lab15_Substation/Lab15';
import Lab16 from './labs/Lab16_ElectricVehicle/Lab16';
import Lab17 from './labs/Lab17_HighVoltage/Lab17';
import Lab18 from './labs/Lab18_Stability/Lab18';
import Lab19 from './labs/Lab19_Distribution/Lab19';
import Lab20 from './labs/Lab20_PIDControl/Lab20';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <Routes>
              <Route path="/" element={<Navigate to="/lab/1" replace />} />
              <Route path="/lab/1" element={<Lab01 />} />
              <Route path="/lab/2" element={<Lab02 />} />
              <Route path="/lab/3" element={<Lab03 />} />
              <Route path="/lab/4" element={<Lab04 />} />
              <Route path="/lab/5" element={<Lab05 />} />
              <Route path="/lab/6" element={<Lab06 />} />
              <Route path="/lab/7" element={<Lab07 />} />
              <Route path="/lab/8" element={<Lab08 />} />
              <Route path="/lab/9" element={<Lab09 />} />
              <Route path="/lab/10" element={<Lab10 />} />
              <Route path="/lab/11" element={<Lab11 />} />
              <Route path="/lab/12" element={<Lab12 />} />
              <Route path="/lab/13" element={<Lab13 />} />
              <Route path="/lab/14" element={<Lab14 />} />
              <Route path="/lab/15" element={<Lab15 />} />
              <Route path="/lab/16" element={<Lab16 />} />
              <Route path="/lab/17" element={<Lab17 />} />
              <Route path="/lab/18" element={<Lab18 />} />
              <Route path="/lab/19" element={<Lab19 />} />
              <Route path="/lab/20" element={<Lab20 />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        
        {/* Global Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-sm text-gray-500 z-20 shrink-0">
          Developed by <strong>Dr. Gopinath S</strong>, <strong>Dr. Suraj Pawar</strong> and <strong>Dr. Suhel Sayyad</strong>, ADCET Ashta
        </footer>
      </div>
    </Router>
  );
}

export default App;
