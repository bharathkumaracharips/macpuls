import { create } from 'zustand';
import { SystemMetricsSnapshot } from '@/types/tauri';
import { getLatestMetrics } from '@/lib/ipc';

export type ViewTab =
  | 'overview'
  | 'health'
  | 'cpu'
  | 'memory'
  | 'gpu'
  | 'network'
  | 'processes'
  | 'services'
  | 'threats'
  | 'reverse'
  | 'forensics'
  | 'storage'
  | 'cleanup'
  | 'history'
  | 'recommendations'
  | 'permissions'
  | 'plugins'
  | 'diagnostics'
  | 'settings';

interface SystemState {
  activeTab: ViewTab;
  metrics: SystemMetricsSnapshot | null;
  isLoading: boolean;
  searchCommandOpen: boolean;
  setActiveTab: (tab: ViewTab) => void;
  setSearchCommandOpen: (open: boolean) => void;
  fetchMetrics: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  activeTab: 'overview',
  metrics: null,
  isLoading: true,
  searchCommandOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchCommandOpen: (open) => set({ searchCommandOpen: open }),
  fetchMetrics: async () => {
    const data = await getLatestMetrics();
    set({ metrics: data, isLoading: false });
  },
}));
