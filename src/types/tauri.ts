export interface CoreUsage {
  core_id: number;
  usage_pct: number;
}

export interface CpuSnapshot {
  overall_usage_pct: number;
  core_count: number;
  cores: CoreUsage[];
  load_avg_1m: number;
  load_avg_5m: number;
  load_avg_15m: number;
  brand_name: string;
  frequency_mhz: number;
}

export interface MemorySnapshot {
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
  swap_ins_per_sec: number;
  swap_outs_per_sec: number;
  memory_pressure_pct: number;
  memory_pressure_level: 'Normal' | 'Warning' | 'Critical';
  compression_ratio: number;
  page_faults: number;
  zero_fill_count: number;
  copy_on_write_count: number;
}

export interface GpuSnapshot {
  model_name: string;
  vendor_name: string;
  unified_memory_bytes: number;
  metal_supported: boolean;
  estimated_load_pct?: number;
  compute_activity_pct?: number;
  render_activity_pct?: number;
  status: string;
}

export interface DiskSnapshot {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  available_bytes: number;
  used_pct: number;
  read_bytes_per_sec: number;
  write_bytes_per_sec: number;
  iops_read: number;
  iops_write: number;
  mount_point: string;
  fs_type: string;
}

export interface NetworkSnapshot {
  download_bytes_per_sec: number;
  upload_bytes_per_sec: number;
  total_bytes_received: number;
  total_bytes_sent: number;
  active_interface: string;
}

export interface NetworkDetails {
  interface_name: string;
  ipv4_address: string;
  ipv6_address: string;
  mac_address: string;
  subnet_mask: string;
  gateway_ip: string;
  dns_servers: string[];
  wifi_ssid: string;
  is_connected: boolean;
}

export interface BatterySnapshot {
  is_present: boolean;
  is_charging: boolean;
  charge_pct: number;
  health_pct: number;
  cycle_count: number;
  power_source: string;
  condition: string;
  temperature_c?: number;
  power_draw_watts?: number;
  time_remaining_minutes?: number;
}

export interface ThermalSnapshot {
  cpu_temp_c?: number;
  gpu_temp_c?: number;
  fan_rpm?: number;
  thermal_pressure_level: string;
  is_throttling: boolean;
}

export interface SystemMetricsSnapshot {
  cpu: CpuSnapshot;
  memory: MemorySnapshot;
  gpu: GpuSnapshot;
  disk: DiskSnapshot;
  network: NetworkSnapshot;
  battery: BatterySnapshot;
  thermal: ThermalSnapshot;
  timestamp_ms: number;
}

export interface ProcessItem {
  pid: number;
  ppid: number;
  name: string;
  executable_path: string;
  bundle_identifier?: string;
  user_name: string;
  cpu_pct: number;
  memory_rss_bytes: number;
  virtual_size_bytes: number;
  threads_count: number;
  open_files_count: number;
  energy_impact: number;
  architecture: string;
  is_sandboxed: boolean;
  is_rosetta: boolean;
  code_signature_status: string;
  start_time_epoch: number;
  elapsed_runtime_secs: number;
  status: string;
}

export interface TreemapNode {
  name: string;
  path: string;
  size_bytes: number;
  is_dir: boolean;
  children?: TreemapNode[];
  category?: string;
}

export interface DuplicateGroup {
  file_size_bytes: number;
  sample_name: string;
  paths: string[];
  wasted_bytes: number;
}

export type SafetyTier = 'Safe' | 'Recommended' | 'Advanced' | 'Dangerous' | 'NeverRemove';

export interface CleanupTarget {
  id: string;
  category_name: string;
  description: string;
  path: string;
  size_bytes: number;
  safety_tier: SafetyTier;
  rationale: string;
  is_selected: boolean;
}

export interface RecommendationItem {
  id: string;
  title: string;
  reason: string;
  estimated_benefit: string;
  reclaimed_bytes?: number;
  risk_level: string;
  action_type: string;
  target_id?: string;
}

export interface PermissionStatus {
  key: string;
  name: string;
  description: string;
  is_granted: boolean;
  fix_instructions: string;
}

export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  status: string;
  details_summary: string;
}

export interface BenchmarkResult {
  name: string;
  score: number;
  details: string;
  duration_ms: number;
}

export interface ScorePenaltyItem {
  category: string;
  description: string;
  points_deducted: number;
  severity: string;
}

export interface SecurityScoreBreakdown {
  overall_score: number;
  grade: string;
  issues_count: number;
  penalty_items: ScorePenaltyItem[];
}

export interface SbomReport {
  app_name: string;
  bundle_identifier: string;
  executable_path: string;
  architecture: string;
  sha256_hash: string;
  team_id: string;
  linked_frameworks: string[];
  timestamp_epoch: number;
}

export interface ForensicEvidenceBundle {
  timestamp_utc: string;
  hostname: string;
  macos_version: string;
  kernel_version: string;
  active_processes_count: number;
  active_listening_ports_count: number;
  persistence_items_count: number;
  evidence_sha256: string;
  summary_markdown: string;
}

export interface SnapshotDiffResult {
  baseline_timestamp: string;
  current_timestamp: string;
  new_launch_agents: string[];
  new_network_services: string[];
  new_installed_apps: string[];
  modified_permissions: string[];
  total_changes_count: number;
}

export interface TimelineEvent {
  timestamp: string;
  category: string;
  event_description: string;
  severity: string;
  process_source?: string;
}

export interface BinaryThreatReport {
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  sha256_hash: string;
  architecture: string;
  code_signature_status: string;
  team_id: string;
  is_notarized: boolean;
  is_sandboxed: boolean;
  is_unsigned: boolean;
  risk_score: number;
  behavioral_flags: string[];
}

export interface YaraMatchResult {
  rule_name: string;
  target_path: string;
  matched_strings: string[];
  threat_severity: string;
  description: string;
}

export interface IocMatch {
  ioc_type: string;
  indicator: string;
  match_location: string;
  details: string;
}

export interface UsbVolumeInspection {
  volume_name: string;
  mount_point: string;
  total_size_bytes: number;
  free_size_bytes: number;
  hidden_files_count: number;
  executable_binaries_count: number;
  is_autorun_present: boolean;
  status: string;
}

export interface ProcessSocketConnection {
  pid: number;
  process_name: string;
  protocol: string;
  local_address: string;
  foreign_address: string;
  state: string;
  foreign_location_country: string;
}

export interface MachOInspectionReport {
  file_name: string;
  file_path: string;
  architectures: string[];
  is_fat_universal: boolean;
  linked_frameworks: string[];
  exported_symbols_count: number;
  sections: string[];
  entitlements_xml: string;
  sha256: string;
  md5: string;
}

export interface LaunchServiceItem {
  name: string;
  pid?: number;
  status: string;
  plist_path: string;
  is_user_service: boolean;
}
