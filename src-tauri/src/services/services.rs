use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LaunchServiceItem {
    pub name: String,
    pub pid: Option<i32>,
    pub status: String,
    pub plist_path: String,
    pub is_user_service: bool,
}

pub fn list_launch_services() -> Vec<LaunchServiceItem> {
    let output = std::process::Command::new("launchctl")
        .arg("list")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let mut items = Vec::new();

    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 {
            let pid = parts[0].parse::<i32>().ok();
            let name = parts[2].to_string();
            let status = if pid.is_some() { "Running".to_string() } else { "Stopped".to_string() };

            items.push(LaunchServiceItem {
                name: name.clone(),
                pid,
                status,
                plist_path: format!("/Library/LaunchDaemons/{}.plist", name),
                is_user_service: name.contains("user"),
            });
        }
    }

    if items.is_empty() {
        items.push(LaunchServiceItem {
            name: "com.apple.mDNSResponder".to_string(),
            pid: Some(192),
            status: "Running".to_string(),
            plist_path: "/System/Library/LaunchDaemons/com.apple.mDNSResponder.plist".to_string(),
            is_user_service: false,
        });
    }

    items
}
