use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NetworkSnapshot {
    pub download_bytes_per_sec: u64,
    pub upload_bytes_per_sec: u64,
    pub total_bytes_received: u64,
    pub total_bytes_sent: u64,
    pub active_interface: String,
}

static PREV_NET_STATS: Mutex<Option<(u64, u64, Instant)>> = Mutex::new(None);

pub fn get_network_snapshot() -> NetworkSnapshot {
    let mut snapshot = NetworkSnapshot {
        active_interface: "en0 (Wi-Fi)".to_string(),
        ..Default::default()
    };

    // Query system network interface statistics via getifaddrs
    let mut ifap: *mut libc::ifaddrs = std::ptr::null_mut();
    let mut total_rx: u64 = 0;
    let mut total_tx: u64 = 0;

    if unsafe { libc::getifaddrs(&mut ifap) } == 0 {
        let mut curr = ifap;
        while !curr.is_null() {
            unsafe {
                let ifa = *curr;
                if !ifa.ifa_addr.is_null() && (*ifa.ifa_addr).sa_family == libc::AF_LINK as u8 {
                    if !ifa.ifa_data.is_null() {
                        let data = *(ifa.ifa_data as *const libc::if_data);
                        total_rx += data.ifi_ibytes as u64;
                        total_tx += data.ifi_obytes as u64;
                    }
                }
                curr = ifa.ifa_next;
            }
        }
        unsafe { libc::freeifaddrs(ifap); }
    }

    snapshot.total_bytes_received = total_rx;
    snapshot.total_bytes_sent = total_tx;

    let now = Instant::now();
    let mut guard = PREV_NET_STATS.lock().unwrap();

    if let Some((prev_rx, prev_tx, prev_time)) = *guard {
        let elapsed = now.duration_since(prev_time).as_secs_f64();
        if elapsed > 0.0 {
            let rx_diff = total_rx.saturating_sub(prev_rx) as f64;
            let tx_diff = total_tx.saturating_sub(prev_tx) as f64;
            snapshot.download_bytes_per_sec = (rx_diff / elapsed) as u64;
            snapshot.upload_bytes_per_sec = (tx_diff / elapsed) as u64;
        }
    }

    *guard = Some((total_rx, total_tx, now));
    snapshot
}
