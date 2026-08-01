use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProcessDetailInfo {
    pub pid: i32,
    pub ppid: i32,
    pub name: String,
    pub path: String,
    pub user: String,
    pub open_files: Vec<String>,
    pub ports: Vec<u16>,
    pub sandbox_profile: String,
    pub entitlement_summary: Vec<String>,
    pub is_notarized: bool,
}

pub fn get_process_details(pid: i32) -> ProcessDetailInfo {
    ProcessDetailInfo {
        pid,
        ppid: 1,
        name: format!("Process {}", pid),
        path: format!("/Applications/App_{}.app/Contents/MacOS/App", pid),
        user: "user".to_string(),
        open_files: vec![
            "/dev/urandom".to_string(),
            "/Users/user/Library/Caches/app.log".to_string(),
            "/System/Library/Fonts/SFNS.ttf".to_string(),
        ],
        ports: vec![8080, 443],
        sandbox_profile: "com.apple.security.app-sandbox".to_string(),
        entitlement_summary: vec![
            "com.apple.security.network.client".to_string(),
            "com.apple.security.files.user-selected.read-write".to_string(),
        ],
        is_notarized: true,
    }
}
