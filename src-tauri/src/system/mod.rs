pub mod cpu;
pub mod memory;
pub mod gpu;
pub mod disk;
pub mod network;
pub mod battery;
pub mod thermal;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SystemMetricsSnapshot {
    pub cpu: cpu::CpuSnapshot,
    pub memory: memory::MemorySnapshot,
    pub gpu: gpu::GpuSnapshot,
    pub disk: disk::DiskSnapshot,
    pub network: network::NetworkSnapshot,
    pub battery: battery::BatterySnapshot,
    pub thermal: thermal::ThermalSnapshot,
    pub timestamp_ms: u64,
}
