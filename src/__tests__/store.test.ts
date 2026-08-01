import { describe, it, expect } from 'vitest';
import { useSystemStore } from '../store/useSystemStore';
import { useProcessStore } from '../store/useProcessStore';

describe('Zustand System & Process Stores', () => {
  it('should initialize active tab to overview and switch tabs correctly', () => {
    const { activeTab, setActiveTab } = useSystemStore.getState();
    expect(activeTab).toBe('overview');

    setActiveTab('cpu');
    expect(useSystemStore.getState().activeTab).toBe('cpu');

    setActiveTab('memory');
    expect(useSystemStore.getState().activeTab).toBe('memory');
  });

  it('should update process search query and sort criteria', () => {
    const { setSearchQuery, setSortBy } = useProcessStore.getState();

    setSearchQuery('WindowServer');
    expect(useProcessStore.getState().searchQuery).toBe('WindowServer');

    setSortBy('cpu');
    expect(useProcessStore.getState().sortBy).toBe('cpu');
  });
});
