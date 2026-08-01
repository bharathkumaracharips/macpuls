'use client';

import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, LayoutDashboard, Cpu, Database, HardDrive, Sparkles, History, ShieldCheck, Gauge } from 'lucide-react';
import { useSystemStore, ViewTab } from '@/store/useSystemStore';

export const CommandPalette: React.FC = () => {
  const { searchCommandOpen, setSearchCommandOpen, setActiveTab } = useSystemStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchCommandOpen(!searchCommandOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchCommandOpen, setSearchCommandOpen]);

  if (!searchCommandOpen) return null;

  const navigate = (tab: ViewTab) => {
    setActiveTab(tab);
    setSearchCommandOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-slate-800">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <Command.Input
              autoFocus
              placeholder="Search views, processes, or commands... (e.g. Storage, Cleanup, Memory)"
              className="w-full bg-transparent py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <Command.List className="p-2 max-h-80 overflow-y-auto space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-slate-500">
              No matching command found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[10px] font-semibold text-slate-500 px-2 py-1">
              <Command.Item
                onSelect={() => navigate('overview')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Go to System Overview</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('cpu')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Go to CPU Cores</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('memory')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <Database className="w-4 h-4 text-purple-400" />
                <span>Go to Memory & VM Breakdown</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('storage')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Go to Storage Treemap</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('cleanup')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Run Safe Cleanup Engine</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('history')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <History className="w-4 h-4 text-rose-400" />
                <span>View Historical Metrics</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('permissions')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Audit macOS Permissions</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('diagnostics')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/80 hover:text-white cursor-pointer"
              >
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Run CPU & SSD Benchmarks</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="p-2 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center text-[11px] text-slate-500 px-4">
            <span>Use ↑ ↓ to navigate</span>
            <span>ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
