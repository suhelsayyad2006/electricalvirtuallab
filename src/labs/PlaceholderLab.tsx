import React from 'react';

export default function PlaceholderLab({ id }: { id: number }) {
  return (
    <div className="flex-1 p-8 flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-lg">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          {id}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Experiment #{id}</h2>
        <p className="text-gray-500 mb-6">
          This laboratory is scheduled for Phase 2 of the development plan. The core simulation engine and interactive interface will be deployed here soon.
        </p>
        <div className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
