/**
 * BIKE FIT PRO - WEBASSEMBLY (WASM) LOADER & BRIDGE
 * Supports both HTTP fetch and direct file:// protocol via embedded Base64 binary.
 * Zero CORS errors, 100% offline, native Rust execution speed.
 */

const WasmBikeFit = {
  instance: null,
  memory: null,
  isReady: false,

  /**
   * Helper to decode Base64 string to Uint8Array binary
   */
  _base64ToUint8Array(base64) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64, 'base64');
    }
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  },

  /**
   * Initialize and instantiate the WebAssembly binary
   */
  async init(wasmPath = "bike_fit_core.wasm") {
    // 1. Try embedded Base64 first (bypasses CORS restrictions on file:// URLs)
    if (typeof BIKE_FIT_WASM_BASE64 !== 'undefined' && BIKE_FIT_WASM_BASE64.length > 100) {
      try {
        const bytes = this._base64ToUint8Array(BIKE_FIT_WASM_BASE64);
        const wasmModule = await WebAssembly.instantiate(bytes, {});
        this.instance = wasmModule.instance;
        this.memory = this.instance.exports.memory;
        this.isReady = true;
        console.log("🦀 Rust WebAssembly core (Embedded Binary) loaded & active!");
        return true;
      } catch (err) {
        console.warn("Embedded Base64 WASM instantiation error:", err);
      }
    }

    // 2. Try Node.js fs buffer if running in Node test environment
    if (typeof require !== 'undefined' && typeof process !== 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const buf = fs.readFileSync(path.resolve(__dirname, wasmPath));
        const wasmModule = await WebAssembly.instantiate(buf, {});
        this.instance = wasmModule.instance;
        this.memory = this.instance.exports.memory;
        this.isReady = true;
        console.log("🦀 Rust WebAssembly core loaded in Node runtime!");
        return true;
      } catch (e) {}
    }

    // 3. Try HTTP Fetch if served over a web server (http:// or https://)
    if (typeof window !== 'undefined' && window.location.protocol.startsWith("http")) {
      try {
        const response = await fetch(wasmPath);
        if (response && response.ok) {
          const bytes = await response.arrayBuffer();
          const wasmModule = await WebAssembly.instantiate(bytes, {});
          this.instance = wasmModule.instance;
          this.memory = this.instance.exports.memory;
          this.isReady = true;
          console.log("🦀 Rust WebAssembly core (HTTP Fetch) loaded & active!");
          return true;
        }
      } catch (err) {
        console.warn("HTTP Fetch WASM failed:", err);
      }
    }

    console.warn("WASM not initialized. Falling back to JS engine.");
    this.isReady = false;
    return false;
  },

  /**
   * Call a WASM function that receives JSON and returns serialized JSON
   */
  _callWasmJson(fnName, jsPayload) {
    if (!this.isReady || !this.instance || !this.instance.exports[fnName]) {
      return null;
    }

    try {
      const jsonStr = JSON.stringify(jsPayload);
      const encoder = new TextEncoder();
      const encodedBytes = encoder.encode(jsonStr);

      const inputLen = encodedBytes.length;
      const inputPtr = this.instance.exports.alloc_buffer(inputLen);

      // Write bytes to WASM linear memory
      const wasmMemView = new Uint8Array(this.memory.buffer);
      wasmMemView.set(encodedBytes, inputPtr);

      // Execute WASM function
      const resultPtr = this.instance.exports[fnName](inputPtr, inputLen);

      // Read 4-byte length prefix
      const memBuffer = new Uint8Array(this.memory.buffer);
      const outputLen = memBuffer[resultPtr] |
        (memBuffer[resultPtr + 1] << 8) |
        (memBuffer[resultPtr + 2] << 16) |
        (memBuffer[resultPtr + 3] << 24);

      // Read JSON payload
      const jsonBytes = memBuffer.slice(resultPtr + 4, resultPtr + 4 + outputLen);
      const decoder = new TextDecoder();
      const responseJsonStr = decoder.decode(jsonBytes);

      // Clean up memory
      this.instance.exports.dealloc_buffer(inputPtr, inputLen);
      this.instance.exports.dealloc_buffer(resultPtr, outputLen + 4);

      return JSON.parse(responseJsonStr);
    } catch (err) {
      console.error(`Error executing WASM function ${fnName}:`, err);
      return null;
    }
  },

  /**
   * Analyze Fit (Universal Diagnostic Engine)
   */
  analyzeFit(state, lang = "it") {
    const payload = {
      v: state.v || {},
      sx: state.sx || {},
      video_angles: state.videoAngles ? {
        knee_bdc: state.videoAngles.kneeBDC,
        knee_tdc: state.videoAngles.kneeTDC,
        torso: state.videoAngles.torso,
        shoulder: state.videoAngles.shoulder,
        elbow: state.videoAngles.elbow,
        hip_tdc: state.videoAngles.hipTDC,
        ankle: state.videoAngles.ankle,
        right_knee_deviation: state.videoAngles.rightKneeDeviation,
        frontal_valgus_varus: state.videoAngles.frontalValgusVarus
      } : null,
      lang: lang || "it"
    };

    const wasmRes = this._callWasmJson("analyze_fit_wasm", payload);
    if (wasmRes) {
      return {
        discipline: wasmRes.discipline,
        disciplineName: wasmRes.discipline_name,
        targets: wasmRes.targets,
        issues: wasmRes.issues,
        actionPlan: wasmRes.action_plan,
        score: wasmRes.score,
        totalIssues: wasmRes.total_issues,
        highPriorityCount: wasmRes.high_priority_count,
        mediumPriorityCount: wasmRes.medium_priority_count,
        lowPriorityCount: wasmRes.low_priority_count,
        engine: "Rust WebAssembly Core"
      };
    }

    // Fallback to JS DiagnosticEngine if WASM not ready
    if (typeof DiagnosticEngine !== 'undefined') {
      return DiagnosticEngine.analyzeFit(state);
    }
    return null;
  },

  /**
   * Calculate Static Fit Benchmarks
   */
  calculateStaticBenchmarks(params) {
    const payload = {
      cavallo: parseFloat(params.cavallo) || 0,
      altezza: parseFloat(params.altezza) || 0,
      pedivelle: parseFloat(params.pedivelle) || 170,
      h_sella: parseFloat(params.h_sella) || 0,
      busto: params.busto ? parseFloat(params.busto) : null,
      braccio: params.braccio ? parseFloat(params.braccio) : null,
      lang: params.lang || "it"
    };

    const wasmRes = this._callWasmJson("calculate_static_benchmarks_wasm", payload);
    if (wasmRes) {
      return {
        cavallo: wasmRes.cavallo,
        lemondH: wasmRes.lemond_h,
        hamleyH: wasmRes.hamley_h,
        minRecommendedH: wasmRes.min_recommended_h,
        maxRecommendedH: wasmRes.max_recommended_h,
        currentH: wasmRes.current_h,
        deltaLemond: wasmRes.delta_lemond,
        deltaStatus: wasmRes.delta_status
      };
    }

    if (typeof BikeGeometry !== 'undefined') {
      return BikeGeometry.calculateStaticBenchmarks(params);
    }
    return null;
  },

  /**
   * Solve Cockpit 2D Vector Geometry
   */
  solveCockpit(current, proposed) {
    const payload = {
      current: {
        head_tube_angle: parseFloat(current.headTubeAngle) || 73,
        spacers: parseFloat(current.spacers) || 0,
        stem_length: parseFloat(current.stemLength) || 100,
        stem_angle: parseFloat(current.stemAngle) || -6,
        bar_reach: parseFloat(current.barReach) || 80,
        bar_drop: parseFloat(current.barDrop) || 125
      },
      proposed: {
        head_tube_angle: parseFloat(proposed.headTubeAngle) || 73,
        spacers: parseFloat(proposed.spacers) || 0,
        stem_length: parseFloat(proposed.stemLength) || 100,
        stem_angle: parseFloat(proposed.stemAngle) || -6,
        bar_reach: parseFloat(proposed.barReach) || 80,
        bar_drop: parseFloat(proposed.barDrop) || 125
      }
    };

    const wasmRes = this._callWasmJson("solve_cockpit_wasm", payload);
    if (wasmRes) {
      return {
        current: {
          clampReach: wasmRes.current.clamp_reach,
          clampStack: wasmRes.current.clamp_stack,
          hoodReach: wasmRes.current.hood_reach,
          hoodStack: wasmRes.current.hood_stack
        },
        proposed: {
          clampReach: wasmRes.proposed.clamp_reach,
          clampStack: wasmRes.proposed.clamp_stack,
          hoodReach: wasmRes.proposed.hood_reach,
          hoodStack: wasmRes.proposed.hood_stack
        },
        deltaClampReach: wasmRes.delta_clamp_reach,
        deltaClampStack: wasmRes.delta_clamp_stack,
        deltaHoodReach: wasmRes.delta_hood_reach,
        deltaHoodStack: wasmRes.delta_hood_stack
      };
    }

    if (typeof BikeGeometry !== 'undefined') {
      return BikeGeometry.solveCockpit(current, proposed);
    }
    return null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WasmBikeFit };
}
