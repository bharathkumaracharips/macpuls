'use client';

import React, { useState } from 'react';
import { Cpu, Layers, FileCode, RefreshCw } from 'lucide-react';
import { MachOInspectionReport } from '@/types/tauri';
import { inspectMachoBinary, extractStrings } from '@/lib/ipc';

export const ReverseEngineeringView: React.FC = () => {
  const [binaryPath, setBinaryPath] = useState('/bin/ls');
  const [machoReport, setMachoReport] = useState<MachOInspectionReport | null>(null);
  const [extractedStrings, setExtractedStrings] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);

  const handleInspect = async () => {
    setIsInspecting(true);
    const rep = await inspectMachoBinary(binaryPath);
    const strs = await extractStrings(binaryPath, 6);
    setMachoReport(rep);
    setExtractedStrings(strs);
    setIsInspecting(false);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <Cpu className="w-6 h-6 text-purple-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Mach-O Reverse Engineering & Binary Analysis Toolkit</h2>
          <p className="text-xs text-slate-400">
            Read-only static binary analyzer for Mach-O headers, Universal fat architectures, linked dynamic libraries (`otool -L`), symbols (`nm`), entitlements, and strings.
          </p>
        </div>
      </div>

      {/* Target input */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-3">
        <input
          type="text"
          value={binaryPath}
          onChange={(e) => setBinaryPath(e.target.value)}
          placeholder="Path to Mach-O binary (e.g. /bin/ls or /Applications/Safari.app/Contents/MacOS/Safari)..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleInspect}
          disabled={isInspecting}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
          <span>Inspect Binary</span>
        </button>
      </div>

      {machoReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mach-O Header & Dylibs */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Mach-O Header & Linked Dylibs</h3>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Binary Name:</span>
                <span className="text-white font-bold">{machoReport.file_name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Architectures:</span>
                <span className="text-purple-300 font-bold">{machoReport.architectures.join(' / ')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fat Universal Binary:</span>
                <span className="text-emerald-400">{machoReport.is_fat_universal ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>SHA-256:</span>
                <span className="truncate max-w-[200px] text-slate-400" title={machoReport.sha256}>
                  {machoReport.sha256.slice(0, 20)}...
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Linked Dynamic Libraries (`otool -L`):</h4>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-40 overflow-y-auto space-y-1 text-[11px] font-mono text-indigo-300">
                {machoReport.linked_frameworks.map((lib, idx) => (
                  <div key={idx} className="truncate" title={lib}>{lib}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ASCII / UTF-8 Strings Extractor */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Extracted Strings (`strings -a`)</h3>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-80 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
              {extractedStrings.map((str, idx) => (
                <div key={idx} className="hover:text-white truncate" title={str}>{str}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
