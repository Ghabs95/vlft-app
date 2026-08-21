# VELOFIT STUDIO 🚴📐

> **Professional Biomechanical Fitting, Kinematic AI Video Pose Tracking & Cockpit Simulation Suite**

Velofit Studio is a high-performance, client-side web application designed to help cyclists and bike fitters analyze riding postures, diagnose fit issues, simulate cockpit geometry adjustments, and track changes across pedal strokes.

---

## ✨ Key Features

1. **🎥 AI Video Pose Tracking & Cadence Detector**
   - MediaPipe Pose landmark detection for real-time knee, hip, torso, shoulder, and elbow joint angle computation.
   - Sinusoidal ankle peak-trough cadence analyzer with automated Bottom Dead Center (BDC - 6 o'clock) phase lock.
   - Frontal plane valgus/varus knee tracking with laser plumbline overlays.

2. **🩺 Clinical Biomechanical Diagnostic Engine**
   - Purely deterministic, multi-discipline rule solver based on international clinical literature (Holmes, Pruitt, Retül, Burt, Hogg).
   - Tailored target windows for **Road (Race & Endurance)**, **Gravel**, **MTB XC**, **MTB Trail/Enduro**, **Time Trial / Triathlon**, and **Urban / Touring**.
   - Generates a prioritized **1-2-3 Action Plan** with 1-click sync into the **Fit Modification Register**.

3. **📐 2D Vector Cockpit Geometry Simulator**
   - Mathematical solver for head tube angles, spacers, stem length/angle, and handlebar reach/drop.
   - Interactive SVG simulator visualizer comparing current vs. proposed cockpit setups.

4. **⚖️ Lockstep Synchronized Dual Video Player**
   - Side-by-side video player with BDC phase lock for before/after fit validation.

5. **🦀 Rust WebAssembly (WASM) Core (`bike_fit_core`)**
   - Proprietary clinical logic and vector trigonometry compiled into low-level `.wasm` binary bytecode.
   - 100% offline with zero cloud latency and embedded Base64 fallback for `file:///` local execution.

6. **🌐 Dual-Language Support (IT 🇮🇹 / EN 🇬🇧)**
   - Instant language toggle across questionnaires, HUD badges, diagnostics, and glossary.

---

## 🚀 Getting Started

### Local Execution (No Server Needed)
Simply open `index.html` in any modern web browser:
```bash
open index.html
```

Or run a local HTTP development server:
```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## 🦀 Building the Rust Core (`bike_fit_core`)

To run unit tests or rebuild the WebAssembly binary from source:

```bash
cd bike_fit_core

# Run native Rust unit tests
cargo test

# Compile release WebAssembly binary
cargo build --target wasm32-unknown-unknown --release

# Copy release binary to the app
cp target/wasm32-unknown-unknown/release/bike_fit_core.wasm ../bike_fit_core.wasm
```

---

## 📄 License
All rights reserved © 2026 Velofit Studio.
