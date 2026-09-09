import React from 'react';

interface ReportPanelProps {
  title: string;
  studentName?: string;
  rollNumber?: string;
  date?: string;
  objective: string;
  observations: React.ReactNode;
  conclusion?: string;
}

export default function ReportPanel({
  title,
  studentName = "________________________",
  rollNumber = "________________________",
  date = new Date().toLocaleDateString(),
  objective,
  observations,
  conclusion = "The experiment was successfully simulated and the theoretical concepts were verified against the computational model."
}: ReportPanelProps) {
  return (
    <div className="w-full text-gray-900 font-serif leading-relaxed">
      {/* Report Header */}
      <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Laboratory Report</h1>
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      </div>

      {/* Student Details */}
      <div className="flex justify-between mb-10">
        <div className="space-y-4">
          <p><span className="font-bold">Student Name:</span> {studentName}</p>
          <p><span className="font-bold">Roll / ID No:</span> {rollNumber}</p>
        </div>
        <div className="space-y-4 text-right">
          <p><span className="font-bold">Date:</span> {date}</p>
          <p><span className="font-bold">Instructor:</span> Dr. Gopinath S / Dr. Suraj Pawar / Dr. Suhel Sayyad</p>
        </div>
      </div>

      {/* Objective */}
      <div className="mb-8">
        <h3 className="text-xl font-bold uppercase border-b border-gray-300 mb-4 pb-1">1. Objective</h3>
        <p className="text-justify">{objective}</p>
      </div>

      {/* Observations & Results */}
      <div className="mb-8">
        <h3 className="text-xl font-bold uppercase border-b border-gray-300 mb-4 pb-1">2. Observations & Results</h3>
        <div className="bg-gray-50 border border-gray-200 p-6 rounded text-sm font-sans">
          {observations}
        </div>
      </div>

      {/* Conclusion */}
      <div className="mb-12">
        <h3 className="text-xl font-bold uppercase border-b border-gray-300 mb-4 pb-1">3. Conclusion</h3>
        <p className="text-justify">{conclusion}</p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-24 pt-8 border-t border-gray-300 px-8">
        <div className="text-center">
          <p className="border-t border-gray-500 pt-2 w-48 mx-auto font-semibold">Student Signature</p>
        </div>
        <div className="text-center">
          <p className="border-t border-gray-500 pt-2 w-48 mx-auto font-semibold">Instructor Signature</p>
        </div>
      </div>
    </div>
  );
}
