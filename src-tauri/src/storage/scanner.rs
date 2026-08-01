use super::TreemapNode;
use std::path::Path;

pub fn scan_directory_treemap(root_path: &str, max_depth: usize) -> TreemapNode {
    let path = Path::new(root_path);
    let name = path.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| root_path.to_string());

    if !path.exists() {
        return TreemapNode {
            name,
            path: root_path.to_string(),
            size_bytes: 0,
            is_dir: true,
            children: Some(Vec::new()),
            category: None,
        };
    }

    if max_depth == 0 || path.is_file() {
        let size = path.metadata().map(|m| m.len()).unwrap_or(0);
        return TreemapNode {
            name,
            path: root_path.to_string(),
            size_bytes: size,
            is_dir: path.is_dir(),
            children: None,
            category: None,
        };
    }

    let mut children = Vec::new();
    let mut total_dir_size: u64 = 0;

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let child_path = entry.path();
            let child_str = child_path.to_string_lossy().to_string();

            // Skip hidden or system symlinks to prevent infinite loops
            if child_str.contains("/.git/") || child_str.contains("/Library/Containers/") {
                continue;
            }

            let node = scan_directory_treemap(&child_str, max_depth - 1);
            total_dir_size += node.size_bytes;
            children.push(node);
        }
    }

    children.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    children.truncate(20); // Top 20 items per node for optimal DaisyDisk rendering

    TreemapNode {
        name,
        path: root_path.to_string(),
        size_bytes: total_dir_size,
        is_dir: true,
        children: Some(children),
        category: None,
    }
}
