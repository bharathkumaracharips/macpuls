'use client';

import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [interval, setInterval] = useState(1000);
  const [retentionDays, setRetentionDays] = useState(30);

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <Settings className="w-6 h-6 text-slate-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">App Preferences & Worker Settings</h2>
          <p className="text-xs text-slate-400">
            Configure sampling intervals, local database retention policies, and UI behavior.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white block">Background Sampling Interval</label>
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-none"
          >
            <option value={1000}>1000 ms (Real-time 1 sec)</option>
            <option value={2000}>2000 ms (Balanced 2 sec)</option>
            <option value={5000}>5000 ms (Low CPU 5 sec)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-white block">SQLite Metrics History Retention</label>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-none"
          >
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days (Recommended)</option>
            <option value={90}>90 Days</option>
          </select>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition">
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};
