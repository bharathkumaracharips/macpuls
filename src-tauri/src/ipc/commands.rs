use crate::audit::{
    baseline::{compare_baseline_snapshot, SnapshotDiffResult},
    forensics_mode::{export_forensic_bundle, ForensicEvidenceBundle},
    health_score::{calculate_security_score, SecurityScoreBreakdown},
    sbom::{generate_sbom_for_app, SbomReport},
    timeline::{get_system_timeline_events, TimelineEvent},
};
use crate::network_security::network_sockets::{get_active_process_sockets, ProcessSocketConnection};
use crate::reverse::binary_inspector::{extract_strings, inspect_macho_binary, MachOInspectionReport};
use crate::services::services::{list_launch_services, LaunchServiceItem};
use crate::threats::{
    ioc_scanner::{search_system_for_iocs, IocMatch},
    threat_analyzer::{analyze_target_binary, BinaryThreatReport},
    usb_security::{inspect_usb_volumes, UsbVolumeInspection},
    yara_scanner::{scan_target_with_yara, YaraMatchResult},
};

#[tauri::command]
pub fn get_security_health_score_command() -> SecurityScoreBreakdown {
    calculate_security_score()
}

#[tauri::command]
pub fn generate_sbom_command(app_path: String) -> Result<SbomReport, String> {
    generate_sbom_for_app(&app_path)
}

#[tauri::command]
pub fn export_forensic_bundle_command() -> Result<ForensicEvidenceBundle, String> {
    export_forensic_bundle()
}

#[tauri::command]
pub fn get_baseline_diff_command() -> SnapshotDiffResult {
    compare_baseline_snapshot()
}

#[tauri::command]
pub fn get_system_timeline_command() -> Vec<TimelineEvent> {
    get_system_timeline_events()
}

#[tauri::command]
pub fn analyze_threat_binary_command(file_path: String) -> Result<BinaryThreatReport, String> {
    analyze_target_binary(&file_path)
}

#[tauri::command]
pub fn scan_yara_command(file_path: String, rule_content: Option<String>) -> Result<Vec<YaraMatchResult>, String> {
    scan_target_with_yara(&file_path, rule_content)
}

#[tauri::command]
pub fn search_ioc_command(query: String) -> Vec<IocMatch> {
    search_system_for_iocs(&query)
}

#[tauri::command]
pub fn inspect_usb_volumes_command() -> Vec<UsbVolumeInspection> {
    inspect_usb_volumes()
}

#[tauri::command]
pub fn get_active_process_sockets_command() -> Vec<ProcessSocketConnection> {
    get_active_process_sockets()
}

#[tauri::command]
pub fn inspect_macho_binary_command(file_path: String) -> Result<MachOInspectionReport, String> {
    inspect_macho_binary(&file_path)
}

#[tauri::command]
pub fn extract_strings_command(file_path: String, min_length: usize) -> Vec<String> {
    extract_strings(&file_path, min_length)
}

#[tauri::command]
pub fn list_launch_services_command() -> Vec<LaunchServiceItem> {
    list_launch_services()
}
