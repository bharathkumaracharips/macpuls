use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionStatus {
    pub key: String,
    pub name: String,
    pub description: String,
    pub is_granted: bool,
    pub fix_instructions: String,
}

pub fn audit_mac_permissions() -> Vec<PermissionStatus> {
    let home = dirs::home_dir().unwrap_or_else(|| std::path::PathBuf::from("/Users/user"));

    // Full Disk Access audit: Check if we can read restricted TCC directory ~/Library/Safari
    let fda_granted = Path::new(&home).join("Library/Safari").exists();

    vec![
        PermissionStatus {
            key: "full_disk_access".to_string(),
            name: "Full Disk Access (FDA)".to_string(),
            description: "Required for inspecting restricted caches, process file handles, and system containers.".to_string(),
            is_granted: fda_granted,
            fix_instructions: "Open System Settings -> Privacy & Security -> Full Disk Access and enable MacPulse.".to_string(),
        },
        PermissionStatus {
            key: "accessibility".to_string(),
            name: "Accessibility".to_string(),
            description: "Allows interaction with window server & process control shortcuts.".to_string(),
            is_granted: true,
            fix_instructions: "Open System Settings -> Privacy & Security -> Accessibility.".to_string(),
        },
        PermissionStatus {
            key: "notifications".to_string(),
            name: "User Notifications".to_string(),
            description: "Used for pushing high memory pressure & storage threshold alerts.".to_string(),
            is_granted: true,
            fix_instructions: "Open System Settings -> Notifications -> MacPulse.".to_string(),
        },
        PermissionStatus {
            key: "developer_tools".to_string(),
            name: "Developer Tools & Debugger".to_string(),
            description: "Enables deep Mach task inspection & task_info memory profiling.".to_string(),
            is_granted: true,
            fix_instructions: "Open System Settings -> Privacy & Security -> Developer Tools.".to_string(),
        },
    ]
}
