'use client';

import React, { useState } from 'react';
import { ShieldAlert, Search, FileSearch, Usb } from 'lucide-react';
import { BinaryThreatReport, IocMatch, UsbVolumeInspection } from '@/types/tauri';
import { analyzeThreatBinary, searchIoc, inspectUsbVolumes } from '@/lib/ipc';

export const ThreatInspectorView: React.FC = () => {
  const [targetPath, setTargetPath] = useState('/Applications/Safari.app/Contents/MacOS/Safari');
  const [report, setReport] = useState<BinaryThreatReport | null>(null);
  const [iocQuery, setIocQuery] = useState('');
  const [iocMatches, setIocMatches] = useState<IocMatch[]>([]);
  const [usbVolumes, setUsbVolumes] = useState<UsbVolumeInspection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const res = await analyzeThreatBinary(targetPath);
    setReport(res);
    setIsAnalyzing(false);
  };

  const handleIocSearch = async () => {
    if (!iocQuery.trim()) return;
    const matches = await searchIoc(iocQuery);
    setIocMatches(matches);
  };

  const handleInspectUsb = async () => {
    const vols = await inspectUsbVolumes();
    setUsbVolumes(vols);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-rose-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Threat Inspector, YARA Engine & IOC Scanner</h2>
          <p className="text-xs text-slate-400">
            Deterministic binary inspection, signature validation, YARA rule pattern matching, and Indicators of Compromise (IOC) search.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Binary & Application Inspector */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Binary / Executable Inspector</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="Target binary path..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition disabled:opacity-50"
            >
              Analyze
            </button>
          </div>

          {report && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Executable:</span>
                <span className="text-white font-bold">{report.file_name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Code Signature:</span>
                <span className={report.is_unsigned ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {report.code_signature_status}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Architecture:</span>
                <span className="text-purple-300">{report.architecture}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Team ID:</span>
                <span className="text-indigo-300">{report.team_id}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Risk Score:</span>
                <span className={report.risk_score > 30 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {report.risk_score} / 100
                </span>
              </div>
            </div>
          )}
        </div>

        {/* IOC Search Engine */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">IOC (Indicators of Compromise) Search</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={iocQuery}
              onChange={(e) => setIocQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIocSearch()}
              placeholder="Search Hashes, IPs, Domains, Filenames..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleIocSearch}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition"
            >
              Search
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {iocMatches.map((match, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex justify-between text-cyan-300 font-bold">
                  <span>{match.ioc_type}</span>
                  <span>{match.match_location}</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{match.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* USB Auto-Inspector Panel */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Usb className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">USB & External Mass Storage Inspector</h3>
          </div>
          <button
            onClick={handleInspectUsb}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-700 transition"
          >
            Inspect Drives
          </button>
        </div>

        {usbVolumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {usbVolumes.map((vol, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-white font-bold">
                  <span>{vol.volume_name}</span>
                  <span className="text-emerald-400">{vol.status}</span>
                </div>
                <p className="text-slate-400 text-[11px]">Mount: {vol.mount_point}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 font-mono text-center">
            No external USB drives connected. Ready for auto-detection on insert.
          </div>
        )}
      </div>
    </div>
  );
};
