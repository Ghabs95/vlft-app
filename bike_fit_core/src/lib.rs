pub mod diagnostics;
pub mod geometry;
pub mod models;

use diagnostics::DiagnosticSolver;
use geometry::GeometrySolver;
use models::{CockpitSolveRequest, FitStateInput, StaticBenchmarkInput};
use std::slice;

/// Allocate memory for JS string transfer
#[no_mangle]
pub extern "C" fn alloc_buffer(size: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

/// Deallocate memory
#[no_mangle]
pub unsafe extern "C" fn dealloc_buffer(ptr: *mut u8, size: usize) {
    if !ptr.is_null() {
        let _ = Vec::from_raw_parts(ptr, size, size);
    }
}

/// Helper to serialize response with 4-byte length prefix
unsafe fn serialize_to_wasm_buffer<T: serde::Serialize>(val: &T) -> *mut u8 {
    let json_bytes = match serde_json::to_vec(val) {
        Ok(b) => b,
        Err(_) => b"{}".to_vec(),
    };

    let len = json_bytes.len() as u32;
    let mut full_payload = Vec::with_capacity(4 + json_bytes.len());
    full_payload.extend_from_slice(&len.to_le_bytes());
    full_payload.extend_from_slice(&json_bytes);

    let ptr = full_payload.as_mut_ptr();
    std::mem::forget(full_payload);
    ptr
}

/// Run full biomechanical fit analysis via WebAssembly
#[no_mangle]
pub unsafe extern "C" fn analyze_fit_wasm(ptr: *const u8, len: usize) -> *mut u8 {
    let slice = slice::from_raw_parts(ptr, len);
    let input: FitStateInput = match serde_json::from_slice(slice) {
        Ok(val) => val,
        Err(_) => FitStateInput::default(),
    };

    let result = DiagnosticSolver::analyze(input);
    serialize_to_wasm_buffer(&result)
}

/// Calculate static sizing benchmarks via WebAssembly
#[no_mangle]
pub unsafe extern "C" fn calculate_static_benchmarks_wasm(ptr: *const u8, len: usize) -> *mut u8 {
    let slice = slice::from_raw_parts(ptr, len);
    let input: StaticBenchmarkInput = match serde_json::from_slice(slice) {
        Ok(val) => val,
        Err(_) => StaticBenchmarkInput {
            cavallo: 0.0,
            altezza: 0.0,
            pedivelle: 170.0,
            h_sella: 0.0,
            busto: None,
            braccio: None,
            lang: None,
        },
    };

    let result = GeometrySolver::calculate_static_benchmarks(input);
    serialize_to_wasm_buffer(&result)
}

/// Solve 2D vector cockpit geometry via WebAssembly
#[no_mangle]
pub unsafe extern "C" fn solve_cockpit_wasm(ptr: *const u8, len: usize) -> *mut u8 {
    let slice = slice::from_raw_parts(ptr, len);
    let input: CockpitSolveRequest = match serde_json::from_slice(slice) {
        Ok(val) => val,
        Err(_) => return serialize_to_wasm_buffer(&"{}"),
    };

    let result = GeometrySolver::solve_cockpit(input.current, input.proposed);
    serialize_to_wasm_buffer(&result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use models::{CockpitSetupInput, VideoAngles};
    use std::collections::HashMap;

    #[test]
    fn test_static_benchmarks_lemond_hamley() {
        let input = StaticBenchmarkInput {
            cavallo: 770.0,
            altezza: 173.0,
            pedivelle: 170.0,
            h_sella: 750.0,
            busto: None,
            braccio: None,
            lang: Some("en".to_string()),
        };
        let res = GeometrySolver::calculate_static_benchmarks(input);
        assert_eq!(res.lemond_h, 680.0);
        assert_eq!(res.hamley_h, 669.0);
        assert_eq!(res.min_recommended_h, 664.0);
        assert_eq!(res.max_recommended_h, 685.0);
        assert!(res.delta_status.contains("higher than recommended"));
    }

    #[test]
    fn test_cockpit_vector_geometry() {
        let current = CockpitSetupInput {
            head_tube_angle: 73.0,
            spacers: 23.0,
            stem_length: 120.0,
            stem_angle: -6.0,
            bar_reach: 80.0,
            bar_drop: 125.0,
        };
        let proposed = CockpitSetupInput {
            head_tube_angle: 73.0,
            spacers: 15.0,
            stem_length: 100.0,
            stem_angle: -6.0,
            bar_reach: 80.0,
            bar_drop: 125.0,
        };
        let res = GeometrySolver::solve_cockpit(current, proposed);
        assert!((res.delta_clamp_reach - (-16.1)).abs() < 1.0);
    }

    #[test]
    fn test_diagnostic_engine_universal() {
        let mut v = HashMap::new();
        v.insert("disciplina".to_string(), "Strada".to_string());
        v.insert("cavallo".to_string(), "820".to_string());
        v.insert("h_sella".to_string(), "700".to_string());
        v.insert("ischi_mm".to_string(), "140".to_string());
        v.insert("sella_larg".to_string(), "142".to_string());

        let video = VideoAngles {
            knee_bdc: Some(132.0),
            elbow: Some(168.0),
            ..Default::default()
        };

        let state = FitStateInput {
            v,
            sx: HashMap::new(),
            video_angles: Some(video),
            lang: Some("en".to_string()),
        };

        let res = DiagnosticSolver::analyze(state);
        assert!(res.total_issues >= 2);
        assert!(res.score < 80);
        assert_eq!(res.discipline_name, "Strada / Road (Endurance & Performance)");
    }
}
