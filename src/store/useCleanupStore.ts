import { create } from 'zustand';
import { CleanupTarget } from '@/types/tauri';
import { scanCleanupCache, executeCleanup } from '@/lib/ipc';

interface CleanupState {
  targets: CleanupTarget[];
  isLoading: boolean;
  isExecuting: boolean;
  isConfirmModalOpen: boolean;
  lastReclaimedBytes: number | null;
  toggleTarget: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  fetchTargets: () => Promise<void>;
  confirmAndExecute: () => Promise<void>;
  setConfirmModalOpen: (open: boolean) => void;
}

export const useCleanupStore = create<CleanupState>((set, get) => ({
  targets: [],
  isLoading: true,
  isExecuting: false,
  isConfirmModalOpen: false,
  lastReclaimedBytes: null,
  toggleTarget: (id) => {
    set({
      targets: get().targets.map((t) => (t.id === id ? { ...t, is_selected: !t.is_selected } : t)),
    });
  },
  selectAll: () => {
    set({ targets: get().targets.map((t) => ({ ...t, is_selected: true })) });
  },
  deselectAll: () => {
    set({ targets: get().targets.map((t) => ({ ...t, is_selected: false })) });
  },
  fetchTargets: async () => {
    set({ isLoading: true });
    const list = await scanCleanupCache();
    set({ targets: list, isLoading: false });
  },
  confirmAndExecute: async () => {
    set({ isExecuting: true, isConfirmModalOpen: false });
    const list = get().targets;
    const reclaimed = await executeCleanup(list);
    set({ lastReclaimedBytes: reclaimed, isExecuting: false });
    await get().fetchTargets();
  },
  setConfirmModalOpen: (open) => set({ isConfirmModalOpen: open }),
}));
