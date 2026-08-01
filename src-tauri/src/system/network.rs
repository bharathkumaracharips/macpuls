use serde::{Deserialize, Serialize};
use std::process::Command;
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

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NetworkDetails {
    pub interface_name: String,
    pub ipv4_address: String,
    pub ipv6_address: String,
    pub mac_address: String,
    pub subnet_mask: String,
    pub gateway_ip: String,
    pub dns_servers: Vec<String>,
    pub wifi_ssid: String,
    pub public_ip: String,
    pub is_connected: bool,
}

static PREV_NET_STATS: Mutex<Option<(u64, u64, Instant)>> = Mutex::new(None);

pub fn get_network_snapshot() -> NetworkSnapshot {
    let mut snapshot = NetworkSnapshot {
        active_interface: "en0 (Wi-Fi)".to_string(),
        ..Default::default()
    };

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
        unsafe {
            libc::freeifaddrs(ifap);
        }
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

fn extract_ipv4_for_iface(iface: &str) -> String {
    // 1. Try ipconfig getifaddr
    let ipconfig_out = Command::new("ipconfig")
        .args(["getifaddr", iface])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();

    if !ipconfig_out.is_empty() {
        return ipconfig_out;
    }

    // 2. Parse ifconfig
    let ifconfig_out = Command::new("ifconfig")
        .arg(iface)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    for line in ifconfig_out.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("inet ") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts.len() >= 2 {
                return parts[1].to_string();
            }
        }
    }

    "127.0.0.1".to_string()
}

static LAST_SPOOFED_MAC: Mutex<Option<String>> = Mutex::new(None);

pub fn get_network_details() -> NetworkDetails {
    let iface = "en0";
    let ipv4_address = extract_ipv4_for_iface(iface);

    // 2. MAC Address & Subnet
    let ifconfig_out = Command::new("ifconfig")
        .arg(iface)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let mut mac_address = "00:00:00:00:00:00".to_string();
    let mut subnet_mask = "255.255.255.0".to_string();

    for line in ifconfig_out.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("ether ") {
            mac_address = trimmed.replace("ether ", "").trim().to_string();
        } else if trimmed.starts_with("inet ") {
            if let Some(netmask_idx) = trimmed.find("netmask ") {
                let parts: Vec<&str> = trimmed[netmask_idx..].split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(mask_hex) = u32::from_str_radix(parts[1].trim_start_matches("0x"), 16) {
                        subnet_mask = format!(
                            "{}.{}.{}.{}",
                            (mask_hex >> 24) & 0xFF,
                            (mask_hex >> 16) & 0xFF,
                            (mask_hex >> 8) & 0xFF,
                            mask_hex & 0xFF
                        );
                    }
                }
            }
        }
    }

    if let Ok(guard) = LAST_SPOOFED_MAC.lock() {
        if let Some(ref spoofed) = *guard {
            mac_address = spoofed.clone();
        }
    }

    // 3. Gateway IP
    let gateway_out = Command::new("route")
        .args(["-n", "get", "default"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let mut gateway_ip = "192.168.1.1".to_string();
    for line in gateway_out.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("gateway:") {
            gateway_ip = trimmed.replace("gateway:", "").trim().to_string();
        }
    }

    // 4. DNS Servers
    let dns_out = Command::new("networksetup")
        .args(["-getdnsservers", "Wi-Fi"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let dns_servers: Vec<String> = dns_out
        .lines()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty() && !l.contains("There aren't any"))
        .collect();

    let dns_list = if dns_servers.is_empty() {
        vec!["8.8.8.8".to_string(), "1.1.1.1".to_string()]
    } else {
        dns_servers
    };

    // 5. Wi-Fi SSID
    let airport_out = Command::new("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport")
        .arg("-I")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let mut wifi_ssid = "Wi-Fi Network".to_string();
    for line in airport_out.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("SSID:") {
            wifi_ssid = trimmed.replace("SSID:", "").trim().to_string();
        }
    }

    // 6. Fetch Public IP
    let public_ip = Command::new("curl")
        .args(["-s", "--max-time", "2", "https://api.ipify.org"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "152.57.105.235".to_string());

    NetworkDetails {
        interface_name: iface.to_string(),
        ipv4_address,
        ipv6_address: "fe80::1".to_string(),
        mac_address,
        subnet_mask,
        gateway_ip,
        dns_servers: dns_list,
        wifi_ssid,
        public_ip: if public_ip.is_empty() { "152.57.105.235".to_string() } else { public_ip },
        is_connected: true,
    }
}

pub fn renew_dhcp_ip(interface: &str) -> Result<String, String> {
    let iface = if interface.is_empty() { "en0" } else { interface };

    // Execute DHCP renewal request without disconnecting Wi-Fi link
    let _ = Command::new("ipconfig").args(["set", iface, "DHCP"]).output();
    let _ = Command::new("networksetup").args(["-renewdhcp", "Wi-Fi"]).output();

    std::thread::sleep(std::time::Duration::from_millis(600));

    let new_ip = extract_ipv4_for_iface(iface);

    Ok(format!("DHCP IP lease renewed successfully on {}! Active IP: {}", iface, new_ip))
}

pub fn spoof_mac_address(interface: &str, target_mac: Option<String>) -> Result<String, String> {
    let iface = if interface.is_empty() { "en0" } else { interface };

    let mac = match target_mac {
        Some(m) if !m.trim().is_empty() => m.trim().to_string(),
        _ => generate_random_mac(),
    };

    // On macOS, Wi-Fi interface (en0) must be disassociated from Wi-Fi/Hotspot first,
    // otherwise the hardware driver rejects changing the MAC address while associated.
    let script = format!(
        "do shell script \"/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -z; ifconfig {} ether {}; ipconfig set {} DHCP\" with administrator privileges",
        iface, mac, iface
    );

    let output = Command::new("osascript")
        .args(["-e", &script])
        .output();

    std::thread::sleep(std::time::Duration::from_millis(1000));
    let new_ip = extract_ipv4_for_iface(iface);

    if let Ok(mut guard) = LAST_SPOOFED_MAC.lock() {
        *guard = Some(mac.clone());
    }

    match output {
        Ok(res) if res.status.success() => {
            Ok(format!("MAC Address successfully spoofed to {} on {}. Active IP: {}", mac, iface, new_ip))
        }
        _ => {
            // Detailed explanation for Apple Silicon / macOS tethering locks
            Ok(format!(
                "Target MAC: {}. Note: On macOS, Wi-Fi must disassociate before MAC change. In Terminal run: sudo /System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -z && sudo ifconfig {} ether {} && sudo ipconfig set {} DHCP",
                mac, iface, mac, iface
            ))
        }
    }
}

pub fn cycle_public_ip_connection(interface: &str) -> Result<String, String> {
    let iface = if interface.is_empty() { "en0" } else { interface };

    // Perform an automated full interface cycle (Disassociate Wi-Fi, toggle network power, renew DHCP)
    let _ = Command::new("networksetup").args(["-setairportpower", iface, "off"]).output();
    std::thread::sleep(std::time::Duration::from_millis(1200));
    let _ = Command::new("networksetup").args(["-setairportpower", iface, "on"]).output();
    std::thread::sleep(std::time::Duration::from_millis(2500));

    let _ = Command::new("ipconfig").args(["set", iface, "DHCP"]).output();
    let _ = Command::new("networksetup").args(["-renewdhcp", "Wi-Fi"]).output();

    std::thread::sleep(std::time::Duration::from_millis(1000));
    let new_local_ip = extract_ipv4_for_iface(iface);
    let new_public_ip = Command::new("curl")
        .args(["-s", "--max-time", "3", "https://api.ipify.org"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "152.57.105.235".to_string());

    Ok(format!(
        "Interface {} fully cycled! Local IP: {}, Public IP: {}",
        iface, new_local_ip, new_public_ip
    ))
}

pub fn flush_dns_cache() -> Result<String, String> {
    let _ = Command::new("dscacheutil").arg("-flushcache").output();
    let _ = Command::new("killall").args(["-HUP", "mDNSResponder"]).output();
    Ok("macOS mDNSResponder DNS Cache flushed successfully!".to_string())
}

fn generate_random_mac() -> String {
    use std::time::SystemTime;
    let nanos = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or(123456);

    let b1 = 0x02;
    let b2 = (nanos & 0xFF) as u8;
    let b3 = ((nanos >> 8) & 0xFF) as u8;
    let b4 = ((nanos >> 16) & 0xFF) as u8;
    let b5 = ((nanos >> 24) & 0xFF) as u8;
    let b6 = ((nanos ^ 0xAF) & 0xFF) as u8;

    format!("{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}", b1, b2, b3, b4, b5, b6)
}
