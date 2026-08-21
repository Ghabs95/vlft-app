use crate::models::{
    CockpitSetupInput, CockpitSolution, CockpitVectorResult, StaticBenchmarkInput,
    StaticBenchmarkResult,
};

pub struct GeometrySolver;

impl GeometrySolver {
    /// Calculate static sizing benchmarks (LeMond, Hamley 109%, and delta comparison)
    pub fn calculate_static_benchmarks(input: StaticBenchmarkInput) -> StaticBenchmarkResult {
        let is_en = input.lang.as_deref().unwrap_or("it") == "en";
        let cavallo = input.cavallo;
        let pedivelle = if input.pedivelle > 0.0 { input.pedivelle } else { 170.0 };
        let h_sella = input.h_sella;

        let lemond_h = (cavallo * 0.883).round();
        let hamley_h = ((cavallo * 1.09) - pedivelle).round();

        let min_rec = lemond_h.min(hamley_h) - 5.0;
        let max_rec = lemond_h.max(hamley_h) + 5.0;

        let delta_lemond = if h_sella > 0.0 { h_sella - lemond_h } else { 0.0 };

        let delta_status = if h_sella == 0.0 {
            if is_en { "No saddle height recorded".to_string() } else { "Nessuna misura inserita".to_string() }
        } else if h_sella >= min_rec && h_sella <= max_rec {
            if is_en { "In optimal baseline range".to_string() } else { "Nel range ottimale di riferimento".to_string() }
        } else if h_sella < min_rec {
            let d = (min_rec - h_sella).round() as i64;
            if is_en {
                format!("Saddle is {} mm lower than recommended range", d)
            } else {
                format!("Sella più bassa di {} mm rispetto al range", d)
            }
        } else {
            let d = (h_sella - max_rec).round() as i64;
            if is_en {
                format!("Saddle is {} mm higher than recommended range", d)
            } else {
                format!("Sella più alta di {} mm rispetto al range", d)
            }
        };

        StaticBenchmarkResult {
            cavallo,
            lemond_h,
            hamley_h,
            min_recommended_h: min_rec,
            max_recommended_h: max_rec,
            current_h: h_sella,
            delta_lemond,
            delta_status,
        }
    }

    /// Pure Vector Trigonometry solver for bicycle cockpit
    pub fn solve_cockpit(current: CockpitSetupInput, proposed: CockpitSetupInput) -> CockpitSolution {
        let cur_vec = Self::calculate_cockpit_vectors(&current);
        let prop_vec = Self::calculate_cockpit_vectors(&proposed);

        let delta_clamp_reach = ((prop_vec.clamp_reach - cur_vec.clamp_reach) * 10.0).round() / 10.0;
        let delta_clamp_stack = ((prop_vec.clamp_stack - cur_vec.clamp_stack) * 10.0).round() / 10.0;
        let delta_hood_reach = ((prop_vec.hood_reach - cur_vec.hood_reach) * 10.0).round() / 10.0;
        let delta_hood_stack = ((prop_vec.hood_stack - cur_vec.hood_stack) * 10.0).round() / 10.0;

        CockpitSolution {
            current: cur_vec,
            proposed: prop_vec,
            delta_clamp_reach,
            delta_clamp_stack,
            delta_hood_reach,
            delta_hood_stack,
        }
    }

    fn calculate_cockpit_vectors(setup: &CockpitSetupInput) -> CockpitVectorResult {
        let alpha_rad = setup.head_tube_angle.to_radians();

        // Translation along the steerer tube due to spacers + half stem clamp height (20mm)
        let s_eff = setup.spacers + 20.0;
        let spacer_dx = -s_eff * alpha_rad.cos();
        let spacer_dy = s_eff * alpha_rad.sin();

        // Stem angle relative to the horizontal: theta = head_tube_angle - 90° + stem_angle
        let theta_deg = setup.head_tube_angle - 90.0 + setup.stem_angle;
        let theta_rad = theta_deg.to_radians();

        // Stem vector from steerer clamp to handlebar clamp
        let stem_dx = setup.stem_length * theta_rad.cos();
        let stem_dy = setup.stem_length * theta_rad.sin();

        let clamp_reach = ((spacer_dx + stem_dx) * 10.0).round() / 10.0;
        let clamp_stack = ((spacer_dy + stem_dy) * 10.0).round() / 10.0;

        let hood_reach = ((clamp_reach + setup.bar_reach) * 10.0).round() / 10.0;
        let hood_stack = ((clamp_stack - (setup.bar_drop * 0.35)) * 10.0).round() / 10.0;

        CockpitVectorResult {
            clamp_reach,
            clamp_stack,
            hood_reach,
            hood_stack,
        }
    }
}
