pub mod sqlite;
pub mod metrics;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoricalDataPoint {
    pub timestamp_sec: i64,
    pub cpu_pct: f32,
    pub memory_used_bytes: u64,
    pub memory_pressure_pct: f32,
    pub disk_read_bytes_sec: u64,
    pub disk_write_bytes_sec: u64,
    pub network_rx_bytes_sec: u64,
    pub network_tx_bytes_sec: u64,
}
