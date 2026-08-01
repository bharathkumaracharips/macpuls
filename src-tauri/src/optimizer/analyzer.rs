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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_perfect_health_score() {
        let mut metrics = SystemMetricsSnapshot::default();
        metrics.cpu.overall_usage_pct = 20.0;
        metrics.memory.memory_pressure_level = "Normal".to_string();
        metrics.disk.used_pct = 50.0;

        assert_eq!(calculate_system_health_score(&metrics), 100);
    }

    #[test]
    fn test_critical_health_score() {
        let mut metrics = SystemMetricsSnapshot::default();
        metrics.cpu.overall_usage_pct = 85.0; // -25
        metrics.memory.memory_pressure_level = "Critical".to_string(); // -30
        metrics.disk.used_pct = 95.0; // -25

        assert_eq!(calculate_system_health_score(&metrics), 20);
    }
}

