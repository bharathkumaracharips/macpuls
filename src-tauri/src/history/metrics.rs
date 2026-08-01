use super::HistoricalDataPoint;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct HistoricalSummary {
    pub time_range: String,
    pub data_points: Vec<HistoricalDataPoint>,
    pub peak_cpu_pct: f32,
    pub avg_cpu_pct: f32,
    pub peak_memory_bytes: u64,
    pub avg_memory_bytes: u64,
}

pub fn summarize_history(range: &str, points: Vec<HistoricalDataPoint>) -> HistoricalSummary {
    let peak_cpu = points.iter().map(|p| p.cpu_pct).fold(0.0f32, f32::max);
    let avg_cpu = if !points.is_empty() {
        points.iter().map(|p| p.cpu_pct).sum::<f32>() / points.len() as f32
    } else {
        0.0
    };

    let peak_mem = points.iter().map(|p| p.memory_used_bytes).max().unwrap_or(0);
    let avg_mem = if !points.is_empty() {
        points.iter().map(|p| p.memory_used_bytes).sum::<u64>() / points.len() as u64
    } else {
        0
    };

    HistoricalSummary {
        time_range: range.to_string(),
        data_points: points,
        peak_cpu_pct: peak_cpu,
        avg_cpu_pct: avg_cpu,
        peak_memory_bytes: peak_mem,
        avg_memory_bytes: avg_mem,
    }
}
