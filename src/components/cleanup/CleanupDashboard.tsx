'use client';

import React, { useEffect } from 'react';
import { useCleanupStore } from '@/store/useCleanupStore';
import { Sparkles, ShieldCheck, CheckSquare, Square, Trash2, AlertTriangle } from 'lucide-react';
import { SafetyTier } from '@/types/tauri';

export const CleanupDashboard: React.FC = () => {
  const {
    targets,
    isExecuting,
    isConfirmModalOpen,
    lastReclaimedBytes,
    toggleTarget,
    selectAll,
    deselectAll,
    fetchTargets,
    confirmAndExecute,
    setConfirmModalOpen,
  } = useCleanupStore();

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const selectedTargets = targets.filter((t) => t.is_selected);
  const totalSelectedBytes = selectedTargets.reduce((acc, t) => acc + t.size_bytes, 0);

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
  };

  const getSafetyBadge = (tier: SafetyTier) => {
    switch (tier) {
      case 'Safe':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Safe</span>;
      case 'Recommended':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Recommended</span>;
      case 'Advanced':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Advanced</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Review</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Reclaimed Banner */}
      {lastReclaimedBytes !== null && (
        <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cleaned successfully! Reclaimed {formatSize(lastReclaimedBytes)} of disk space.</span>
          </div>
        </div>
      )}

      {/* Control Topbar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">5-Tier CleanMyMac Safe Cleanup Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Classified by safety tier. System kernel paths (`/System`, `/usr`) are strictly read-only and blocked.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-xs text-slate-400 hover:text-white underline font-mono"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="text-xs text-slate-400 hover:text-white underline font-mono"
          >
            Deselect All
          </button>
          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={selectedTargets.length === 0 || isExecuting}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clean {formatSize(totalSelectedBytes)}</span>
          </button>
        </div>
      </div>

      {/* Targets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((target) => (
          <div
            key={target.id}
            onClick={() => toggleTarget(target.id)}
            className={`bg-slate-900 border p-5 rounded-2xl space-y-3 cursor-pointer transition-all ${
              target.is_selected ? 'border-indigo-500/80 bg-indigo-950/10' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {target.is_selected ? (
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">{target.category_name}</h4>
                  <p className="text-[11px] text-slate-400">{target.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  {formatSize(target.size_bytes)}
                </span>
                {getSafetyBadge(target.safety_tier)}
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span className="truncate max-w-[220px]" title={target.path}>{target.path}</span>
              <span className="text-slate-500 text-[10px]">{target.rationale}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Explicit Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl font-sans">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Safe Cleanup</h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                You are about to purge <strong className="text-white font-mono">{formatSize(totalSelectedBytes)}</strong> across {selectedTargets.length} selected target categories:
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
                {selectedTargets.map((t) => (
                  <div key={t.id} className="flex justify-between items-center text-slate-300">
                    <span className="truncate max-w-[240px]">{t.category_name}</span>
                    <span className="text-emerald-400">{formatSize(t.size_bytes)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl text-[11px] text-indigo-300">
                Rationale: All selected categories are safe developer/system caches or purgeable items. System paths remain protected.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndExecute}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition"
              >
                Confirm & Reclaim {formatSize(totalSelectedBytes)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
