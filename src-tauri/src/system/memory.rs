use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MemorySnapshot {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
    pub available_bytes: u64,
    pub app_memory_bytes: u64,
    pub wired_bytes: u64,
    pub compressed_bytes: u64,
    pub purgeable_bytes: u64,
    pub file_cache_bytes: u64,
    pub swap_total_bytes: u64,
    pub swap_used_bytes: u64,
    pub swap_ins_per_sec: u64,
    pub swap_outs_per_sec: u64,
    pub memory_pressure_pct: f32,
    pub memory_pressure_level: String,
    pub compression_ratio: f32,
    pub page_faults: u64,
    pub zero_fill_count: u64,
    pub copy_on_write_count: u64,
}

pub fn get_memory_snapshot() -> MemorySnapshot {
    let mut snapshot = MemorySnapshot::default();
    
    let mut total_ram: u64 = 0;
    let mut size = std::mem::size_of::<u64>();
    let name_c = std::ffi::CString::new("hw.memsize").unwrap();
    unsafe {
        libc::sysctlbyname(
            name_c.as_ptr(),
            &mut total_ram as *mut u64 as *mut libc::c_void,
            &mut size,
            std::ptr::null_mut(),
            0,
        );
    }
    snapshot.total_bytes = total_ram;

    #[allow(deprecated)]
    let host_port = unsafe { libc::mach_host_self() };
    let mut vm_stat: libc::vm_statistics64 = unsafe { std::mem::zeroed() };
    let mut count: libc::mach_msg_type_number_t = (std::mem::size_of::<libc::vm_statistics64>() / std::mem::size_of::<i32>()) as libc::mach_msg_type_number_t;

    let ret = unsafe {
        libc::host_statistics64(
            host_port,
            libc::HOST_VM_INFO64,
            &mut vm_stat as *mut _ as *mut i32,
            &mut count,
        )
    };

    let page_size: u64 = 4096;

    if ret == 0 {
        let _active = (vm_stat.active_count as u64) * page_size;
        let _inactive = (vm_stat.inactive_count as u64) * page_size;
        let wired = (vm_stat.wire_count as u64) * page_size;
        let free = (vm_stat.free_count as u64) * page_size;
        let compressed = (vm_stat.compressor_page_count as u64) * page_size;
        let purgeable = (vm_stat.purgeable_count as u64) * page_size;
        let internal = (vm_stat.internal_page_count as u64) * page_size;
        let external = (vm_stat.external_page_count as u64) * page_size;

        let app_mem = internal.saturating_sub(purgeable);
        let file_cache = external + purgeable;
        let used = app_mem + wired + compressed;
        let available = free + file_cache;

        snapshot.wired_bytes = wired;
        snapshot.app_memory_bytes = app_mem;
        snapshot.compressed_bytes = compressed;
        snapshot.purgeable_bytes = purgeable;
        snapshot.file_cache_bytes = file_cache;
        snapshot.free_bytes = free;
        snapshot.available_bytes = available;
        snapshot.used_bytes = used;

        snapshot.page_faults = vm_stat.faults as u64;
        snapshot.zero_fill_count = vm_stat.zero_fill_count as u64;
        snapshot.copy_on_write_count = vm_stat.cow_faults as u64;
        snapshot.swap_ins_per_sec = vm_stat.swapins as u64;
        snapshot.swap_outs_per_sec = vm_stat.swapouts as u64;

        let total_uncompressed = (vm_stat.total_uncompressed_pages_in_compressor as u64) * page_size;
        if compressed > 0 && total_uncompressed > 0 {
            snapshot.compression_ratio = (total_uncompressed as f32 / compressed as f32).max(1.0);
        } else {
            snapshot.compression_ratio = 1.0;
        }

        if total_ram > 0 {
            let pressure_ratio = (used as f32 / total_ram as f32) * 100.0;
            snapshot.memory_pressure_pct = pressure_ratio.clamp(0.0, 100.0);
            if pressure_ratio > 80.0 {
                snapshot.memory_pressure_level = "Critical".to_string();
            } else if pressure_ratio > 65.0 {
                snapshot.memory_pressure_level = "Warning".to_string();
            } else {
                snapshot.memory_pressure_level = "Normal".to_string();
            }
        }
    }

    #[repr(C)]
    struct XswUsage {
        xsu_total: u64,
        xsu_avail: u64,
        xsu_used: u64,
        xsu_pagesize: u32,
        xsu_encrypted: bool,
    }
    let mut swap_info = XswUsage {
        xsu_total: 0,
        xsu_avail: 0,
        xsu_used: 0,
        xsu_pagesize: 0,
        xsu_encrypted: false,
    };
    let mut swap_size = std::mem::size_of::<XswUsage>();
    let swap_c = std::ffi::CString::new("vm.swapusage").unwrap();
    let swap_ret = unsafe {
        libc::sysctlbyname(
            swap_c.as_ptr(),
            &mut swap_info as *mut _ as *mut libc::c_void,
            &mut swap_size,
            std::ptr::null_mut(),
            0,
        )
    };
    if swap_ret == 0 {
        snapshot.swap_total_bytes = swap_info.xsu_total;
        snapshot.swap_used_bytes = swap_info.xsu_used;
    }

    snapshot
}
