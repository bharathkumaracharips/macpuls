'use client';

import React from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { Cpu, Zap, Activity } from 'lucide-react';

export const CpuView: React.FC = () => {
  const { metrics } = useSystemStore();

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>BRAND & MODEL</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-white font-mono">{metrics.cpu.brand_name}</p>
          <p className="text-xs text-slate-500 font-mono">Reference Frequency: {metrics.cpu.frequency_mhz} MHz</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>OVERALL CPU LOAD</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{metrics.cpu.overall_usage_pct.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 font-mono">Active Cores: {metrics.cpu.core_count}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>LOAD AVERAGES</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-3 text-sm font-mono font-bold text-indigo-300">
            <span>1m: {metrics.cpu.load_avg_1m.toFixed(2)}</span>
            <span>5m: {metrics.cpu.load_avg_5m.toFixed(2)}</span>
            <span>15m: {metrics.cpu.load_avg_15m.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">Mach host_processor_info()</p>
        </div>
      </div>

      {/* Core Grid Detailed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Mach Processor Core Ticks ({metrics.cpu.core_count} Cores)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.cpu.cores.map((core) => (
            <div key={core.core_id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Core #{core.core_id}</span>
                <span className="font-mono text-indigo-300 font-bold">{core.usage_pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${core.usage_pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
