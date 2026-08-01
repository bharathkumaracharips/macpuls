'use client';

import React, { useState } from 'react';
import { Gauge, Cpu, HardDrive, RefreshCw } from 'lucide-react';
import { BenchmarkResult } from '@/types/tauri';
import { runCpuBenchmark, runDiskBenchmark } from '@/lib/ipc';

export const BenchmarkDiagnosticsView: React.FC = () => {
  const [cpuResult, setCpuResult] = useState<BenchmarkResult | null>(null);
  const [diskResult, setDiskResult] = useState<BenchmarkResult | null>(null);
  const [isRunningCpu, setIsRunningCpu] = useState(false);
  const [isRunningDisk, setIsRunningDisk] = useState(false);

  const handleRunCpu = async () => {
    setIsRunningCpu(true);
    const res = await runCpuBenchmark();
    setCpuResult(res);
    setIsRunningCpu(false);
  };

  const handleRunDisk = async () => {
    setIsRunningDisk(true);
    const res = await runDiskBenchmark();
    setDiskResult(res);
    setIsRunningDisk(false);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <Gauge className="w-6 h-6 text-cyan-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">CPU & SSD Benchmark Diagnostics</h2>
          <p className="text-xs text-slate-400">
            Run multi-threaded hash calculations and sequential disk throughput tests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Benchmark */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">CPU Stress & Hash Benchmark</h3>
            </div>
            <button
              onClick={handleRunCpu}
              disabled={isRunningCpu}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCpu ? 'animate-spin' : ''}`} />
              <span>{isRunningCpu ? 'Testing...' : 'Run Benchmark'}</span>
            </button>
          </div>

          {cpuResult ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Score:</span>
                <span className="text-emerald-400 font-bold text-base">{cpuResult.score} pts</span>
              </div>
              <p className="text-slate-400">{cpuResult.details}</p>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              Click &apos;Run Benchmark&apos; to start CPU test.
            </div>
          )}
        </div>

        {/* Disk Benchmark */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">SSD Sequential Read/Write Speed</h3>
            </div>
            <button
              onClick={handleRunDisk}
              disabled={isRunningDisk}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDisk ? 'animate-spin' : ''}`} />
              <span>{isRunningDisk ? 'Testing...' : 'Test Storage'}</span>
            </button>
          </div>

          {diskResult ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Score:</span>
                <span className="text-emerald-400 font-bold text-base">{diskResult.score} MB/s</span>
              </div>
              <p className="text-slate-400">{diskResult.details}</p>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              Click &apos;Test Storage&apos; to start sequential SSD I/O test.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
