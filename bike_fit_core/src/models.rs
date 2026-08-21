use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SymptomEntry {
    #[serde(default)]
    pub p: String, // "No", "Lieve" / "Mild", "Marcato" / "Severe"
    #[serde(default)]
    pub q: String,
    #[serde(default)]
    pub l: String,
    #[serde(default)]
    pub n: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VideoAngles {
    #[serde(default)]
    pub knee_bdc: Option<f64>,
    #[serde(default)]
    pub knee_tdc: Option<f64>,
    #[serde(default)]
    pub torso: Option<f64>,
    #[serde(default)]
    pub shoulder: Option<f64>,
    #[serde(default)]
    pub elbow: Option<f64>,
    #[serde(default)]
    pub hip_tdc: Option<f64>,
    #[serde(default)]
    pub ankle: Option<f64>,
    #[serde(default)]
    pub right_knee_deviation: Option<f64>,
    #[serde(default)]
    pub frontal_valgus_varus: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FitStateInput {
    #[serde(default)]
    pub v: HashMap<String, String>,
    #[serde(default)]
    pub sx: HashMap<String, SymptomEntry>,
    #[serde(default)]
    pub video_angles: Option<VideoAngles>,
    #[serde(default)]
    pub lang: Option<String>, // "it" or "en"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetWindow {
    pub min: f64,
    pub max: f64,
    pub optimal: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisciplineTargets {
    pub name: String,
    pub knee_bdc: TargetWindow,
    pub torso: TargetWindow,
    pub shoulder: TargetWindow,
    pub elbow: TargetWindow,
    pub hip_tdc: TargetWindow,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticIssue {
    pub area: String,
    pub priority: String, // "alta" / "high", "media" / "medium", "bassa" / "low"
    pub title: String,
    pub details: String,
    pub recommendation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionStep {
    pub priority: String,
    pub step_order: u32,
    pub category: String,
    pub action: String,
    pub current: String,
    pub target: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FitAnalysisResult {
    pub discipline: String,
    pub discipline_name: String,
    pub targets: DisciplineTargets,
    pub issues: Vec<DiagnosticIssue>,
    pub action_plan: Vec<ActionStep>,
    pub score: u32,
    pub total_issues: usize,
    pub high_priority_count: usize,
    pub medium_priority_count: usize,
    pub low_priority_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StaticBenchmarkInput {
    pub cavallo: f64,
    pub altezza: f64,
    pub pedivelle: f64,
    pub h_sella: f64,
    #[serde(default)]
    pub busto: Option<f64>,
    #[serde(default)]
    pub braccio: Option<f64>,
    #[serde(default)]
    pub lang: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StaticBenchmarkResult {
    pub cavallo: f64,
    pub lemond_h: f64,
    pub hamley_h: f64,
    pub min_recommended_h: f64,
    pub max_recommended_h: f64,
    pub current_h: f64,
    pub delta_lemond: f64,
    pub delta_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CockpitSetupInput {
    pub head_tube_angle: f64,
    pub spacers: f64,
    pub stem_length: f64,
    pub stem_angle: f64,
    pub bar_reach: f64,
    pub bar_drop: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CockpitSolveRequest {
    pub current: CockpitSetupInput,
    pub proposed: CockpitSetupInput,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CockpitVectorResult {
    pub clamp_reach: f64,
    pub clamp_stack: f64,
    pub hood_reach: f64,
    pub hood_stack: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CockpitSolution {
    pub current: CockpitVectorResult,
    pub proposed: CockpitVectorResult,
    pub delta_clamp_reach: f64,
    pub delta_clamp_stack: f64,
    pub delta_hood_reach: f64,
    pub delta_hood_stack: f64,
}
