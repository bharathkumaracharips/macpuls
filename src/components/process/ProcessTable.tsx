'use client';

import React, { useEffect } from 'react';
import { useProcessStore } from '@/store/useProcessStore';
import { Search, Trash2, FolderOpen } from 'lucide-react';
import { revealInFinder } from '@/lib/ipc';

export const ProcessTable: React.FC = () => {
  const {
    processes,
    searchQuery,
    sortBy,
    selectedProcess,
    setSearchQuery,
    setSortBy,
    setSelectedProcess,
    fetchProcesses,
    killSelectedProcess,
  } = useProcessStore();

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 2000);
    return () => clearInterval(interval);
  }, [fetchProcesses]);

  const filtered = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toString().includes(searchQuery) ||
      p.executable_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'cpu') return b.cpu_pct - a.cpu_pct;
    if (sortBy === 'memory') return b.memory_rss_bytes - a.memory_rss_bytes;
    if (sortBy === 'energy') return b.energy_impact - a.energy_impact;
    return a.pid - b.pid;
  });

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(0) + ' MB';

  return (
    <div className="p-6 space-y-4 select-none font-sans">
      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter processes by name or PID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Sort By:</span>
          <button
            onClick={() => setSortBy('memory')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              sortBy === 'memory'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            RAM RSS
          </button>
          <button
            onClick={() => setSortBy('cpu')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              sortBy === 'cpu'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            CPU %
          </button>
          <button
            onClick={() => setSortBy('energy')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              sortBy === 'energy'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Energy Impact
          </button>
        </div>
      </div>

      {/* Table & Details Modal layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950 sticky top-0 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PID</th>
                  <th className="py-3 px-4">Process Name</th>
                  <th className="py-3 px-4">CPU %</th>
                  <th className="py-3 px-4">RAM RSS</th>
                  <th className="py-3 px-4">Arch</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sorted.map((proc) => {
                  const isSelected = selectedProcess?.pid === proc.pid;
                  return (
                    <tr
                      key={proc.pid}
                      onClick={() => setSelectedProcess(proc)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-900/40 text-white font-medium' : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-500">{proc.pid}</td>
                      <td className="py-2.5 px-4 font-semibold text-white flex items-center gap-2">
                        <span>{proc.name}</span>
                        {proc.is_sandboxed && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            Sandbox
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-indigo-300">{proc.cpu_pct.toFixed(1)}%</td>
                      <td className="py-2.5 px-4 font-mono text-purple-300">{formatMB(proc.memory_rss_bytes)}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          proc.is_rosetta ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {proc.architecture}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">{proc.code_signature_status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Process Detail Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
          {selectedProcess ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedProcess.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">PID {selectedProcess.pid} • PPID {selectedProcess.ppid}</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  {selectedProcess.architecture}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Executable Path:</span>
                  <span className="truncate max-w-[200px]" title={selectedProcess.executable_path}>
                    {selectedProcess.executable_path || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Memory RSS:</span>
                  <span className="text-purple-300 font-bold">{formatMB(selectedProcess.memory_rss_bytes)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">CPU Usage:</span>
                  <span className="text-indigo-300 font-bold">{selectedProcess.cpu_pct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Threads Count:</span>
                  <span>{selectedProcess.threads_count}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Open Files:</span>
                  <span>{selectedProcess.open_files_count}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Code Signature:</span>
                  <span className="text-emerald-400">{selectedProcess.code_signature_status}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => revealInFinder(selectedProcess.executable_path)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-medium transition"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Reveal in Finder</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => killSelectedProcess(false)}
                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 py-2 rounded-xl text-xs font-medium transition"
                  >
                    Quit Process
                  </button>
                  <button
                    onClick={() => killSelectedProcess(true)}
                    className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 py-2 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Force Quit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Select a process from the table to inspect Mach task memory, open file handles, and controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
