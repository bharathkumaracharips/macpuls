use crate::system::{
    battery::get_battery_snapshot, cpu::get_cpu_snapshot, disk::get_disk_snapshot,
    gpu::get_gpu_snapshot, memory::get_memory_snapshot, network::get_network_snapshot,
    thermal::get_thermal_snapshot, SystemMetricsSnapshot,
};
use crate::history::sqlite::MetricsDatabase;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

pub fn start_background_collector(app_handle: AppHandle, db: Arc<MetricsDatabase>) {
    tauri::async_runtime::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(1000));
        loop {
            interval.tick().await;

            let now_ms = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_millis() as u64)
                .unwrap_or(0);

            let snapshot = SystemMetricsSnapshot {
                cpu: get_cpu_snapshot(),
                memory: get_memory_snapshot(),
                gpu: get_gpu_snapshot(),
                disk: get_disk_snapshot(),
                network: get_network_snapshot(),
                battery: get_battery_snapshot(),
                thermal: get_thermal_snapshot(),
                timestamp_ms: now_ms,
            };

            // 1. Persist to local SQLite DB
            let _ = db.insert_snapshot(&snapshot);

            // 2. Emit real-time metrics event to Next.js frontend UI via Tauri IPC
            let _ = app_handle.emit("metrics_tick", &snapshot);
        }
    });
}
