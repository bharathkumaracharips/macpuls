'use client';

import React from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { Activity, ShieldCheck } from 'lucide-react';

export const GpuView: React.FC = () => {
  const { metrics } = useSystemStore();

  if (!metrics) return null;

  const gpu = metrics.gpu;
  const unifiedGB = (gpu.unified_memory_bytes / (1024 * 1024 * 1024)).toFixed(0);

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>MODEL & RENDERER</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold text-white font-mono">{gpu.model_name}</p>
          <p className="text-xs text-slate-500 font-mono">Vendor: {gpu.vendor_name}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>UNIFIED MEMORY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{unifiedGB} GB</p>
          <p className="text-xs text-slate-500 font-mono">Dynamic System Allocation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>METAL SUPPORT</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-lg font-bold text-emerald-400 font-mono">Metal 3 Supported</p>
          <p className="text-xs text-slate-500 font-mono">Status: {gpu.status}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Metal Compute & Render Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Compute Pipelines Activity</span>
              <span className="font-mono text-purple-300 font-bold">
                {gpu.compute_activity_pct ? `${gpu.compute_activity_pct.toFixed(1)}%` : 'Active'}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${gpu.compute_activity_pct || 15}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Render Pipelines Activity</span>
              <span className="font-mono text-indigo-300 font-bold">
                {gpu.render_activity_pct ? `${gpu.render_activity_pct.toFixed(1)}%` : 'Active'}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${gpu.render_activity_pct || 22}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
