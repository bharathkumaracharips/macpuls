'use client';

import React from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { Cpu, Database, HardDrive, Wifi, Activity, Battery, Thermometer } from 'lucide-react';

export const SystemOverview: React.FC = () => {
  const { metrics } = useSystemStore();

  if (!metrics) return null;

  const ramUsedGB = (metrics.memory.used_bytes / (1024 * 1024 * 1024)).toFixed(1);
  const ramTotalGB = (metrics.memory.total_bytes / (1024 * 1024 * 1024)).toFixed(0);
  const diskUsedGB = (metrics.disk.used_bytes / (1024 * 1024 * 1024)).toFixed(0);
  const diskTotalGB = (metrics.disk.total_bytes / (1024 * 1024 * 1024)).toFixed(0);

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner Card: Health Status & Apple Silicon Brand */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              System Optimal
            </span>
            <span className="text-xs text-slate-400 font-mono">{metrics.cpu.brand_name}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Monitor & Storage Health</h2>
          <p className="text-xs text-slate-400">
            Mach kernel statistics sampled real-time at 1000ms intervals via Rust backend worker.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Memory Pressure</p>
            <p className={`text-sm font-bold ${
              metrics.memory.memory_pressure_level === 'Critical' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {metrics.memory.memory_pressure_level} ({metrics.memory.memory_pressure_pct.toFixed(0)}%)
            </p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Load Average</p>
            <p className="text-sm font-bold text-indigo-300 font-mono">
              {metrics.cpu.load_avg_1m.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Overall Usage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">CPU LOAD</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-white font-mono">{metrics.cpu.overall_usage_pct.toFixed(1)}%</span>
              <span className="text-xs text-slate-400 font-mono">{metrics.cpu.core_count} Cores</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, metrics.cpu.overall_usage_pct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">RAM USAGE</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-white font-mono">{ramUsedGB} GB</span>
              <span className="text-xs text-slate-400 font-mono">of {ramTotalGB} GB</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(metrics.memory.used_bytes / metrics.memory.total_bytes) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Storage Capacity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">STORAGE</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-white font-mono">{metrics.disk.used_pct.toFixed(0)}%</span>
              <span className="text-xs text-slate-400 font-mono">{diskUsedGB} / {diskTotalGB} GB</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${metrics.disk.used_pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Network Speed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">NETWORK I/O</span>
            <Wifi className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Download</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {(metrics.network.download_bytes_per_sec / 1024).toFixed(1)} KB/s
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Upload</span>
              <span className="font-mono text-amber-400 font-semibold">
                {(metrics.network.upload_bytes_per_sec / 1024).toFixed(1)} KB/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Grid Preview & Battery/Thermal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Activity Mini Grid */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Per-Core CPU Distribution</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {metrics.cpu.cores.map((core) => (
              <div key={core.core_id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 text-center space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono">Core {core.core_id}</span>
                <p className="text-xs font-bold text-white font-mono">{core.usage_pct.toFixed(0)}%</p>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${core.usage_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Battery & Thermal Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thermal & Power State</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Battery Health</span>
              </div>
              <span className="font-mono text-white font-semibold">{metrics.battery.health_pct}% ({metrics.battery.cycle_count} cycles)</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">CPU Temperature</span>
              </div>
              <span className="font-mono text-white font-semibold">
                {metrics.thermal.cpu_temp_c ? `${metrics.thermal.cpu_temp_c.toFixed(1)} °C` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-slate-300">Power Source</span>
              </div>
              <span className="font-mono text-sky-300">{metrics.battery.power_source}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
