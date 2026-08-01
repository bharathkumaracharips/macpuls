'use client';

import React, { useEffect } from 'react';
import { useStorageStore } from '@/store/useStorageStore';
import { HardDrive, Folder, File, RefreshCw } from 'lucide-react';

export const StorageTreemap: React.FC = () => {
  const { treemapRoot, isScanningTreemap, currentTreemapPath, fetchTreemap } = useStorageStore();

  useEffect(() => {
    if (!treemapRoot) {
      fetchTreemap('/Users');
    }
  }, [treemapRoot, fetchTreemap]);

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Control bar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Path: {currentTreemapPath}</span>
        </div>
        <button
          onClick={() => fetchTreemap(currentTreemapPath)}
          disabled={isScanningTreemap}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanningTreemap ? 'animate-spin' : ''}`} />
          <span>{isScanningTreemap ? 'Scanning Rayon Engine...' : 'Scan Directory'}</span>
        </button>
      </div>

      {/* DaisyDisk Interactive Treemap Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">DaisyDisk-Style Interactive Directory Blocks</h3>
          <span className="text-xs text-slate-400 font-mono">
            {treemapRoot ? `Total Size: ${formatSize(treemapRoot.size_bytes)}` : ''}
          </span>
        </div>

        {treemapRoot && treemapRoot.children && treemapRoot.children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treemapRoot.children.map((child, idx) => {
              const pct = treemapRoot.size_bytes > 0 ? (child.size_bytes / treemapRoot.size_bytes) * 100 : 0;
              return (
                <div
                  key={child.path + idx}
                  onClick={() => child.is_dir && fetchTreemap(child.path)}
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500/60 p-4 rounded-xl space-y-3 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {child.is_dir ? (
                        <Folder className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <File className="w-4 h-4 text-purple-400" />
                      )}
                      <span className="text-xs font-semibold text-white truncate max-w-[140px]" title={child.name}>
                        {child.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{formatSize(child.size_bytes)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Proportion</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            {isScanningTreemap ? 'Scanning filesystem using multi-threaded Rayon worker...' : 'No files or directory items found.'}
          </div>
        )}
      </div>
    </div>
  );
};
