# ⚡️ MacPulse

> **Native macOS System Telemetry, Process Monitor & Storage Optimizer**  
> Built with **Tauri v2**, **Rust**, **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.77%2B-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131.svg)](https://tauri.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg)](https://nextjs.org/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20%26%20Intel)-lightgrey.svg)]()

---

## 💻 Overview

**MacPulse** is a lightweight, low-overhead native macOS desktop application designed to provide real-time system metrics, deep memory breakdown, process management, storage cleanup, system diagnostics, and developer tools in a clean, modern interface.

Unlike electron-based system monitors that consume gigabytes of RAM, MacPulse leverages a native **Rust backend** using macOS system kernel calls (`mach2`, `libc`, `sysctl`) paired with a high-performance **Next.js 16 (Turbopack)** UI rendered via Tauri's WKWebView wrapper.

---

## ✨ Features

- **⚡ Live System Telemetry**: 1000ms real-time sampling for CPU core utilization, load averages, memory pressure, GPU, disk I/O, network bandwidth, battery health, and thermal state.
- **🧠 Advanced Memory Breakdown**: Deep breakdown of App Memory, Wired Memory, Compressed RAM, Purgeable Cache, File Cache, and Swap pressure.
- **📊 Process Manager**: Filterable, sortable process list with per-process CPU/RAM consumption, PID search, force kill, and "Reveal in Finder".
- **🧹 Storage Optimizer & Treemap**: High-speed multi-threaded disk usage treemap scanner, duplicate file detection (BLAKE3 hashing), and cache cleanup analyzer.
- **⚡ System Benchmarks**: Synthetic multi-core CPU and disk read/write throughput benchmark test suite with score history.
- **🛡 System Security & Audit**: macOS System Permissions auditor (Accessibility, Full Disk Access, Screen Recording, Location) and developer tools inspection (Docker, Homebrew, Xcode).
- **🗄 Metric History & Database**: Local SQLite metrics history database with customizable retention window and CSV/JSON export capability.
- **🔔 Native Menu Bar Tray & Notifications**: System tray widget for instant status monitoring without keeping the main window open.

---

## 🏗 Architecture & IPC Contract

```
 ┌─────────────────────────────────────────────────────────────┐
 │                   Next.js 16 UI Frontend                    │
 │    (React 19 + TypeScript + Recharts + Tailwind + Zustand)   │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Tauri IPC Invokes & Events
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    Tauri v2 Rust Backend                    │
 │                                                             │
 │   ┌──────────────────────┐      ┌────────────────────────┐  │
 │   │ Background Collector │      │ SQLite Metrics History │  │
 │   └──────────┬───────────┘      └────────────────────────┘  │
 │              │ Native macOS Kernel APIs                     │
 │              ▼                                              │
 │   (mach2, libc, sysctl, proc_pidinfo, IOKit, Metal)         │
 └─────────────────────────────────────────────────────────────┘
```

### IPC Interface (`src/lib/ipc.ts`)

- **Events Emitted**: `metrics_tick` (Real-time snapshot every 1s)
- **Tauri Commands**:
  - `get_latest_metrics`
  - `get_process_list` / `kill_process_command(pid)` / `reveal_in_finder_command(path)`
  - `scan_storage_treemap_command(path)` / `scan_duplicates_command(path)` / `scan_cleanup_cache_command()`
  - `execute_cleanup_command(items)`
  - `get_recommendations_command()` / `get_history_command(timeframe)`
  - `audit_permissions_command()` / `get_plugins_command()`
  - `run_cpu_benchmark_command()` / `run_disk_benchmark_command()` / `generate_diagnostics_command()`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
1. **macOS**: macOS 12 Monterey or newer (Apple Silicon M1/M2/M3/M4 or Intel).
2. **Node.js**: v18.0.0 or higher ([nodejs.org](https://nodejs.org/)).
3. **Rust**: v1.77.2 or higher (`rustup default stable`).
4. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bharathkumaracharips/macpuls.git
   cd macpuls
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the application in Development Mode**:
   ```bash
   npx tauri dev
   ```
   *This command runs Next.js in Turbopack dev mode and launches the native macOS app.*

---

## 📦 Building Standalone Desktop Installers

To create an optimized, standalone macOS desktop bundle (`.dmg` or `.app`):

```bash
npx tauri build
```

The output installation packages will be placed in:
`src-tauri/target/release/bundle/dmg/`

---

## 🧪 Testing & Linting

```bash
# Frontend Lint & Typecheck
npm run lint
npx tsc --noEmit

# Rust Backend Checks & Unit Tests
cd src-tauri
cargo check
cargo test
cargo clippy
```

---

## 🤝 Contributing

Contributions are welcome! Please review our [Contributing Guide](CONTRIBUTING.md) for architectural overview, coding standards, and pull request workflow.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
