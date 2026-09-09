import React, { useState } from 'react';
import { BookOpen, Activity } from 'lucide-react';

interface ExperimentLayoutProps {
  title: string;
  theoryContent: React.ReactNode;
  simulationContent: React.ReactNode;
  assessmentContent?: React.ReactNode; // Optional, to prevent breaking changes in Labs
  reportContent?: React.ReactNode; // Optional, to prevent breaking changes in Labs
}

export default function ExperimentLayout({
  title,
  theoryContent,
  simulationContent
}: ExperimentLayoutProps) {
  const [activeTab, setActiveTab] = useState<'theory' | 'simulation'>('simulation');

  const tabs = [
    { id: 'theory', label: 'Theory & Objectives', icon: BookOpen },
    { id: 'simulation', label: 'Interactive Simulation', icon: Activity }
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm z-10 flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        <div className={`absolute inset-0 overflow-auto ${activeTab === 'theory' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {theoryContent}
        </div>
        <div className={`absolute inset-0 overflow-hidden ${activeTab === 'simulation' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {simulationContent}
        </div>
      </div>
    </div>
  );
}
