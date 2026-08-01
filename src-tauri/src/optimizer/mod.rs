pub mod recommendations;
pub mod analyzer;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendationItem {
    pub id: String,
    pub title: String,
    pub reason: String,
    pub estimated_benefit: String,
    pub reclaimed_bytes: Option<u64>,
    pub risk_level: String, // "Safe", "Recommended", "Review"
    pub action_type: String, // "clean_cache", "kill_process", "clean_docker", "purge_trash"
    pub target_id: Option<String>,
}
