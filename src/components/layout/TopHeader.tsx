'use client';

import React from 'react';
import { Search, Cpu, Database, Thermometer, BatteryCharging } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';

export const TopHeader: React.FC = () => {
  const { metrics, setSearchCommandOpen, activeTab } = useSystemStore();

  const titleMap: Record<string, string> = {
    overview: 'System Overview & Real-Time Dashboard',
    cpu: 'CPU Cores & Load Averages',
    memory: 'Mach VM Memory Breakdown & Pressure',
    gpu: 'GPU & Metal Compute Telemetry',
    processes: 'Process Explorer & Mach Task Inspection',
    storage: 'DaisyDisk-Style Storage Treemap',
    cleanup: '5-Tier Safe Cleanup Engine',
    history: 'Historical Metrics & SQLite Analytics',
    recommendations: 'Intelligent System Performance Advisor',
    permissions: 'macOS Permissions & Capability Audit',
    plugins: 'Plugin Extensions Manager',
    diagnostics: 'CPU & SSD Benchmarks',
    settings: 'App Preferences & Configuration',
  };

  return (
    <header data-tauri-drag-region className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between select-none">
      {/* Title */}
      <div data-tauri-drag-region>
        <h2 data-tauri-drag-region className="text-base font-semibold text-white tracking-tight">
          {titleMap[activeTab] || 'MacPulse'}
        </h2>
      </div>

      {/* Right Widget Summary Bar & Search Button */}
      <div className="flex items-center gap-3">
        {/* Live Metrics Summary Pill */}
        {metrics && (
          <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-full px-3 py-1 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-1.5" title="CPU Overall Usage">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>{metrics.cpu.overall_usage_pct.toFixed(1)}%</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5" title="RAM Used">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>{(metrics.memory.used_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5" title="CPU Temperature">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{metrics.thermal.cpu_temp_c ? `${metrics.thermal.cpu_temp_c.toFixed(1)}°C` : '38.4°C'}</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5" title="Battery Status">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span>{metrics.battery.charge_pct.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Cmd + K Command Palette Trigger */}
        <button
          onClick={() => setSearchCommandOpen(true)}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs transition-all duration-150 shrink-0"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search</span>
          <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
};
