use crate::diagnostics::SystemDiagnosticReport;

pub fn export_report_to_json(report: &SystemDiagnosticReport) -> Result<String, String> {
    serde_json::to_string_pretty(report).map_err(|e| e.to_string())
}
