'use client';

import React from 'react';
import { useSystemStore } from '@/store/useSystemStore';

export const MemoryBreakdown: React.FC = () => {
  const { metrics } = useSystemStore();

  if (!metrics) return null;

  const m = metrics.memory;
  const toGB = (b: number) => (b / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">TOTAL RAM</span>
          <p className="text-2xl font-bold text-white font-mono">{toGB(m.total_bytes)} GB</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">USED RAM</span>
          <p className="text-2xl font-bold text-purple-400 font-mono">{toGB(m.used_bytes)} GB</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">APP MEMORY</span>
          <p className="text-2xl font-bold text-indigo-400 font-mono">{toGB(m.app_memory_bytes)} GB</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">MEMORY PRESSURE</span>
          <p className={`text-2xl font-bold font-mono ${
            m.memory_pressure_level === 'Critical' ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {m.memory_pressure_level}
          </p>
        </div>
      </div>

      {/* Visual Memory Stack Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Mach VM Statistics Stack Breakdown</h3>

        {/* Stacked Progress Bar */}
        <div className="w-full bg-slate-950 rounded-xl h-6 overflow-hidden flex border border-slate-800 p-1 gap-1">
          <div
            title={`App Memory: ${toGB(m.app_memory_bytes)} GB`}
            className="bg-indigo-500 rounded-lg h-full transition-all"
            style={{ width: `${(m.app_memory_bytes / m.total_bytes) * 100}%` }}
          />
          <div
            title={`Wired Memory: ${toGB(m.wired_bytes)} GB`}
            className="bg-amber-500 rounded-lg h-full transition-all"
            style={{ width: `${(m.wired_bytes / m.total_bytes) * 100}%` }}
          />
          <div
            title={`Compressed: ${toGB(m.compressed_bytes)} GB`}
            className="bg-purple-500 rounded-lg h-full transition-all"
            style={{ width: `${(m.compressed_bytes / m.total_bytes) * 100}%` }}
          />
          <div
            title={`File Cache: ${toGB(m.file_cache_bytes)} GB`}
            className="bg-emerald-500/60 rounded-lg h-full transition-all"
            style={{ width: `${(m.file_cache_bytes / m.total_bytes) * 100}%` }}
          />
        </div>

        {/* Category Legend & Breakdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs text-slate-400">App Memory</span>
            </div>
            <p className="text-base font-bold text-white font-mono">{toGB(m.app_memory_bytes)} GB</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-slate-400">Wired Memory</span>
            </div>
            <p className="text-base font-bold text-white font-mono">{toGB(m.wired_bytes)} GB</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs text-slate-400">Compressed Memory</span>
            </div>
            <p className="text-base font-bold text-white font-mono">{toGB(m.compressed_bytes)} GB</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="text-xs text-slate-400">File Cache</span>
            </div>
            <p className="text-base font-bold text-white font-mono">{toGB(m.file_cache_bytes)} GB</p>
          </div>
        </div>
      </div>

      {/* Advanced VM Counters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Mach Kernel VM Counters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Compression Ratio</span>
            <span className="text-sm font-bold text-purple-300">{m.compression_ratio.toFixed(2)}x</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Swap Used</span>
            <span className="text-sm font-bold text-amber-300">{toGB(m.swap_used_bytes)} GB</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Page Faults</span>
            <span className="text-sm font-bold text-slate-200">{m.page_faults.toLocaleString()}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Copy-On-Write</span>
            <span className="text-sm font-bold text-slate-200">{m.copy_on_write_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
