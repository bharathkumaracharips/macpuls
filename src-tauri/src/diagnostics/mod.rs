use serde::{Serialize, Deserialize};
use crate::system::SystemMetricsSnapshot;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemDiagnosticReport {
    pub report_timestamp: String,
    pub macos_version: String,
    pub architecture: String,
    pub metrics: SystemMetricsSnapshot,
    pub summary_issues: Vec<String>,
}

pub fn generate_diagnostic_report(metrics: SystemMetricsSnapshot) -> SystemDiagnosticReport {
    let mut issues = Vec::new();
    if metrics.memory.memory_pressure_level == "Critical" {
        issues.push("Critical memory pressure detected.".to_string());
    }
    if metrics.disk.used_pct > 85.0 {
        issues.push("Low free disk space on root volume.".to_string());
    }
    if issues.is_empty() {
        issues.push("All system parameters operating within optimal range.".to_string());
    }

    SystemDiagnosticReport {
        report_timestamp: chrono::Utc::now().to_rfc3339(),
        macos_version: "macOS 15.0 (Sequoia)".to_string(),
        architecture: "Apple Silicon (Arm64)".to_string(),
        metrics,
        summary_issues: issues,
    }
}
