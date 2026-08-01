use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EnergyReport {
    pub average_energy_impact: f32,
    pub top_energy_consumers: Vec<(String, i32, f32)>,
}

pub fn calculate_energy_report(processes: &[super::ProcessItem]) -> EnergyReport {
    let mut consumers: Vec<(String, i32, f32)> = processes
        .iter()
        .map(|p| (p.name.clone(), p.pid, p.energy_impact))
        .collect();

    consumers.sort_by(|a, b| b.2.partial_cmp(&a.2).unwrap_or(std::cmp::Ordering::Equal));
    consumers.truncate(5);

    let avg = if !processes.is_empty() {
        processes.iter().map(|p| p.energy_impact).sum::<f32>() / processes.len() as f32
    } else {
        0.0
    };

    EnergyReport {
        average_energy_impact: avg,
        top_energy_consumers: consumers,
    }
}
