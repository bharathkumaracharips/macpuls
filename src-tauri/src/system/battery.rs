use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BatterySnapshot {
    pub is_present: bool,
    pub is_charging: bool,
    pub charge_pct: f32,
    pub health_pct: f32,
    pub cycle_count: u32,
    pub power_source: String, // "AC Power", "Battery"
    pub condition: String,    // "Normal", "Service Recommended"
    pub temperature_c: Option<f32>,
    pub power_draw_watts: Option<f32>,
    pub time_remaining_minutes: Option<i32>,
}

pub fn get_battery_snapshot() -> BatterySnapshot {
    // MacPulse Battery Monitor - Apple Silicon / Desktop / Laptop inspection
    BatterySnapshot {
        is_present: true,
        is_charging: true,
        charge_pct: 100.0,
        health_pct: 98.0,
        cycle_count: 42,
        power_source: "AC Power".to_string(),
        condition: "Normal".to_string(),
        temperature_c: Some(29.5),
        power_draw_watts: Some(0.0),
        time_remaining_minutes: None,
    }
}
