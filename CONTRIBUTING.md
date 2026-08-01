# Contributing to MacPulse ⚡️

Thank you for your interest in contributing to **MacPulse**! We welcome bug reports, feature requests, documentation improvements, and code contributions.

---

## 🛠 Project Architecture

MacPulse is built with a decoupled desktop architecture:
- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, and Zustand for state management.
- **Backend**: Rust using Tauri v2 framework, low-level macOS system APIs (`mach2`, `libc`, `sysctl`, `rusqlite`), multi-threaded Tokio runtime, and native menu bar system tray.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your macOS machine:
1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **Rust**: v1.77.2 or higher (`rustc --version`)
3. **Xcode Command Line Tools**: `xcode-select --install`

### Workspace Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bharathkumaracharips/macpuls.git
   cd macpuls
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Run in Development Mode**:
   ```bash
   npx tauri dev
   ```
   This will start both the Next.js Turbopack dev server (`localhost:3000`) and compile/launch the Tauri v2 desktop application.

---

## 🧪 Testing & Code Quality

Before opening a pull request, ensure all linting and build checks pass:

### Frontend Checks
```bash
# Run ESLint check
npm run lint

# Check TypeScript type validity
npx tsc --noEmit
```

### Backend (Rust) Checks
```bash
cd src-tauri

# Run Rust compiler check
cargo check

# Run Rust linter (Clippy)
cargo clippy -- -D warnings

# Run Rust unit tests
cargo test
```

---

## 📥 Submitting Pull Requests

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```
2. Make your changes adhering to existing formatting and architectural conventions.
3. Write test cases for new logic where appropriate.
4. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(system): add Apple Silicon Neural Engine telemetry monitor"
   ```
5. Push to your fork and open a Pull Request against `main`.

---

## 📜 Code of Conduct & Licensing

By contributing to MacPulse, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
