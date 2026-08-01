use super::BenchmarkResult;
use std::time::Instant;

pub fn run_cpu_benchmark() -> BenchmarkResult {
    let start = Instant::now();
    let mut val: u64 = 1;
    for i in 1..2_000_000 {
        val = val.wrapping_add(i * 31 % 10007);
    }
    let duration = start.elapsed().as_millis() as u64;

    BenchmarkResult {
        name: "CPU Multi-Core Hash Stress".to_string(),
        score: (100_000 / (duration.max(1))) as u32,
        details: format!("Processed 2,000,000 iterations in {} ms", duration),
        duration_ms: duration,
    }
}
