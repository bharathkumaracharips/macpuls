pub mod docker;
pub mod xcode;
pub mod homebrew;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_enabled: bool,
    pub status: String,
    pub details_summary: String,
}

pub trait PluginProvider {
    fn info(&self) -> PluginInfo;
}

pub fn get_all_plugins() -> Vec<PluginInfo> {
    vec![
        docker::DockerPlugin.info(),
        xcode::XcodePlugin.info(),
        homebrew::HomebrewPlugin.info(),
    ]
}
