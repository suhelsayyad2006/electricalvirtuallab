import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface OscilloscopeProps {
  data: any[];
  lines: { key: string; color: string; name: string; yAxisId?: string }[];
  xKey?: string;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

export default function Oscilloscope({ 
  data, 
  lines, 
  xKey = "time", 
  xLabel = "Time (s)", 
  yLabel,
  title
}: OscilloscopeProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner p-4 flex flex-col h-full">
      {title && <h3 className="text-slate-300 font-mono text-sm mb-4 border-b border-slate-800 pb-2">{title}</h3>}
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis 
              dataKey={xKey} 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
            />
            
            {/* Find unique yAxisIds, or default to left */}
            {Array.from(new Set(lines.map(l => l.yAxisId || 'left'))).map(id => (
              <YAxis 
                key={id}
                yAxisId={id} 
                orientation={id === 'right' ? 'right' : 'left'}
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 } : undefined}
              />
            ))}
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            {lines.map((line) => (
              <Line 
                key={line.key}
                yAxisId={line.yAxisId || 'left'}
                type="monotone" 
                dataKey={line.key} 
                name={line.name} 
                stroke={line.color} 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false} // Important for real-time performance
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
