'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Database,
  Activity,
  Network,
  ListFilter,
  Server,
  HardDrive,
  Sparkles,
  History,
  Lightbulb,
  Puzzle,
  Gauge,
  Settings,
  FileCode,
} from 'lucide-react';
import { useSystemStore, ViewTab } from '@/store/useSystemStore';

interface NavItem {
  id: ViewTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const XcodeSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useSystemStore();

  const navGroups: { groupName: string; items: NavItem[] }[] = [
    {
      groupName: 'HEALTH & COMPLIANCE',
      items: [
        { id: 'health', label: 'Health & Audit', icon: ShieldCheck, badge: '93/100' },
        { id: 'overview', label: 'System Telemetry', icon: LayoutDashboard },
        { id: 'cpu', label: 'CPU Cores', icon: Cpu },
        { id: 'memory', label: 'Memory & VM', icon: Database },
        { id: 'gpu', label: 'GPU & Metal', icon: Activity },
      ],
    },
    {
      groupName: 'SECURITY & THREATS',
      items: [
        { id: 'threats', label: 'Threat & YARA Engine', icon: ShieldAlert },
        { id: 'permissions', label: 'Permissions Audit', icon: ShieldCheck },
        { id: 'network', label: 'IP & MAC Tools', icon: Network, badge: 'DHCP' },
      ],
    },
    {
      groupName: 'OBSERVABILITY & LOGS',
      items: [
        { id: 'processes', label: 'Process Explorer', icon: ListFilter },
        { id: 'services', label: 'Launchctl Services', icon: Server },
        { id: 'history', label: 'Metrics History', icon: History },
        { id: 'recommendations', label: 'Smart Advisor', icon: Lightbulb },
      ],
    },
    {
      groupName: 'STORAGE & REVERSE ENG',
      items: [
        { id: 'storage', label: 'Storage Treemap', icon: HardDrive },
        { id: 'cleanup', label: 'Safe Cleanup', icon: Sparkles, badge: '5-Tier' },
        { id: 'reverse', label: 'Mach-O Inspector', icon: FileCode },
      ],
    },
    {
      groupName: 'SYSTEM & TOOLS',
      items: [
        { id: 'plugins', label: 'Plugin Manager', icon: Puzzle },
        { id: 'diagnostics', label: 'Benchmarks', icon: Gauge },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between select-none h-screen text-slate-300 font-sans">
      <div>
        {/* macOS Window Controls Padding & App Branding */}
        <div data-tauri-drag-region className="pt-10 pb-4 px-5 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-bold text-sm">
            MP
          </div>
          <div>
            <h1 className="font-semibold text-white tracking-tight text-sm">MacPulse</h1>
            <p className="text-[11px] text-slate-400 font-mono">v2.0 Native macOS</p>
          </div>
        </div>

        {/* Navigation Group Items */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group) => (
            <div key={group.groupName}>
              <h2 className="px-3 text-[10px] font-semibold text-slate-500 tracking-wider mb-2">
                {group.groupName}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 text-[11px] text-slate-500 flex justify-between items-center min-w-0">
        <span className="truncate pr-2 font-mono">Apple Silicon M-Series</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
      </div>
    </aside>
  );
};
