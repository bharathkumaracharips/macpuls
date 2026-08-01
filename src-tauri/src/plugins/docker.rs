use super::{PluginInfo, PluginProvider};

pub struct DockerPlugin;

impl PluginProvider for DockerPlugin {
    fn info(&self) -> PluginInfo {
        PluginInfo {
            id: "docker".to_string(),
            name: "Docker Engine Telemetry".to_string(),
            description: "Monitors Docker Desktop containers, VM disk images, and build layers.".to_string(),
            is_enabled: true,
            status: "Active".to_string(),
            details_summary: "Docker Desktop VM disk image size ~ 8.4 GB".to_string(),
        }
    }
}
