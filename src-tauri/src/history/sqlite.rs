use super::HistoricalDataPoint;
use crate::system::SystemMetricsSnapshot;
use rusqlite::{params, Connection, Result};
use std::sync::Mutex;
use std::path::PathBuf;

pub struct MetricsDatabase {
    conn: Mutex<Connection>,
}

impl MetricsDatabase {
    pub fn new() -> Result<Self> {
        let db_path = get_db_path();
        if let Some(parent) = db_path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }

        let conn = Connection::open(&db_path)?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp_sec INTEGER NOT NULL,
                cpu_pct REAL NOT NULL,
                memory_used_bytes INTEGER NOT NULL,
                memory_pressure_pct REAL NOT NULL,
                disk_read_bytes_sec INTEGER NOT NULL,
                disk_write_bytes_sec INTEGER NOT NULL,
                network_rx_bytes_sec INTEGER NOT NULL,
                network_tx_bytes_sec INTEGER NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics_history(timestamp_sec)",
            [],
        )?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn insert_snapshot(&self, snapshot: &SystemMetricsSnapshot) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let ts = (snapshot.timestamp_ms / 1000) as i64;
        conn.execute(
            "INSERT INTO metrics_history (
                timestamp_sec, cpu_pct, memory_used_bytes, memory_pressure_pct,
                disk_read_bytes_sec, disk_write_bytes_sec, network_rx_bytes_sec, network_tx_bytes_sec
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                ts,
                snapshot.cpu.overall_usage_pct,
                snapshot.memory.used_bytes as i64,
                snapshot.memory.memory_pressure_pct,
                snapshot.disk.read_bytes_per_sec as i64,
                snapshot.disk.write_bytes_per_sec as i64,
                snapshot.network.download_bytes_per_sec as i64,
                snapshot.network.upload_bytes_per_sec as i64,
            ],
        )?;
        Ok(())
    }

    pub fn query_history(&self, range: &str) -> Result<Vec<HistoricalDataPoint>> {
        let conn = self.conn.lock().unwrap();
        let now_sec = chrono::Utc::now().timestamp();
        let window_sec = match range {
            "7d" => 7 * 24 * 3600,
            "30d" => 30 * 24 * 3600,
            _ => 24 * 3600, // Default 24h
        };

        let start_sec = now_sec - window_sec;
        let mut stmt = conn.prepare(
            "SELECT timestamp_sec, cpu_pct, memory_used_bytes, memory_pressure_pct,
                    disk_read_bytes_sec, disk_write_bytes_sec, network_rx_bytes_sec, network_tx_bytes_sec
             FROM metrics_history
             WHERE timestamp_sec >= ?1
             ORDER BY timestamp_sec ASC
             LIMIT 300",
        )?;

        let rows = stmt.query_map(params![start_sec], |row| {
            Ok(HistoricalDataPoint {
                timestamp_sec: row.get(0)?,
                cpu_pct: row.get(1)?,
                memory_used_bytes: row.get::<_, i64>(2)? as u64,
                memory_pressure_pct: row.get(3)?,
                disk_read_bytes_sec: row.get::<_, i64>(4)? as u64,
                disk_write_bytes_sec: row.get::<_, i64>(5)? as u64,
                network_rx_bytes_sec: row.get::<_, i64>(6)? as u64,
                network_tx_bytes_sec: row.get::<_, i64>(7)? as u64,
            })
        })?;

        let mut points = Vec::new();
        for r in rows {
            if let Ok(p) = r {
                points.push(p);
            }
        }

        Ok(points)
    }
}

fn get_db_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("/Users/user/Library/Application Support"))
        .join("macpulse")
        .join("metrics.db")
}
