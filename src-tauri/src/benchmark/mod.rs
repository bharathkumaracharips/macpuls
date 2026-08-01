pub mod cpu_bench;
pub mod disk_bench;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub name: String,
    pub score: u32,
    pub details: String,
    pub duration_ms: u64,
}
