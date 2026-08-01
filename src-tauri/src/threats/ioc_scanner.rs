use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IocMatch {
    pub ioc_type: String, // "Hash" | "IP" | "Domain" | "Filename"
    pub indicator: String,
    pub match_location: String,
    pub details: String,
}

pub fn search_system_for_iocs(query: &str) -> Vec<IocMatch> {
    let q = query.trim().to_lowercase();
    let mut results = Vec::new();

    if q.is_empty() {
        return results;
    }

    // Check running processes or files matching query indicator
    let ps = crate::process::process_manager::list_processes();
    for p in ps {
        if p.name.to_lowercase().contains(&q) || p.executable_path.to_lowercase().contains(&q) {
            results.push(IocMatch {
                ioc_type: "Filename / Process".to_string(),
                indicator: q.clone(),
                match_location: format!("PID {} ({})", p.pid, p.executable_path),
                details: format!("Running process matches target IOC search query: {}", p.name),
            });
        }
    }

    results
}
