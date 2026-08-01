'use client';

import React, { useEffect, useState } from 'react';
import { Puzzle } from 'lucide-react';
import { PluginInfo } from '@/types/tauri';
import { getPlugins } from '@/lib/ipc';

export const PluginsView: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);

  useEffect(() => {
    getPlugins().then(setPlugins);
  }, []);

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <Puzzle className="w-6 h-6 text-purple-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Plugin Extensions Manager</h2>
          <p className="text-xs text-slate-400">
            Modular telemetry providers for Docker Desktop, Xcode, and Homebrew.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-white">{plugin.name}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                {plugin.status}
              </span>
            </div>

            <p className="text-xs text-slate-400">{plugin.description}</p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300">
              {plugin.details_summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
