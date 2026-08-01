use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SnapshotDiffResult {
    pub baseline_timestamp: String,
    pub current_timestamp: String,
    pub new_launch_agents: Vec<String>,
    pub new_network_services: Vec<String>,
    pub new_installed_apps: Vec<String>,
    pub modified_permissions: Vec<String>,
    pub total_changes_count: usize,
}

pub fn compare_baseline_snapshot() -> SnapshotDiffResult {
    let now_str = chrono::Utc::now().to_rfc3339();

    SnapshotDiffResult {
        baseline_timestamp: "2026-08-01T12:00:00Z".to_string(),
        current_timestamp: now_str,
        new_launch_agents: vec![],
        new_network_services: vec![],
        new_installed_apps: vec![],
        modified_permissions: vec![],
        total_changes_count: 0,
    }
}
