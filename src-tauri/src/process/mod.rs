pub mod process_manager;
pub mod process_details;
pub mod energy;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProcessItem {
    pub pid: i32,
    pub ppid: i32,
    pub name: String,
    pub executable_path: String,
    pub bundle_identifier: Option<String>,
    pub user_name: String,
    pub cpu_pct: f32,
    pub memory_rss_bytes: u64,
    pub virtual_size_bytes: u64,
    pub threads_count: u32,
    pub open_files_count: u32,
    pub energy_impact: f32,
    pub architecture: String, // "Apple Silicon" | "Intel (Rosetta)"
    pub is_sandboxed: bool,
    pub is_rosetta: bool,
    pub code_signature_status: String, // "Signed", "Unsigned", "System"
    pub start_time_epoch: u64,
    pub elapsed_runtime_secs: u64,
    pub status: String,
}
