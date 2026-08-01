'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Server } from 'lucide-react';
import { LaunchServiceItem } from '@/types/tauri';
import { listLaunchServices } from '@/lib/ipc';

export const ServicesManagerView: React.FC = () => {
  const [services, setServices] = useState<LaunchServiceItem[]>([]);
  const [search, setSearch] = useState('');

  const fetchServices = async () => {
    const list = await listLaunchServices();
    setServices(list);
  };

  useEffect(() => {
    let isMounted = true;
    listLaunchServices().then((list) => {
      if (isMounted) setServices(list);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">macOS `launchctl` Running Services Manager</h2>
            <p className="text-xs text-slate-400">
              Inspect active system daemons, launch agents, PIDs, restart policies, and configuration plists.
            </p>
          </div>
        </div>

        <button
          onClick={fetchServices}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter launchctl services by name or PID..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Services Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-3 px-4">PID</th>
                <th className="py-3 px-4">Service Label</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Plist Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((svc, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                  <td className="py-2.5 px-4 text-slate-500">{svc.pid ?? '—'}</td>
                  <td className="py-2.5 px-4 text-white font-bold">{svc.name}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      svc.status === 'Running' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {svc.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-xs" title={svc.plist_path}>
                    {svc.plist_path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
