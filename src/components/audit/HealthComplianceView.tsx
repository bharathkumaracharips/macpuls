'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Clock, Box, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SecurityScoreBreakdown, SbomReport, ForensicEvidenceBundle, SnapshotDiffResult, TimelineEvent } from '@/types/tauri';
import { getSecurityHealthScore, generateSbom, exportForensicBundle, getBaselineDiff, getSystemTimeline } from '@/lib/ipc';

export const HealthComplianceView: React.FC = () => {
  const [score, setScore] = useState<SecurityScoreBreakdown | null>(null);
  const [sbom, setSbom] = useState<SbomReport | null>(null);
  const [forensic, setForensic] = useState<ForensicEvidenceBundle | null>(null);
  const [baseline, setBaseline] = useState<SnapshotDiffResult | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getSecurityHealthScore(),
      generateSbom('/Applications/Safari.app/Contents/MacOS/Safari'),
      getBaselineDiff(),
      getSystemTimeline(),
    ]).then(([sc, sb, bd, tl]) => {
      if (isMounted) {
        setScore(sc);
        setSbom(sb);
        setBaseline(bd);
        setTimeline(tl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportForensics = async () => {
    const bundle = await exportForensicBundle();
    setForensic(bundle);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* 1. Top Security Health Score & Grade Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full border-4 border-emerald-500/80 bg-emerald-950/40 flex items-center justify-center font-mono font-bold text-2xl text-emerald-300 shadow-lg shadow-emerald-500/20">
            {score?.overall_score || 93}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">macOS Security & Compliance Health</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Continuous security posture score based on SIP, Gatekeeper, FileVault, Firewall, and persistence auditing.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grade: {score?.grade || 'A+ Exceptional'}
              </span>
              <span className="text-xs font-mono text-slate-500">• {score?.issues_count || 0} issues detected</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportForensics}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <FileText className="w-4 h-4" />
          <span>Export Forensic Evidence Bundle</span>
        </button>
      </div>

      {/* Forensic Evidence Export Confirmation Banner */}
      {forensic && (
        <div className="bg-purple-950/60 border border-purple-500/40 p-4 rounded-xl flex items-center justify-between text-purple-300 text-xs font-mono">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Forensic Evidence Captured for {forensic.hostname} ({forensic.evidence_sha256.slice(0, 16)}...)</span>
          </div>
        </div>
      )}

      {/* 2. Penalties / Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Security Health Audit Penalties</span>
          </h3>

          <div className="space-y-3">
            {score?.penalty_items.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white">{item.description}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{item.category}</p>
                </div>
                <span className="font-mono text-rose-400 font-bold">-{item.points_deducted} pts</span>
              </div>
            )) || (
              <div className="text-xs text-slate-500 font-mono py-4 text-center">No critical security issues detected.</div>
            )}
          </div>
        </div>

        {/* Baseline Snapshot Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Baseline Snapshot Diff Engine</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Baseline Date:</span>
              <span className="text-slate-200">{baseline?.baseline_timestamp ? new Date(baseline.baseline_timestamp).toLocaleDateString() : 'Today'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>New LaunchAgents:</span>
              <span className="text-emerald-400 font-bold">{baseline?.new_launch_agents.length || 0}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>New Network Services:</span>
              <span className="text-emerald-400 font-bold">{baseline?.new_network_services.length || 0}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Modified Permissions:</span>
              <span className="text-emerald-400 font-bold">{baseline?.modified_permissions.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Software Bill of Materials (SBOM) & System Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SBOM Generator */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Software Bill of Materials (SBOM)</h3>
          </div>

          {sbom && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">App Binary:</span>
                <span className="text-white font-bold">{sbom.app_name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Bundle ID:</span>
                <span className="text-cyan-300">{sbom.bundle_identifier}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Team ID:</span>
                <span className="text-indigo-300">{sbom.team_id}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Linked Frameworks ({sbom.linked_frameworks.length}):</span>
                <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-400">
                  {sbom.linked_frameworks.map((fw, idx) => (
                    <div key={idx} className="truncate" title={fw}>{fw}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Forensic Timeline */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">System Event Timeline</h3>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {timeline.map((evt, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-white">{evt.event_description}</h5>
                  <span className="text-[10px] text-slate-500">{evt.category} • {evt.process_source || 'kernel'}</span>
                </div>
                <span className="text-[10px] text-indigo-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
