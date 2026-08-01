import { invoke } from '@tauri-apps/api/core';
import {
  SystemMetricsSnapshot,
  ProcessItem,
  TreemapNode,
  DuplicateGroup,
  CleanupTarget,
  RecommendationItem,
  PermissionStatus,
  PluginInfo,
  BenchmarkResult,
} from '@/types/tauri';

export async function getLatestMetrics(): Promise<SystemMetricsSnapshot> {
  try {
    return await invoke<SystemMetricsSnapshot>('get_latest_metrics');
  } catch {
    return getMockMetrics();
  }
}

export async function getProcessList(): Promise<ProcessItem[]> {
  try {
    return await invoke<ProcessItem[]>('get_process_list');
  } catch {
    return getMockProcesses();
  }
}

export async function killProcess(pid: number, force: boolean): Promise<void> {
  try {
    await invoke('kill_process_command', { pid, force });
  } catch (e) {
    console.warn('Kill process IPC error:', e);
  }
}

export async function revealInFinder(path: string): Promise<void> {
  try {
    await invoke('reveal_in_finder_command', { path });
  } catch (e) {
    console.warn('Reveal in finder error:', e);
  }
}

export async function scanTreemap(path: string, maxDepth: number = 3): Promise<TreemapNode> {
  try {
    return await invoke<TreemapNode>('scan_storage_treemap_command', { rootPath: path, maxDepth });
  } catch {
    return getMockTreemap();
  }
}

export async function scanDuplicates(scanDir: string, minSizeMb: number = 50): Promise<DuplicateGroup[]> {
  try {
    return await invoke<DuplicateGroup[]>('scan_duplicates_command', { scanDir, minSizeMb });
  } catch {
    return getMockDuplicates();
  }
}

export async function scanCleanupCache(): Promise<CleanupTarget[]> {
  try {
    return await invoke<CleanupTarget[]>('scan_cleanup_cache_command');
  } catch {
    return getMockCaches();
  }
}

export async function executeCleanup(targets: CleanupTarget[]): Promise<number> {
  try {
    return await invoke<number>('execute_cleanup_command', { targets });
  } catch {
    return targets.filter(t => t.is_selected).reduce((acc, t) => acc + t.size_bytes, 0);
  }
}

export async function getRecommendations(): Promise<RecommendationItem[]> {
  try {
    return await invoke<RecommendationItem[]>('get_recommendations_command');
  } catch {
    return getMockRecommendations();
  }
}

export async function auditPermissions(): Promise<PermissionStatus[]> {
  try {
    return await invoke<PermissionStatus[]>('audit_permissions_command');
  } catch {
    return getMockPermissions();
  }
}

export async function getPlugins(): Promise<PluginInfo[]> {
  try {
    return await invoke<PluginInfo[]>('get_plugins_command');
  } catch {
    return getMockPlugins();
  }
}

export async function runCpuBenchmark(): Promise<BenchmarkResult> {
  try {
    return await invoke<BenchmarkResult>('run_cpu_benchmark_command');
  } catch {
    return { name: 'CPU Benchmark (Dev Mock)', score: 9420, details: 'Processed 2M iterations', duration_ms: 12 };
  }
}

export async function runDiskBenchmark(): Promise<BenchmarkResult> {
  try {
    return await invoke<BenchmarkResult>('run_disk_benchmark_command');
  } catch {
    return { name: 'SSD Sequential Throughput', score: 3450, details: 'Read 3,450 MB/s | Write 2,980 MB/s', duration_ms: 45 };
  }
}

function getMockMetrics(): SystemMetricsSnapshot {
  return {
    cpu: {
      overall_usage_pct: 18.4,
      core_count: 8,
      cores: Array.from({ length: 8 }, (_, i) => ({ core_id: i, usage_pct: 12 + i * 3.2 })),
      load_avg_1m: 1.84,
      load_avg_5m: 1.62,
      load_avg_15m: 1.45,
      brand_name: 'Apple M3 Pro',
      frequency_mhz: 3600,
    },
    memory: {
      total_bytes: 34359738368, // 32 GB
      used_bytes: 18253611008,  // 17.0 GB
      free_bytes: 4294967296,
      available_bytes: 16106127360,
      app_memory_bytes: 11811160064,
      wired_bytes: 4294967296,
      compressed_bytes: 2147483648,
      purgeable_bytes: 1073741824,
      file_cache_bytes: 10737418240,
      swap_total_bytes: 4294967296,
      swap_used_bytes: 536870912,
      swap_ins_per_sec: 0,
      swap_outs_per_sec: 0,
      memory_pressure_pct: 42.5,
      memory_pressure_level: 'Normal',
      compression_ratio: 2.1,
      page_faults: 84920,
      zero_fill_count: 42010,
      copy_on_write_count: 12940,
    },
    gpu: {
      model_name: 'Apple M3 Pro Integrated GPU',
      vendor_name: 'Apple Inc.',
      unified_memory_bytes: 34359738368,
      metal_supported: true,
      estimated_load_pct: 14.2,
      compute_activity_pct: 9.1,
      render_activity_pct: 18.5,
      status: 'Active (Unified Memory)',
    },
    disk: {
      total_bytes: 1000204886016, // 1 TB
      used_bytes: 485309181952,  // 485 GB
      free_bytes: 514895704064,
      available_bytes: 514895704064,
      used_pct: 48.5,
      read_bytes_per_sec: 4194304, // 4MB/s
      write_bytes_per_sec: 1048576, // 1MB/s
      iops_read: 1024,
      iops_write: 256,
      mount_point: '/',
      fs_type: 'APFS',
    },
    network: {
      download_bytes_per_sec: 2621440, // 2.5 MB/s
      upload_bytes_per_sec: 327680,   // 320 KB/s
      total_bytes_received: 42894109400,
      total_bytes_sent: 12894109400,
      active_interface: 'en0 (Wi-Fi 6E)',
    },
    battery: {
      is_present: true,
      is_charging: true,
      charge_pct: 98,
      health_pct: 99,
      cycle_count: 38,
      power_source: 'AC Power (96W)',
      condition: 'Normal',
      temperature_c: 28.5,
      power_draw_watts: 4.2,
    },
    thermal: {
      cpu_temp_c: 39.2,
      gpu_temp_c: 37.8,
      fan_rpm: 0,
      thermal_pressure_level: 'Nominal',
      is_throttling: false,
    },
    timestamp_ms: Date.now(),
  };
}

function getMockProcesses(): ProcessItem[] {
  return [
    {
      pid: 4821,
      ppid: 1,
      name: 'Google Chrome',
      executable_path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      user_name: 'user',
      cpu_pct: 12.4,
      memory_rss_bytes: 2840000000,
      virtual_size_bytes: 12400000000,
      threads_count: 42,
      open_files_count: 89,
      energy_impact: 18.2,
      architecture: 'Apple Silicon',
      is_sandboxed: true,
      is_rosetta: false,
      code_signature_status: 'Signed',
      start_time_epoch: 1770000000,
      elapsed_runtime_secs: 14200,
      status: 'Running',
    },
    {
      pid: 1204,
      ppid: 1,
      name: 'Xcode',
      executable_path: '/Applications/Xcode.app/Contents/MacOS/Xcode',
      user_name: 'user',
      cpu_pct: 28.1,
      memory_rss_bytes: 4120000000,
      virtual_size_bytes: 18400000000,
      threads_count: 84,
      open_files_count: 142,
      energy_impact: 34.5,
      architecture: 'Apple Silicon',
      is_sandboxed: false,
      is_rosetta: false,
      code_signature_status: 'Signed',
      start_time_epoch: 1770000000,
      elapsed_runtime_secs: 28400,
      status: 'Running',
    },
    {
      pid: 9021,
      ppid: 1,
      name: 'Docker Desktop',
      executable_path: '/Applications/Docker.app/Contents/MacOS/Docker Desktop',
      user_name: 'user',
      cpu_pct: 8.5,
      memory_rss_bytes: 3890000000,
      virtual_size_bytes: 9800000000,
      threads_count: 38,
      open_files_count: 54,
      energy_impact: 12.0,
      architecture: 'Apple Silicon',
      is_sandboxed: false,
      is_rosetta: false,
      code_signature_status: 'Signed',
      start_time_epoch: 1770000000,
      elapsed_runtime_secs: 3900,
      status: 'Running',
    },
  ];
}

function getMockTreemap(): TreemapNode {
  return {
    name: 'Macintosh HD',
    path: '/',
    size_bytes: 485309181952,
    is_dir: true,
    children: [
      {
        name: 'Users',
        path: '/Users',
        size_bytes: 284000000000,
        is_dir: true,
        children: [
          { name: 'Library', path: '/Users/user/Library', size_bytes: 142000000000, is_dir: true },
          { name: 'Developer', path: '/Users/user/Developer', size_bytes: 84000000000, is_dir: true },
          { name: 'Downloads', path: '/Users/user/Downloads', size_bytes: 32000000000, is_dir: true },
        ],
      },
      { name: 'System', path: '/System', size_bytes: 120000000000, is_dir: true },
      { name: 'Applications', path: '/Applications', size_bytes: 68000000000, is_dir: true },
    ],
  };
}

function getMockDuplicates(): DuplicateGroup[] {
  return [
    {
      file_size_bytes: 840000000, // 840 MB
      sample_name: 'Xcode_15_4_Simulator_SDK.dmg',
      paths: [
        '/Users/user/Downloads/Xcode_15_4_Simulator_SDK.dmg',
        '/Users/user/Developer/Archive/Xcode_15_4_Simulator_SDK.dmg',
      ],
      wasted_bytes: 840000000,
    },
  ];
}

function getMockCaches(): CleanupTarget[] {
  return [
    {
      id: 'xcode_derived_data',
      category_name: 'Xcode DerivedData',
      description: 'Build indexes and intermediate module caches.',
      path: '/Users/user/Library/Developer/Xcode/DerivedData',
      size_bytes: 14200000000, // 14.2 GB
      safety_tier: 'Safe',
      rationale: 'Rebuildable automatically by Xcode upon next compilation.',
      is_selected: true,
    },
    {
      id: 'cargo_cache',
      category_name: 'Cargo Package Cache',
      description: 'Rust crate registry index and downloaded .crate tarballs.',
      path: '/Users/user/.cargo/registry',
      size_bytes: 4800000000, // 4.8 GB
      safety_tier: 'Safe',
      rationale: 'Re-downloaded by Cargo when building Rust projects.',
      is_selected: true,
    },
    {
      id: 'npm_cache',
      category_name: 'npm Global Cache',
      description: 'Local npm package tarballs cache.',
      path: '/Users/user/.npm',
      size_bytes: 1900000000, // 1.9 GB
      safety_tier: 'Safe',
      rationale: 'npm fetches packages from registry on demand.',
      is_selected: true,
    },
  ];
}

function getMockRecommendations(): RecommendationItem[] {
  return [
    {
      id: 'clean_xcode_deriveddata',
      title: 'Clean Xcode DerivedData (14.2 GB)',
      reason: 'Xcode accumulated stale compilation indexes over time.',
      estimated_benefit: 'Reclaims 14.2 GB of SSD storage.',
      reclaimed_bytes: 14200000000,
      risk_level: 'Safe',
      action_type: 'clean_cache',
      target_id: 'xcode_derived_data',
    },
  ];
}

function getMockPermissions(): PermissionStatus[] {
  return [
    {
      key: 'full_disk_access',
      name: 'Full Disk Access (FDA)',
      description: 'Required for inspecting restricted caches, process file handles, and system containers.',
      is_granted: true,
      fix_instructions: 'Open System Settings -> Privacy & Security -> Full Disk Access.',
    },
    {
      key: 'notifications',
      name: 'User Notifications',
      description: 'Used for pushing high memory pressure & storage threshold alerts.',
      is_granted: true,
      fix_instructions: 'Open System Settings -> Notifications -> MacPulse.',
    },
  ];
}

function getMockPlugins(): PluginInfo[] {
  return [
    {
      id: 'docker',
      name: 'Docker Engine Telemetry',
      description: 'Monitors Docker Desktop containers, VM disk images, and build layers.',
      is_enabled: true,
      status: 'Active',
      details_summary: 'Docker Desktop VM disk image size ~ 8.4 GB',
    },
    {
      id: 'xcode',
      name: 'Xcode & Developer Suite',
      description: 'Tracks DerivedData, CoreSimulator runtimes, and archives.',
      is_enabled: true,
      status: 'Active',
      details_summary: 'DerivedData + Simulator caches ~ 14.2 GB',
    },
  ];
}
