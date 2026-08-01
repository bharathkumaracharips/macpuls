import { create } from 'zustand';
import { TreemapNode, DuplicateGroup } from '@/types/tauri';
import { scanTreemap, scanDuplicates } from '@/lib/ipc';

interface StorageState {
  treemapRoot: TreemapNode | null;
  duplicateGroups: DuplicateGroup[];
  isScanningTreemap: boolean;
  isScanningDuplicates: boolean;
  currentTreemapPath: string;
  fetchTreemap: (path?: string) => Promise<void>;
  fetchDuplicates: (scanDir?: string) => Promise<void>;
}

export const useStorageStore = create<StorageState>((set) => ({
  treemapRoot: null,
  duplicateGroups: [],
  isScanningTreemap: false,
  isScanningDuplicates: false,
  currentTreemapPath: '/',
  fetchTreemap: async (path = '/') => {
    set({ isScanningTreemap: true, currentTreemapPath: path });
    const node = await scanTreemap(path);
    set({ treemapRoot: node, isScanningTreemap: false });
  },
  fetchDuplicates: async (scanDir = '/Users') => {
    set({ isScanningDuplicates: true });
    const dups = await scanDuplicates(scanDir);
    set({ duplicateGroups: dups, isScanningDuplicates: false });
  },
}));
