# Changelog

All notable changes to **MacPulse** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-01

### Added
- **Native macOS System Telemetry**: 1s sampling loop for CPU cores, load averages, RAM allocation (Wired, Compressed, File Cache), GPU, Disk I/O, Network throughput, Battery health, and Thermal status.
- **Tauri v2 Desktop App Engine**: High-performance Rust backend powered by `mach2`, `libc`, `sysctl`, and `rusqlite`.
- **Next.js 16 UI**: React 19, Turbopack, Tailwind CSS, Framer Motion, and Recharts.
- **Process Manager**: PID filtering, RSS memory sorting, CPU % monitoring, Sandboxing state, and force quit / reveal in finder functionality.
- **Storage Optimizer**: Multi-threaded treemap analyzer, duplicate file detection with BLAKE3 hashing, and 5-tier safe cache cleaner.
- **System Benchmarks & Diagnostics**: Multi-core CPU stress benchmark and sequential SSD throughput test.
- **Native System Tray**: Native macOS Menu Bar status icon with window toggle.
- **CI/CD & Documentation**: GitHub Actions workflows, Vitest frontend tests, Rust unit tests, MIT License, and comprehensive IPC contract documentation.
