use crate::benchmark::{cpu_bench::run_cpu_benchmark, disk_bench::run_disk_benchmark, BenchmarkResult};
use crate::diagnostics::{generate_diagnostic_report, SystemDiagnosticReport};
use crate::history::metrics::{summarize_history, HistoricalSummary};
use crate::history::sqlite::MetricsDatabase;
use crate::optimizer::recommendations::generate_recommendations;
use crate::optimizer::RecommendationItem;
use crate::plugins::{get_all_plugins, PluginInfo};
use crate::process::{
    process_manager::{kill_process, list_processes},
    ProcessItem,
};
use crate::security::permissions::{audit_mac_permissions, PermissionStatus};
use crate::storage::{
    cache::scan_cache_categories,
    cleanup::execute_safe_cleanup,
    duplicates::find_duplicate_files,
    scanner::scan_directory_treemap,
    CleanupTarget, DuplicateGroup, TreemapNode,
};
use crate::system::{
    battery::get_battery_snapshot, cpu::get_cpu_snapshot, disk::get_disk_snapshot,
    gpu::get_gpu_snapshot, memory::get_memory_snapshot,
    network::{flush_dns_cache, get_network_details, get_network_snapshot, renew_dhcp_ip, spoof_mac_address, NetworkDetails},
    thermal::get_thermal_snapshot, SystemMetricsSnapshot,
};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn get_latest_metrics() -> SystemMetricsSnapshot {
    let now_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);

    SystemMetricsSnapshot {
        cpu: get_cpu_snapshot(),
        memory: get_memory_snapshot(),
        gpu: get_gpu_snapshot(),
        disk: get_disk_snapshot(),
        network: get_network_snapshot(),
        battery: get_battery_snapshot(),
        thermal: get_thermal_snapshot(),
        timestamp_ms: now_ms,
    }
}

#[tauri::command]
pub fn get_process_list() -> Vec<ProcessItem> {
    list_processes()
}

#[tauri::command]
pub fn kill_process_command(pid: i32, force: bool) -> Result<(), String> {
    kill_process(pid, force)
}

#[tauri::command]
pub fn reveal_in_finder_command(path: String) -> Result<(), String> {
    let _ = std::process::Command::new("open")
        .arg("-R")
        .arg(&path)
        .spawn();
    Ok(())
}

#[tauri::command]
pub fn scan_storage_treemap_command(root_path: String, max_depth: usize) -> TreemapNode {
    scan_directory_treemap(&root_path, max_depth)
}

#[tauri::command]
pub fn scan_duplicates_command(scan_dir: String, min_size_mb: u64) -> Vec<DuplicateGroup> {
    find_duplicate_files(&scan_dir, min_size_mb)
}

#[tauri::command]
pub fn scan_cleanup_cache_command() -> Vec<CleanupTarget> {
    scan_cache_categories()
}

#[tauri::command]
pub fn execute_cleanup_command(targets: Vec<CleanupTarget>) -> Result<u64, String> {
    execute_safe_cleanup(&targets)
}

#[tauri::command]
pub fn get_recommendations_command() -> Vec<RecommendationItem> {
    let metrics = get_latest_metrics();
    let caches = scan_cache_categories();
    generate_recommendations(&metrics, &caches)
}

#[tauri::command]
pub fn get_history_command(range: String, db: State<'_, Arc<MetricsDatabase>>) -> Result<HistoricalSummary, String> {
    let points = db.query_history(&range).map_err(|e| e.to_string())?;
    Ok(summarize_history(&range, points))
}

#[tauri::command]
pub fn audit_permissions_command() -> Vec<PermissionStatus> {
    audit_mac_permissions()
}

#[tauri::command]
pub fn get_plugins_command() -> Vec<PluginInfo> {
    get_all_plugins()
}

#[tauri::command]
pub fn run_cpu_benchmark_command() -> BenchmarkResult {
    run_cpu_benchmark()
}

#[tauri::command]
pub fn run_disk_benchmark_command() -> BenchmarkResult {
    run_disk_benchmark()
}

#[tauri::command]
pub fn generate_diagnostics_command() -> SystemDiagnosticReport {
    let metrics = get_latest_metrics();
    generate_diagnostic_report(metrics)
}

#[tauri::command]
pub fn get_network_details_command() -> NetworkDetails {
    get_network_details()
}

#[tauri::command]
pub fn renew_dhcp_ip_command(interface: String) -> Result<String, String> {
    renew_dhcp_ip(&interface)
}

#[tauri::command]
pub fn spoof_mac_address_command(interface: String, target_mac: Option<String>) -> Result<String, String> {
    spoof_mac_address(&interface, target_mac)
}

#[tauri::command]
pub fn flush_dns_cache_command() -> Result<String, String> {
    flush_dns_cache()
}

#[tauri::command]
pub fn cycle_public_ip_command(interface: String) -> Result<String, String> {
    crate::system::network::cycle_public_ip_connection(&interface)
}
