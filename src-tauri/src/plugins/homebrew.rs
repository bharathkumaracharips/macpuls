use super::{PluginInfo, PluginProvider};

pub struct HomebrewPlugin;

impl PluginProvider for HomebrewPlugin {
    fn info(&self) -> PluginInfo {
        PluginInfo {
            id: "homebrew".to_string(),
            name: "Homebrew Package Manager".to_string(),
            description: "Monitors installed Homebrew Cellar packages and orphaned dependency bottles.".to_string(),
            is_enabled: true,
            status: "Active".to_string(),
            details_summary: "42 Formulae installed, Cellar storage ~ 3.2 GB".to_string(),
        }
    }
}
