import { create } from 'zustand';
import { ProcessItem } from '@/types/tauri';
import { getProcessList, killProcess } from '@/lib/ipc';

interface ProcessState {
  processes: ProcessItem[];
  searchQuery: string;
  sortBy: 'cpu' | 'memory' | 'energy' | 'pid';
  selectedProcess: ProcessItem | null;
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'cpu' | 'memory' | 'energy' | 'pid') => void;
  setSelectedProcess: (proc: ProcessItem | null) => void;
  fetchProcesses: () => Promise<void>;
  killSelectedProcess: (force: boolean) => Promise<void>;
}

export const useProcessStore = create<ProcessState>((set, get) => ({
  processes: [],
  searchQuery: '',
  sortBy: 'memory',
  selectedProcess: null,
  isLoading: true,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedProcess: (proc) => set({ selectedProcess: proc }),
  fetchProcesses: async () => {
    const list = await getProcessList();
    set({ processes: list, isLoading: false });
  },
  killSelectedProcess: async (force) => {
    const selected = get().selectedProcess;
    if (selected) {
      await killProcess(selected.pid, force);
      set({ selectedProcess: null });
      await get().fetchProcesses();
    }
  },
}));
