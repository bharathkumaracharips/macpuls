pub mod scanner;
pub mod duplicates;
pub mod cache;
pub mod cleanup;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreemapNode {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
    pub is_dir: bool,
    pub children: Option<Vec<TreemapNode>>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateGroup {
    pub file_size_bytes: u64,
    pub sample_name: String,
    pub paths: Vec<String>,
    pub wasted_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SafetyTier {
    Safe,
    Recommended,
    Advanced,
    Dangerous,
    NeverRemove,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupTarget {
    pub id: String,
    pub category_name: String,
    pub description: String,
    pub path: String,
    pub size_bytes: u64,
    pub safety_tier: SafetyTier,
    pub rationale: String,
    pub is_selected: bool,
}
