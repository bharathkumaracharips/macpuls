'use client';

import React, { useState } from 'react';
import { History, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const HistoryView: React.FC = () => {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Sample historical time-series data points
  const sampleData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.floor(12 + Math.sin(i) * 15 + Math.random() * 8),
    ram: Math.floor(14 + Math.cos(i) * 2 + Math.random() * 1.5),
    diskIo: Math.floor(4 + Math.random() * 12),
  }));

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <History className="w-4 h-4 text-rose-400" />
          <span>Local SQLite Metrics History (`~/.macpulse/metrics.db`)</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                range === r
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 1: CPU & RAM Trends */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">CPU & RAM Load History ({range.toUpperCase()})</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleData}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#cpuGrad)" name="CPU %" />
              <Area type="monotone" dataKey="ram" stroke="#a855f7" fillOpacity={1} fill="url(#ramGrad)" name="RAM Used (GB)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
