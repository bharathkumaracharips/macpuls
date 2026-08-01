'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react';
import { RecommendationItem } from '@/types/tauri';
import { getRecommendations } from '@/lib/ipc';
import { useSystemStore } from '@/store/useSystemStore';

export const RecommendationCards: React.FC = () => {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const { setActiveTab } = useSystemStore();

  useEffect(() => {
    getRecommendations().then(setItems);
  }, []);

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <Lightbulb className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Intelligent Performance Recommendations</h2>
          <p className="text-xs text-slate-400">
            Real-time heuristic analyzer identifying RAM hogs, stale caches, and system optimizations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-indigo-500/60 transition">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {item.risk_level}
              </span>
            </div>

            <p className="text-xs text-slate-400">{item.reason}</p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300">
              Benefit: {item.estimated_benefit}
            </div>

            <button
              onClick={() => setActiveTab(item.action_type === 'clean_cache' ? 'cleanup' : 'processes')}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              <span>Take Suggested Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
