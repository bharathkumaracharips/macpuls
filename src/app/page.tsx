'use client';

import React, { useEffect } from 'react';
import { XcodeSidebar } from '@/components/layout/XcodeSidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { useSystemStore } from '@/store/useSystemStore';
import { listen } from '@tauri-apps/api/event';
import { SystemMetricsSnapshot } from '@/types/tauri';

// Tab Views
import { SystemOverview } from '@/components/overview/SystemOverview';
import { CpuView } from '@/components/cpu/CpuView';
import { MemoryBreakdown } from '@/components/memory/MemoryBreakdown';
import { GpuView } from '@/components/gpu/GpuView';
import { ProcessTable } from '@/components/process/ProcessTable';
import { StorageTreemap } from '@/components/storage/StorageTreemap';
import { CleanupDashboard } from '@/components/cleanup/CleanupDashboard';
import { HistoryView } from '@/components/history/HistoryView';
import { RecommendationCards } from '@/components/recommendations/RecommendationCards';
import { PermissionsView } from '@/components/permissions/PermissionsView';
import { PluginsView } from '@/components/plugins/PluginsView';
import { BenchmarkDiagnosticsView } from '@/components/diagnostics/BenchmarkDiagnosticsView';
import { SettingsView } from '@/components/settings/SettingsView';

export default function Home() {
  const { activeTab, fetchMetrics } = useSystemStore();

  useEffect(() => {
    fetchMetrics();

    // Listen to real-time metrics_tick event emitted by Rust background worker
    let unlistenFn: (() => void) | null = null;

    listen<SystemMetricsSnapshot>('metrics_tick', (event) => {
      useSystemStore.setState({ metrics: event.payload, isLoading: false });
    }).then((unlisten) => {
      unlistenFn = unlisten;
    }).catch(() => {
      // Fallback polling for browser/dev mode
      const interval = setInterval(fetchMetrics, 1000);
      return () => clearInterval(interval);
    });

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, [fetchMetrics]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemOverview />;
      case 'cpu':
        return <CpuView />;
      case 'memory':
        return <MemoryBreakdown />;
      case 'gpu':
        return <GpuView />;
      case 'processes':
        return <ProcessTable />;
      case 'storage':
        return <StorageTreemap />;
      case 'cleanup':
        return <CleanupDashboard />;
      case 'history':
        return <HistoryView />;
      case 'recommendations':
        return <RecommendationCards />;
      case 'permissions':
        return <PermissionsView />;
      case 'plugins':
        return <PluginsView />;
      case 'diagnostics':
        return <BenchmarkDiagnosticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SystemOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <XcodeSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-slate-950/80 backdrop-blur-3xl">
          {renderActiveView()}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
