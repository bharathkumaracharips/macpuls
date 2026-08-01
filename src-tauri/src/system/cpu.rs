use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CoreUsage {
    pub core_id: usize,
    pub usage_pct: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CpuSnapshot {
    pub overall_usage_pct: f32,
    pub core_count: usize,
    pub cores: Vec<CoreUsage>,
    pub load_avg_1m: f64,
    pub load_avg_5m: f64,
    pub load_avg_15m: f64,
    pub brand_name: String,
    pub frequency_mhz: u64,
}

#[derive(Clone)]
struct CpuTicks {
    user: u64,
    system: u64,
    idle: u64,
    nice: u64,
}

static PREV_TICKS: Mutex<Option<Vec<CpuTicks>>> = Mutex::new(None);

pub fn get_cpu_snapshot() -> CpuSnapshot {
    let mut snapshot = CpuSnapshot {
        brand_name: get_cpu_brand(),
        frequency_mhz: 3200,
        ..Default::default()
    };

    #[allow(deprecated)]
    let host_port = unsafe { libc::mach_host_self() };
    let mut processor_count: libc::natural_t = 0;
    let mut info_array: *mut i32 = std::ptr::null_mut();
    let mut info_count: libc::mach_msg_type_number_t = 0;

    let ret = unsafe {
        libc::host_processor_info(
            host_port,
            libc::PROCESSOR_CPU_LOAD_INFO,
            &mut processor_count,
            &mut info_array as *mut _ as *mut _,
            &mut info_count,
        )
    };

    if ret == 0 && !info_array.is_null() {
        let num_cores = processor_count as usize;
        snapshot.core_count = num_cores;
        let cpu_info = info_array as *const i32;

        let mut current_ticks = Vec::with_capacity(num_cores);
        for i in 0..num_cores {
            let offset = i * 4;
            unsafe {
                let user = *cpu_info.add(offset + 0) as u64;
                let system = *cpu_info.add(offset + 1) as u64;
                let idle = *cpu_info.add(offset + 2) as u64;
                let nice = *cpu_info.add(offset + 3) as u64;
                current_ticks.push(CpuTicks { user, system, idle, nice });
            }
        }

        let mut prev_guard = PREV_TICKS.lock().unwrap();
        let mut overall_sum = 0.0f32;

        if let Some(ref prev) = *prev_guard {
            if prev.len() == num_cores {
                for i in 0..num_cores {
                    let c_curr = &current_ticks[i];
                    let c_prev = &prev[i];

                    let user_diff = c_curr.user.saturating_sub(c_prev.user) as f32;
                    let sys_diff = c_curr.system.saturating_sub(c_prev.system) as f32;
                    let nice_diff = c_curr.nice.saturating_sub(c_prev.nice) as f32;
                    let idle_diff = c_curr.idle.saturating_sub(c_prev.idle) as f32;

                    let total = user_diff + sys_diff + nice_diff + idle_diff;
                    let usage = if total > 0.0 {
                        ((user_diff + sys_diff + nice_diff) / total) * 100.0
                    } else {
                        0.0
                    };

                    snapshot.cores.push(CoreUsage {
                        core_id: i,
                        usage_pct: usage.clamp(0.0, 100.0),
                    });
                    overall_sum += usage;
                }
                if num_cores > 0 {
                    snapshot.overall_usage_pct = (overall_sum / num_cores as f32).clamp(0.0, 100.0);
                }
            }
        }

        if snapshot.cores.is_empty() {
            for i in 0..num_cores {
                snapshot.cores.push(CoreUsage { core_id: i, usage_pct: 0.0 });
            }
        }

        *prev_guard = Some(current_ticks);

        unsafe {
            libc::vm_deallocate(
                mach2::traps::mach_task_self(),
                info_array as usize as libc::vm_address_t,
                (info_count as usize * std::mem::size_of::<i32>()) as libc::vm_size_t,
            );
        }
    }

    let mut load_avg: [f64; 3] = [0.0; 3];
    let samples = unsafe { libc::getloadavg(load_avg.as_mut_ptr(), 3) };
    if samples == 3 {
        snapshot.load_avg_1m = load_avg[0];
        snapshot.load_avg_5m = load_avg[1];
        snapshot.load_avg_15m = load_avg[2];
    }

    snapshot
}

fn get_cpu_brand() -> String {
    let mut size = 0;
    let name_c = std::ffi::CString::new("machdep.cpu.brand_string").unwrap();
    unsafe {
        libc::sysctlbyname(name_c.as_ptr(), std::ptr::null_mut(), &mut size, std::ptr::null_mut(), 0);
    }
    if size > 0 {
        let mut buf = vec![0u8; size];
        let ret = unsafe {
            libc::sysctlbyname(
                name_c.as_ptr(),
                buf.as_mut_ptr() as *mut libc::c_void,
                &mut size,
                std::ptr::null_mut(),
                0,
            )
        };
        if ret == 0 {
            if let Ok(brand) = String::from_utf8(buf) {
                let trimmed = brand.trim_matches('\0').trim();
                if !trimmed.is_empty() {
                    return trimmed.to_string();
                }
            }
        }
    }
    "Apple Silicon (M-Series)".to_string()
}
