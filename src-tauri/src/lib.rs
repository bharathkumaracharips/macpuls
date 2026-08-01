pub mod audit;
pub mod benchmark;
pub mod collector;
pub mod commands;
pub mod common;
pub mod diagnostics;
pub mod export;
pub mod history;
pub mod ipc;
pub mod logs;
pub mod notify;
pub mod network_security;
pub mod optimizer;
pub mod plugins;
pub mod process;
pub mod reverse;
pub mod security;
pub mod services;
pub mod storage;
pub mod system;
pub mod threats;
pub mod tray;

use commands::*;
use history::sqlite::MetricsDatabase;
use ipc::commands::*;
use std::sync::Arc;

pub fn run() {
    logs::init_logging();

    let db = match MetricsDatabase::new() {
        Ok(d) => Arc::new(d),
        Err(e) => panic!("Failed to initialize local SQLite metrics database: {}", e),
    };

    let db_clone = db.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(db)
        .setup(move |app| {
            let handle = app.handle().clone();

            // Setup native macOS Menu Bar Tray
            let _ = tray::setup_tray(&handle);

            // Spawn 1000ms background sampling collector
            collector::start_background_collector(handle, db_clone);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_latest_metrics,
            get_process_list,
            kill_process_command,
            reveal_in_finder_command,
            scan_storage_treemap_command,
            scan_duplicates_command,
            scan_cleanup_cache_command,
            execute_cleanup_command,
            get_recommendations_command,
            get_history_command,
            audit_permissions_command,
            get_plugins_command,
            run_cpu_benchmark_command,
            run_disk_benchmark_command,
            generate_diagnostics_command,
            get_network_details_command,
            renew_dhcp_ip_command,
            spoof_mac_address_command,
            flush_dns_cache_command,
            cycle_public_ip_command,
            get_security_health_score_command,
            generate_sbom_command,
            export_forensic_bundle_command,
            get_baseline_diff_command,
            get_system_timeline_command,
            analyze_threat_binary_command,
            scan_yara_command,
            search_ioc_command,
            inspect_usb_volumes_command,
            get_active_process_sockets_command,
            inspect_macho_binary_command,
            extract_strings_command,
            list_launch_services_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running MacPulse desktop application");
}
