use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub timestamp: String,
    pub category: String,
    pub event_description: String,
    pub severity: String,
    pub process_source: Option<String>,
}

pub fn get_system_timeline_events() -> Vec<TimelineEvent> {
    let now = chrono::Utc::now();

    vec![
        TimelineEvent {
            timestamp: (now - chrono::Duration::minutes(5)).to_rfc3339(),
            category: "USB & Device".to_string(),
            event_description: "Apple Internal Keyboard & Trackpad initialized".to_string(),
            severity: "Info".to_string(),
            process_source: Some("kernel".to_string()),
        },
        TimelineEvent {
            timestamp: (now - chrono::Duration::minutes(15)).to_rfc3339(),
            category: "Network".to_string(),
            event_description: "DHCP Lease renewed on en0 (IPv4: 192.0.0.2)".to_string(),
            severity: "Info".to_string(),
            process_source: Some("ipconfig".to_string()),
        },
        TimelineEvent {
            timestamp: (now - chrono::Duration::minutes(30)).to_rfc3339(),
            category: "Security".to_string(),
            event_description: "Application Firewall globalstate validated".to_string(),
            severity: "Info".to_string(),
            process_source: Some("com.apple.alf".to_string()),
        },
    ]
}
