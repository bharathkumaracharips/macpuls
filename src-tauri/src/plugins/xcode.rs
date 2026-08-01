use super::{PluginInfo, PluginProvider};

pub struct XcodePlugin;

impl PluginProvider for XcodePlugin {
    fn info(&self) -> PluginInfo {
        PluginInfo {
            id: "xcode".to_string(),
            name: "Xcode & Developer Suite".to_string(),
            description: "Tracks DerivedData, CoreSimulator runtimes, and archives.".to_string(),
            is_enabled: true,
            status: "Active".to_string(),
            details_summary: "DerivedData + Simulator caches ~ 12.1 GB".to_string(),
        }
    }
}
