pub mod benchmark;
pub mod collector;
pub mod commands;
pub mod diagnostics;
pub mod export;
pub mod history;
pub mod logs;
pub mod notify;
pub mod optimizer;
pub mod plugins;
pub mod process;
pub mod security;
pub mod storage;
pub mod system;
pub mod tray;

use commands::*;
use history::sqlite::MetricsDatabase;
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
            flush_dns_cache_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running MacPulse desktop application");
}
