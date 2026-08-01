use super::{CleanupTarget, SafetyTier};
use std::path::Path;

pub fn scan_cache_categories() -> Vec<CleanupTarget> {
    let home = dirs::home_dir().unwrap_or_else(|| std::path::PathBuf::from("/Users/user"));
    let mut targets = Vec::new();

    let check_list = vec![
        (
            "xcode_derived_data",
            "Xcode DerivedData",
            "Build artifacts, index files, and intermediate compilation cache.",
            home.join("Library/Developer/Xcode/DerivedData"),
            SafetyTier::Safe,
            "Rebuildable automatically by Xcode upon next compilation.",
        ),
        (
            "cargo_cache",
            "Cargo Package Cache",
            "Rust crate index git repositories and downloaded .crate archives.",
            home.join(".cargo/registry"),
            SafetyTier::Safe,
            "Re-downloadable by Cargo when building Rust projects.",
        ),
        (
            "npm_cache",
            "npm Global Cache",
            "Local npm package tarballs cache.",
            home.join(".npm"),
            SafetyTier::Safe,
            "npm fetches packages from registry on demand.",
        ),
        (
            "pnpm_cache",
            "pnpm Store",
            "Global pnpm content-addressable store.",
            home.join("Library/Caches/pnpm"),
            SafetyTier::Safe,
            "Can be safely pruned.",
        ),
        (
            "yarn_cache",
            "Yarn Cache",
            "Yarn package cache directory.",
            home.join("Library/Caches/Yarn"),
            SafetyTier::Safe,
            "Yarn re-downloads packages when needed.",
        ),
        (
            "docker_build_cache",
            "Docker Build Cache",
            "Dangling Docker build layers and cache blobs.",
            home.join(".docker/buildx"),
            SafetyTier::Advanced,
            "Clearing build cache forces rebuild of Docker steps.",
        ),
        (
            "ios_simulators",
            "iOS Simulator Data",
            "CoreSimulator device caches and app data.",
            home.join("Library/Developer/CoreSimulator/Caches"),
            SafetyTier::Recommended,
            "Cleans stale simulator app caches.",
        ),
        (
            "system_user_cache",
            "User Caches",
            "General macOS user application caches.",
            home.join("Library/Caches"),
            SafetyTier::Recommended,
            "Clears temporary application cache files.",
        ),
        (
            "system_logs",
            "System & App Logs",
            "Historical application diagnostic log files.",
            home.join("Library/Logs"),
            SafetyTier::Recommended,
            "Historical logs can be safely removed.",
        ),
        (
            "trash",
            "System Trash",
            "Files placed in the macOS Trash bin.",
            home.join(".Trash"),
            SafetyTier::Recommended,
            "Permanently empties items in the Trash.",
        ),
    ];

    for (id, name, desc, path_buf, safety, rationale) in check_list {
        let path_str = path_buf.to_string_lossy().to_string();
        let size = get_dir_size_fast(&path_buf);

        if size > 0 || path_buf.exists() {
            targets.push(CleanupTarget {
                id: id.to_string(),
                category_name: name.to_string(),
                description: desc.to_string(),
                path: path_str,
                size_bytes: size,
                safety_tier: safety,
                rationale: rationale.to_string(),
                is_selected: true,
            });
        }
    }

    targets
}

fn get_dir_size_fast(path: &Path) -> u64 {
    if !path.exists() {
        return 0;
    }
    if path.is_file() {
        return path.metadata().map(|m| m.len()).unwrap_or(0);
    }
    let mut total = 0;
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let p = entry.path();
            if p.is_file() {
                total += entry.metadata().map(|m| m.len()).unwrap_or(0);
            } else if p.is_dir() && !p.is_symlink() {
                total += get_dir_size_fast(&p);
            }
        }
    }
    total
}
