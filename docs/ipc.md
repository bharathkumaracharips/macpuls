# MacPulse IPC Interface & Payload Reference 📡

MacPulse uses **Tauri v2 IPC** to bridge the React/TypeScript frontend (`src/lib/ipc.ts`) with the native macOS Rust backend (`src-tauri/src/commands.rs`).

---

## ⚡ Real-Time Telemetry Event

### `metrics_tick` (Server-Sent Event)
- **Frequency**: Every 1000ms
- **Direction**: Rust Backend ➔ Next.js Frontend
- **Payload Schema (`SystemMetricsSnapshot`)**:

```typescript
interface SystemMetricsSnapshot {
  cpu: {
    overall_usage_pct: number;      // e.g. 14.5
    core_count: number;             // e.g. 8
    cores: Array<{ core_id: number; usage_pct: number }>;
    load_avg_1m: number;
    load_avg_5m: number;
    load_avg_15m: number;
    brand_name: string;             // e.g. "Apple M2"
    frequency_mhz: number;
  };
  memory: {
    total_bytes: number;
    used_bytes: number;
    free_bytes: number;
    available_bytes: number;
    app_memory_bytes: number;
    wired_bytes: number;
    compressed_bytes: number;
    purgeable_bytes: number;
    file_cache_bytes: number;
    swap_total_bytes: number;
    swap_used_bytes: number;
    memory_pressure_pct: number;
    memory_pressure_level: "Normal" | "Warning" | "Critical";
    compression_ratio: number;
  };
  gpu: {
    gpu_name: string;               // e.g. "Apple M2 GPU"
    gpu_usage_pct: number;
    vram_used_bytes: number;
    vram_total_bytes: number;
  };
  disk: {
    total_bytes: number;
    used_bytes: number;
    free_bytes: number;
    used_pct: number;
    read_bytes_per_sec: number;
    write_bytes_per_sec: number;
  };
  network: {
    interface_name: string;         // e.g. "en0"
    rx_bytes_per_sec: number;
    tx_bytes_per_sec: number;
    total_rx_bytes: number;
    total_tx_bytes: number;
  };
  battery: {
    is_present: boolean;
    is_charging: boolean;
    percentage: number;
    cycle_count: number;
    health_pct: number;
    time_remaining_mins: number | null;
  };
  thermal: {
    thermal_level: "Nominal" | "Fair" | "Serious" | "Critical";
    fan_speed_rpm: number | null;
  };
  timestamp_ms: number;
}
```

---

## 🛠 Commands Reference (`invoke(...)`)

### 1. `get_latest_metrics`
- **Arguments**: None
- **Returns**: `Promise<SystemMetricsSnapshot>`
- **Description**: Retrieves the immediate system snapshot.

### 2. `get_process_list`
- **Arguments**: None
- **Returns**: `Promise<ProcessInfo[]>`
- **Description**: Returns all running macOS Mach tasks and processes with CPU, memory, thread count, sandboxing status, and open file descriptor count.

```typescript
interface ProcessInfo {
  pid: number;
  ppid: number;
  name: string;
  executable_path: string;
  cpu_pct: number;
  memory_rss_bytes: number;
  virtual_memory_bytes: number;
  threads_count: number;
  open_files_count: number;
  architecture: "arm64" | "x86_64";
  is_rosetta: boolean;
  is_sandboxed: boolean;
  code_signature_status: string;
  energy_impact: number;
}
```

### 3. `kill_process_command`
- **Arguments**: `{ pid: number, force: boolean }`
- **Returns**: `Promise<boolean>`
- **Description**: Sends SIGTERM (`force: false`) or SIGKILL (`force: true`) to the target PID.

### 4. `reveal_in_finder_command`
- **Arguments**: `{ path: string }`
- **Returns**: `Promise<void>`
- **Description**: Executes macOS `open -R <path>` to reveal the target binary in Finder.

### 5. `scan_storage_treemap_command`
- **Arguments**: `{ path: string }`
- **Returns**: `Promise<TreemapNode>`
- **Description**: High-speed parallel disk space scanner building a hierarchical treemap structure.

### 6. `scan_duplicates_command`
- **Arguments**: `{ scanDir: string }`
- **Returns**: `Promise<DuplicateGroup[]>`
- **Description**: Scans for identical files using BLAKE3 cryptographic hashing.

### 7. `scan_cleanup_cache_command`
- **Arguments**: None
- **Returns**: `Promise<CleanupTarget[]>`
- **Description**: Evaluates system cache targets (Xcode DerivedData, Homebrew cache, npm cache, log files) and categorizes them by safety tier.

### 8. `execute_cleanup_command`
- **Arguments**: `{ targetIds: string[] }`
- **Returns**: `Promise<number>`
- **Description**: Safely purges selected targets and returns total reclaimed space in bytes.

### 9. `get_recommendations_command`
- **Arguments**: None
- **Returns**: `Promise<RecommendationItem[]>`
- **Description**: Runs heuristic performance analyzer to recommend memory/disk optimizations.

### 10. `get_history_command`
- **Arguments**: `{ timeframe: string }`
- **Returns**: `Promise<HistoricalMetricPoint[]>`
- **Description**: Queries the local SQLite metrics database (`metrics.db`) for time-series history.

### 11. `audit_permissions_command`
- **Arguments**: None
- **Returns**: `Promise<PermissionAuditResult>`
- **Description**: Checks macOS system security privacy permissions (Accessibility, Full Disk Access, Screen Recording, Location).

### 12. `get_plugins_command`
- **Arguments**: None
- **Returns**: `Promise<DeveloperPluginInfo[]>`
- **Description**: Inspects local developer environments (Docker container count, Homebrew formula count, Xcode DerivedData size).

### 13. `run_cpu_benchmark_command` & `run_disk_benchmark_command`
- **Arguments**: None
- **Returns**: `Promise<BenchmarkResult>`
- **Description**: Executes synthetic multi-core CPU hash stress or sequential SSD I/O speed tests.

### 14. `get_network_details_command`
- **Arguments**: None
- **Returns**: `Promise<NetworkDetails>`
- **Description**: Queries live network interface IP, MAC address, gateway, subnet mask, DNS servers, and Wi-Fi SSID.

### 15. `renew_dhcp_ip_command`
- **Arguments**: `{ interface: string }`
- **Returns**: `Promise<string>`
- **Description**: Triggers a DHCP lease renewal (`ipconfig set en0 DHCP`) to acquire a new local IP address without disconnecting the Wi-Fi link.

### 16. `spoof_mac_address_command`
- **Arguments**: `{ interface: string, targetMac?: string }`
- **Returns**: `Promise<string>`
- **Description**: Randomizes the hardware MAC address of the target interface and automatically triggers instant DHCP IP renewal.

### 17. `flush_dns_cache_command`
- **Arguments**: None
- **Returns**: `Promise<string>`
- **Description**: Flushes macOS `mDNSResponder` DNS resolver cache (`dscacheutil -flushcache`).
