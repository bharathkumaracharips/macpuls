use crate::system::SystemMetricsSnapshot;

pub fn calculate_system_health_score(metrics: &SystemMetricsSnapshot) -> u32 {
    let mut score = 100u32;

    // CPU penalty
    if metrics.cpu.overall_usage_pct > 80.0 {
        score = score.saturating_sub(25);
    } else if metrics.cpu.overall_usage_pct > 50.0 {
        score = score.saturating_sub(10);
    }

    // Memory pressure penalty
    if metrics.memory.memory_pressure_level == "Critical" {
        score = score.saturating_sub(30);
    } else if metrics.memory.memory_pressure_level == "Warning" {
        score = score.saturating_sub(15);
    }

    // Storage capacity penalty
    if metrics.disk.used_pct > 90.0 {
        score = score.saturating_sub(25);
    } else if metrics.disk.used_pct > 80.0 {
        score = score.saturating_sub(10);
    }

    score.max(10)
}
