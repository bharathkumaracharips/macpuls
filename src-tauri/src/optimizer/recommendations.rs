use super::RecommendationItem;
use crate::system::SystemMetricsSnapshot;

pub fn generate_recommendations(
    metrics: &SystemMetricsSnapshot,
    caches: &[crate::storage::CleanupTarget],
) -> Vec<RecommendationItem> {
    let mut recommendations = Vec::new();

    // 1. High Memory Pressure Alert
    if metrics.memory.memory_pressure_level == "Critical" || metrics.memory.used_bytes > (metrics.memory.total_bytes * 85 / 100) {
        recommendations.push(RecommendationItem {
            id: "high_memory_pressure".to_string(),
            title: "Memory Pressure is High".to_string(),
            reason: format!(
                "System memory usage has reached {:.1}%. Consider closing memory-heavy applications.",
                metrics.memory.memory_pressure_pct
            ),
            estimated_benefit: "Frees up compressed swap space and improves app switching speed.".to_string(),
            reclaimed_bytes: None,
            risk_level: "Safe".to_string(),
            action_type: "view_processes".to_string(),
            target_id: None,
        });
    }

    // 2. Large Xcode DerivedData Cache
    for cache in caches {
        if cache.id == "xcode_derived_data" && cache.size_bytes > 2 * 1024 * 1024 * 1024 {
            let gb = cache.size_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
            recommendations.push(RecommendationItem {
                id: "clean_xcode_deriveddata".to_string(),
                title: format!("Clean Xcode DerivedData ({:.1} GB)", gb),
                reason: "Xcode accumulated stale compilation indexes and intermediate module caches over time.".to_string(),
                estimated_benefit: format!("Reclaims {:.1} GB of SSD storage.", gb),
                reclaimed_bytes: Some(cache.size_bytes),
                risk_level: "Safe".to_string(),
                action_type: "clean_cache".to_string(),
                target_id: Some("xcode_derived_data".to_string()),
            });
        }
    }

    // 3. Large Cargo Package Cache
    for cache in caches {
        if cache.id == "cargo_cache" && cache.size_bytes > 1024 * 1024 * 1024 {
            let gb = cache.size_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
            recommendations.push(RecommendationItem {
                id: "clean_cargo_registry".to_string(),
                title: format!("Purge Cargo Crate Cache ({:.1} GB)", gb),
                reason: "Cargo stored downloaded .crate archives for offline compilation.".to_string(),
                estimated_benefit: format!("Reclaims {:.1} GB of disk space.", gb),
                reclaimed_bytes: Some(cache.size_bytes),
                risk_level: "Safe".to_string(),
                action_type: "clean_cache".to_string(),
                target_id: Some("cargo_cache".to_string()),
            });
        }
    }

    // 4. Low Disk Space Warning
    if metrics.disk.used_pct > 85.0 {
        recommendations.push(RecommendationItem {
            id: "low_disk_space".to_string(),
            title: "System Storage Reaching Capacity".to_string(),
            reason: format!("Main system volume is {:.1}% full.", metrics.disk.used_pct),
            estimated_benefit: "Prevents slowdowns and system instability.".to_string(),
            reclaimed_bytes: None,
            risk_level: "Recommended".to_string(),
            action_type: "open_storage".to_string(),
            target_id: None,
        });
    }

    recommendations
}
