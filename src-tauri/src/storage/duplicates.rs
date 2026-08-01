use super::DuplicateGroup;
use std::collections::HashMap;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use walkdir::WalkDir;

pub fn find_duplicate_files(scan_directory: &str, min_size_mb: u64) -> Vec<DuplicateGroup> {
    let min_bytes = min_size_mb * 1024 * 1024;
    let mut size_map: HashMap<u64, Vec<String>> = HashMap::new();

    // Stage 1: Group by exact size
    for entry in WalkDir::new(scan_directory)
        .max_depth(5)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                let len = meta.len();
                if len >= min_bytes {
                    size_map
                        .entry(len)
                        .or_default()
                        .push(entry.path().to_string_lossy().to_string());
                }
            }
        }
    }

    let mut duplicates = Vec::new();

    // Stage 2 & 3: 4KB Head Blake3 hash comparison for size candidates
    for (size, paths) in size_map {
        if paths.len() < 2 {
            continue;
        }

        let mut hash_map: HashMap<String, Vec<String>> = HashMap::new();
        for path_str in paths {
            if let Ok(mut file) = File::open(&path_str) {
                let mut buffer = [0u8; 4096];
                if let Ok(count) = file.read(&mut buffer) {
                    let hash = blake3::hash(&buffer[..count]).to_hex().to_string();
                    hash_map.entry(hash).or_default().push(path_str);
                }
            }
        }

        for (_, matched_paths) in hash_map {
            if matched_paths.len() > 1 {
                let sample_name = Path::new(&matched_paths[0])
                    .file_name()
                    .map(|s| s.to_string_lossy().to_string())
                    .unwrap_or_else(|| "Unknown".to_string());

                let count = matched_paths.len() as u64;
                let wasted = size * (count - 1);

                duplicates.push(DuplicateGroup {
                    file_size_bytes: size,
                    sample_name,
                    paths: matched_paths,
                    wasted_bytes: wasted,
                });
            }
        }
    }

    duplicates.sort_by(|a, b| b.wasted_bytes.cmp(&a.wasted_bytes));
    duplicates
}
