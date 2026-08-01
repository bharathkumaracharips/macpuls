use super::{CleanupTarget, SafetyTier};
use std::fs;
use std::path::Path;

pub fn execute_safe_cleanup(targets: &[CleanupTarget]) -> Result<u64, String> {
    let mut total_reclaimed: u64 = 0;

    for target in targets {
        if !target.is_selected {
            continue;
        }

        // Strict Kernel Safety Filter: Never remove protected system or root paths
        let p = Path::new(&target.path);
        if target.safety_tier == SafetyTier::NeverRemove || is_protected_system_path(p) {
            return Err(format!(
                "Security Policy Block: Refusing to delete protected system path {}",
                target.path
            ));
        }

        if p.exists() {
            let size = target.size_bytes;
            let result = if p.is_file() {
                fs::remove_file(p).map_err(|e| e.to_string())
            } else if p.is_dir() {
                fs::remove_dir_all(p).map_err(|e| e.to_string())
            } else {
                Ok(())
            };

            if let Ok(_) = result {
                total_reclaimed += size;
            }
        }
    }

    Ok(total_reclaimed)
}

fn is_protected_system_path(path: &Path) -> bool {
    let s = path.to_string_lossy();
    s == "/"
        || s == "/System"
        || s.starts_with("/System/")
        || s == "/usr"
        || s.starts_with("/usr/bin")
        || s.starts_with("/usr/sbin")
        || s == "/bin"
        || s == "/sbin"
        || s == "/etc"
        || s == "/var"
        || s == "/private"
}
