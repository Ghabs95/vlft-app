use crate::models::{
    ActionStep, DiagnosticIssue, DisciplineTargets, FitAnalysisResult, FitStateInput, TargetWindow,
};

pub struct DiagnosticSolver;

impl DiagnosticSolver {
    pub fn get_discipline_targets(discipline: &str) -> DisciplineTargets {
        match discipline {
            "Gravel" => DisciplineTargets {
                name: "Gravel / All-Road".to_string(),
                knee_bdc: TargetWindow { min: 138.0, max: 145.0, optimal: 142.0 },
                torso: TargetWindow { min: 42.0, max: 52.0, optimal: 47.0 },
                shoulder: TargetWindow { min: 75.0, max: 88.0, optimal: 82.0 },
                elbow: TargetWindow { min: 150.0, max: 165.0, optimal: 158.0 },
                hip_tdc: TargetWindow { min: 48.0, max: 62.0, optimal: 53.0 },
            },
            "MTB cross country" => DisciplineTargets {
                name: "MTB Cross Country (XC)".to_string(),
                knee_bdc: TargetWindow { min: 138.0, max: 144.0, optimal: 141.0 },
                torso: TargetWindow { min: 44.0, max: 55.0, optimal: 49.0 },
                shoulder: TargetWindow { min: 70.0, max: 85.0, optimal: 78.0 },
                elbow: TargetWindow { min: 145.0, max: 162.0, optimal: 155.0 },
                hip_tdc: TargetWindow { min: 50.0, max: 65.0, optimal: 55.0 },
            },
            "MTB trail o enduro" => DisciplineTargets {
                name: "MTB Trail / Enduro".to_string(),
                knee_bdc: TargetWindow { min: 135.0, max: 142.0, optimal: 139.0 },
                torso: TargetWindow { min: 50.0, max: 65.0, optimal: 58.0 },
                shoulder: TargetWindow { min: 65.0, max: 80.0, optimal: 72.0 },
                elbow: TargetWindow { min: 140.0, max: 160.0, optimal: 150.0 },
                hip_tdc: TargetWindow { min: 52.0, max: 70.0, optimal: 58.0 },
            },
            "Crono o triathlon" => DisciplineTargets {
                name: "Crono / Triathlon (Aero Bars)".to_string(),
                knee_bdc: TargetWindow { min: 142.0, max: 148.0, optimal: 145.0 },
                torso: TargetWindow { min: 15.0, max: 30.0, optimal: 22.0 },
                shoulder: TargetWindow { min: 85.0, max: 95.0, optimal: 90.0 },
                elbow: TargetWindow { min: 85.0, max: 100.0, optimal: 90.0 },
                hip_tdc: TargetWindow { min: 38.0, max: 50.0, optimal: 44.0 },
            },
            "Urbano o cicloturismo" => DisciplineTargets {
                name: "Cicloturismo / Urbano / Trekking".to_string(),
                knee_bdc: TargetWindow { min: 135.0, max: 142.0, optimal: 138.0 },
                torso: TargetWindow { min: 55.0, max: 75.0, optimal: 65.0 },
                shoulder: TargetWindow { min: 65.0, max: 80.0, optimal: 72.0 },
                elbow: TargetWindow { min: 155.0, max: 170.0, optimal: 162.0 },
                hip_tdc: TargetWindow { min: 55.0, max: 75.0, optimal: 62.0 },
            },
            _ => DisciplineTargets {
                name: "Strada / Road (Endurance & Performance)".to_string(),
                knee_bdc: TargetWindow { min: 140.0, max: 146.0, optimal: 143.0 },
                torso: TargetWindow { min: 38.0, max: 48.0, optimal: 43.0 },
                shoulder: TargetWindow { min: 80.0, max: 92.0, optimal: 86.0 },
                elbow: TargetWindow { min: 150.0, max: 165.0, optimal: 157.0 },
                hip_tdc: TargetWindow { min: 45.0, max: 60.0, optimal: 50.0 },
            },
        }
    }

    pub fn analyze(state: FitStateInput) -> FitAnalysisResult {
        let is_en = state.lang.as_deref().unwrap_or("it") == "en";
        let v = &state.v;
        let sx = &state.sx;
        let va = state.video_angles.unwrap_or_default();

        let disc_key = v.get("disciplina").cloned().unwrap_or_else(|| "Strada".to_string());
        let targets = Self::get_discipline_targets(&disc_key);

        let mut issues = Vec::new();
        let mut action_plan = Vec::new();

        // Numerical parse helpers
        let parse_f64 = |key: &str| -> f64 {
            v.get(key).and_then(|s| s.parse::<f64>().ok()).unwrap_or(0.0)
        };

        let cavallo = parse_f64("cavallo");
        let ischi_mm = parse_f64("ischi_mm");
        let h_sella = parse_f64("h_sella");
        let incl_sella = v.get("incl_sella").and_then(|s| s.parse::<f64>().ok());
        let sella_larg = parse_f64("sella_larg");
        let attacco_lun = parse_f64("attacco_lun");
        let pedivelle = if parse_f64("pedivelle") > 0.0 { parse_f64("pedivelle") } else { 170.0 };

        let has_sx = |zone: &str| -> bool {
            sx.get(zone).map(|s| !s.p.is_empty() && s.p != "No").unwrap_or(false)
        };

        // 1. SADDLE HEIGHT & KNEE EXTENSION AT BDC
        let gin_ant = has_sx("gin_ant");
        let gin_post = has_sx("gin_post");
        let lombare = has_sx("lombare");

        if let Some(knee_bdc) = va.knee_bdc {
            if knee_bdc < targets.knee_bdc.min {
                let delta_deg = targets.knee_bdc.optimal - knee_bdc;
                let mm_adj = ((delta_deg * 1.25).round() as i64).clamp(4, 25);

                issues.push(DiagnosticIssue {
                    area: if is_en { "Saddle Height (Dynamic)".to_string() } else { "Altezza Sella (Dinamica)".to_string() },
                    priority: if gin_ant { "alta".to_string() } else { "media".to_string() },
                    title: if is_en {
                        format!("Under-extension at BDC ({:.1}° vs Target {:.0}°-{:.0}°)", knee_bdc, targets.knee_bdc.min, targets.knee_bdc.max)
                    } else {
                        format!("Estensione ginocchio ridotta al BDC ({:.1}° vs Target {:.0}°-{:.0}°)", knee_bdc, targets.knee_bdc.min, targets.knee_bdc.max)
                    },
                    details: if is_en {
                        format!("Knee is over-flexed at 6 o'clock ({:.1}°), creating excessive patellofemoral compressive force and quadriceps fatigue.", knee_bdc)
                    } else {
                        format!("Al punto morto inferiore (6 o'clock) il ginocchio è troppo flesso ({:.1}°), generando sovraccarico patellofemorale rotuleo.", knee_bdc)
                    },
                    recommendation: if is_en {
                        format!("Raise saddle by +{} mm along the seat tube axis.", mm_adj)
                    } else {
                        format!("Alzare la sella di +{} mm lungo l'asse del piantone.", mm_adj)
                    },
                });

                action_plan.push(ActionStep {
                    priority: if gin_ant { "alta".to_string() } else { "media".to_string() },
                    step_order: 2,
                    category: if is_en { "Saddle Height".to_string() } else { "Altezza Sella".to_string() },
                    action: if is_en { format!("Raise saddle by +{} mm", mm_adj) } else { format!("Alzare la sella di +{} mm", mm_adj) },
                    current: format!("{} mm ({:.1}° BDC)", if h_sella > 0.0 { h_sella.to_string() } else { "Current".to_string() }, knee_bdc),
                    target: format!("{} mm (~{:.0}° BDC)", if h_sella > 0.0 { (h_sella + mm_adj as f64).to_string() } else { "Target".to_string() }, targets.knee_bdc.optimal),
                    reason: if is_en { "Restores optimal knee extension and relieves patellar pressure.".to_string() } else { "Raggiunge l'estensione articolare ottimale riducendo il carico sulla rotula.".to_string() },
                });
            } else if knee_bdc > targets.knee_bdc.max {
                let delta_deg = knee_bdc - targets.knee_bdc.optimal;
                let mm_adj = ((delta_deg * 1.25).round() as i64).clamp(4, 25);

                issues.push(DiagnosticIssue {
                    area: if is_en { "Saddle Height (Dynamic)".to_string() } else { "Altezza Sella (Dinamica)".to_string() },
                    priority: if gin_post || lombare { "alta".to_string() } else { "media".to_string() },
                    title: if is_en {
                        format!("Knee Hyperextension at BDC ({:.1}° vs Target {:.0}°-{:.0}°)", knee_bdc, targets.knee_bdc.min, targets.knee_bdc.max)
                    } else {
                        format!("Iperestensione del ginocchio al BDC ({:.1}° vs Target {:.0}°-{:.0}°)", knee_bdc, targets.knee_bdc.min, targets.knee_bdc.max)
                    },
                    details: if is_en {
                        format!("Knee is over-extended at {:.1}°, straining the posterior hamstrings and causing lateral pelvic rocking.", knee_bdc)
                    } else {
                        format!("Il ginocchio si estende eccessivamente a {:.1}°, stirando i tendini del cavo popliteo e provocando basculamento pelvico.", knee_bdc)
                    },
                    recommendation: if is_en {
                        format!("Lower saddle by -{} mm.", mm_adj)
                    } else {
                        format!("Abbassare la sella di -{} mm.", mm_adj)
                    },
                });

                action_plan.push(ActionStep {
                    priority: if gin_post || lombare { "alta".to_string() } else { "media".to_string() },
                    step_order: 2,
                    category: if is_en { "Saddle Height".to_string() } else { "Altezza Sella".to_string() },
                    action: if is_en { format!("Lower saddle by -{} mm", mm_adj) } else { format!("Abbassare la sella di -{} mm", mm_adj) },
                    current: format!("{} mm ({:.1}° BDC)", if h_sella > 0.0 { h_sella.to_string() } else { "Current".to_string() }, knee_bdc),
                    target: format!("{} mm (~{:.0}° BDC)", if h_sella > 0.0 { (h_sella - mm_adj as f64).to_string() } else { "Target".to_string() }, targets.knee_bdc.optimal),
                    reason: if is_en { "Stabilizes pelvis and eliminates hamstring / popliteal strain.".to_string() } else { "Stabilizza il bacino ed elimina il sovraccarico tendineo posteriore.".to_string() },
                });
            }
        } else if cavallo > 0.0 && h_sella > 0.0 {
            let lemond = (cavallo * 0.883).round();
            if (h_sella - lemond).abs() > 25.0 {
                issues.push(DiagnosticIssue {
                    area: if is_en { "Saddle Height (Static)".to_string() } else { "Altezza Sella (Statica)".to_string() },
                    priority: "media".to_string(),
                    title: if is_en {
                        format!("Saddle height deviates from LeMond baseline ({} mm vs {} mm)", h_sella, lemond)
                    } else {
                        format!("Scostamento dal riferimento teorico LeMond ({} mm vs {} mm)", h_sella, lemond)
                    },
                    details: if is_en {
                        format!("Current saddle height differs by {:.0} mm from anthropometric baseline.", h_sella - lemond)
                    } else {
                        format!("La sella differisce di {:.0} mm rispetto al valore teorico.", h_sella - lemond)
                    },
                    recommendation: if is_en { "Record a video to verify dynamic knee extension at BDC.".to_string() } else { "Registrare un video per verificare l'effettiva estensione dinamica al BDC.".to_string() },
                });
            }
        }

        // 2. SADDLE WIDTH & TILT
        let sella_sx = has_sx("sella");
        if ischi_mm > 0.0 && sella_larg > 0.0 {
            let req_margin = if disc_key.contains("Urbano") { 28.0 } else if disc_key.contains("Crono") { 12.0 } else { 20.0 };
            let min_width = ischi_mm + 15.0;
            let rec_width = (ischi_mm + req_margin).round();

            if sella_larg < min_width {
                issues.push(DiagnosticIssue {
                    area: if is_en { "Saddle Width & Pelvic Support".to_string() } else { "Larghezza Sella & Appoggio Bacino".to_string() },
                    priority: "alta".to_string(),
                    title: if is_en {
                        format!("Saddle too narrow for sit bones ({} mm vs {} mm sit bones)", sella_larg, ischi_mm)
                    } else {
                        format!("Sella troppo stretta per la distanza ischiatica ({} mm vs {} mm ischi)", sella_larg, ischi_mm)
                    },
                    details: if is_en {
                        format!("Sit bones ({} mm) slide off a {} mm saddle, causing body weight to collapse onto soft perineal tissue, compressing the pudendal nerve.", ischi_mm, sella_larg)
                    } else {
                        format!("Le ossa ischiatiche ({} mm) scivolano fuori da una sella da {} mm, comprimendo l'arteria e il nervo pudendo.", ischi_mm, sella_larg)
                    },
                    recommendation: if is_en {
                        format!("Switch to a {}-{} mm ergonomic saddle with center relief cut-out.", rec_width, rec_width + 5.0)
                    } else {
                        format!("Adottare una sella di larghezza {}-{} mm con canale di scarico centrale (cut-out).", rec_width, rec_width + 5.0)
                    },
                });

                action_plan.push(ActionStep {
                    priority: "alta".to_string(),
                    step_order: 1,
                    category: if is_en { "Saddle".to_string() } else { "Sella".to_string() },
                    action: if is_en { format!("Switch to a {}–{} mm saddle with center relief", rec_width, rec_width + 5.0) } else { format!("Sostituire la sella con una da {}–{} mm con foro centrale", rec_width, rec_width + 5.0) },
                    current: format!("{} mm", sella_larg),
                    target: format!("{} mm with cut-out", rec_width),
                    reason: if is_en { "Ensures skeletal support on sit bones and prevents numbness.".to_string() } else { "Garantisce il sostegno scheletrico ed elimina l'intorpidimento perineale.".to_string() },
                });
            }
        } else if sella_sx {
            issues.push(DiagnosticIssue {
                area: if is_en { "Saddle & Perineum".to_string() } else { "Sella & Perineo".to_string() },
                priority: "alta".to_string(),
                title: if is_en { "Perineal numbness or pressure reported".to_string() } else { "Pressione perineale o intorpidimento ai genitali segnalato".to_string() },
                details: if is_en { "Numbness indicates pudendal nerve compression.".to_string() } else { "La perdita di sensibilità indica compressione del nervo pudendo.".to_string() },
                recommendation: if is_en { "Measure sit bones, select an ergonomic cut-out saddle, and tilt nose -1° to -2° down.".to_string() } else { "Misurare la distanza ischiatica, scegliere una sella forata e inclinare la punta di -1°/-2° in basso.".to_string() },
            });
        }

        // Saddle Tilt
        if let Some(tilt) = incl_sella {
            if tilt > 0.5 {
                issues.push(DiagnosticIssue {
                    area: if is_en { "Saddle Tilt".to_string() } else { "Inclinazione Sella".to_string() },
                    priority: "alta".to_string(),
                    title: if is_en { format!("Nose tilted upward (+{:.1}°)", tilt) } else { format!("Punta sella rialzata verso l'alto (+{:.1}°)", tilt) },
                    details: if is_en { "Upward nose tilt creates direct pubic bone contact and soft tissue compression.".to_string() } else { "Una sella con punta verso l'alto esercita pressione diretta sul pube.".to_string() },
                    recommendation: if is_en { "Tilt saddle nose down to -1° / -2°.".to_string() } else { "Inclinare la punta della sella verso il basso portandola a -1° o -2°.".to_string() },
                });

                action_plan.push(ActionStep {
                    priority: "alta".to_string(),
                    step_order: 1,
                    category: if is_en { "Saddle".to_string() } else { "Sella".to_string() },
                    action: if is_en { "Tilt saddle nose down to -1° / -2°".to_string() } else { "Inclinare la punta sella a -1° / -2°".to_string() },
                    current: format!("+{:.1}°", tilt),
                    target: "-1.5°".to_string(),
                    reason: if is_en { "Allows natural anterior pelvic rotation without pubic nerve compression.".to_string() } else { "Consente la rotazione fisiologica del bacino senza impatto sui tessuti molli anteriori.".to_string() },
                });
            }
        }

        // 3. COCKPIT REACH & ARM EXTENSION
        let mani_sx = has_sx("mani");
        if let Some(elbow) = va.elbow {
            if elbow > targets.elbow.max {
                let delta_reach = (((elbow - targets.elbow.optimal) * 1.5).round() as i64).clamp(10, 35);
                let target_stem = if attacco_lun > 0.0 { (attacco_lun as i64 - delta_reach).max(70) } else { 90 };

                issues.push(DiagnosticIssue {
                    area: if is_en { "Cockpit Reach & Arm Extension".to_string() } else { "Cockpit & Distensione Braccia".to_string() },
                    priority: if mani_sx { "alta".to_string() } else { "media".to_string() },
                    title: if is_en {
                        format!("Locked arms / Over-reach (Elbow at {:.1}° vs Target {:.0}°-{:.0}°)", elbow, targets.elbow.min, targets.elbow.max)
                    } else {
                        format!("Braccia iperestese / Cockpit troppo lungo (Gomito a {:.1}° vs Target {:.0}°-{:.0}°)", elbow, targets.elbow.min, targets.elbow.max)
                    },
                    details: if is_en {
                        "Locked elbows act as rigid struts transmitting road vibration straight into the ulnar/median wrist nerves.".to_string()
                    } else {
                        "I gomiti sono bloccati in estensione, trasmettendo tutti gli urti ai polsi e schiacciando il nervo ulnare e mediano.".to_string()
                    },
                    recommendation: if is_en {
                        format!("Shorten stem by -{} mm or add steerer spacers.", delta_reach)
                    } else {
                        format!("Accorciare l'attacco manubrio di -{} mm o aggiungere spessori sotto l'attacco.", delta_reach)
                    },
                });

                action_plan.push(ActionStep {
                    priority: "alta".to_string(),
                    step_order: 3,
                    category: if is_en { "Cockpit".to_string() } else { "Cockpit".to_string() },
                    action: if is_en { format!("Shorten stem by -{} mm (or raise stack)", delta_reach) } else { format!("Accorciare attacco manubrio di -{} mm (oppure aggiungere spessori)", delta_reach) },
                    current: format!("{} mm ({:.1}° elbow)", if attacco_lun > 0.0 { attacco_lun.to_string() } else { "Current".to_string() }, elbow),
                    target: format!("{} mm (~{:.0}° elbow bend)", target_stem, targets.elbow.optimal),
                    reason: if is_en { "Allows soft elbow bend to absorb road shock and take weight off hands.".to_string() } else { "Permette una leggera flessione dei gomiti che ammortizza le vibrazioni e toglie peso dalle mani.".to_string() },
                });
            }
        } else if mani_sx {
            issues.push(DiagnosticIssue {
                area: if is_en { "Cockpit & Hands".to_string() } else { "Cockpit & Manubrio".to_string() },
                priority: "alta".to_string(),
                title: if is_en { "Hand / wrist numbness reported".to_string() } else { "Intorpidimento a mani e dita segnalato".to_string() },
                details: if is_en { "Excessive weight bearing on handlebars compressing ulnar / median nerves.".to_string() } else { "Eccessivo sovraccarico ponderale sul manubrio con compressione nervosa.".to_string() },
                recommendation: if is_en { "Shorten reach by 10-20 mm or raise handlebars with 10 mm spacers.".to_string() } else { "Accorciare il reach di 10-20 mm o alzare il manubrio con 10 mm di spessori.".to_string() },
            });
        }

        // 4. FEET & CLEATS
        let piedi_sx = has_sx("piedi");
        if piedi_sx {
            issues.push(DiagnosticIssue {
                area: if is_en { "Feet & Cleats".to_string() } else { "Piedi & Tacchette".to_string() },
                priority: "media".to_string(),
                title: if is_en { "Foot numbness / burning hot spots".to_string() } else { "Intorpidimento ai piedi / Bruciore alla pianta (Hot-spots)".to_string() },
                details: if is_en { "Metatarsal nerve compression from cleats positioned too far forward.".to_string() } else { "Compressione dei nervi metatarsali da tacchette troppo avanzate sotto le dita.".to_string() },
                recommendation: if is_en { "Slide cleats rearward 5-8 mm towards heel and loosen midfoot dial.".to_string() } else { "Arretrare le tacchette di 5-8 mm verso il tallone e allentare la chiusura sul mesopiede.".to_string() },
            });

            action_plan.push(ActionStep {
                priority: "media".to_string(),
                step_order: 4,
                category: if is_en { "Cleats".to_string() } else { "Tacchette".to_string() },
                action: if is_en { "Slide cleats rearward by 5-8 mm towards heel".to_string() } else { "Arretrare le tacchette di 5-8 mm verso il tallone".to_string() },
                current: if is_en { "Forward position".to_string() } else { "Posizione avanzata".to_string() },
                target: if is_en { "Rearward setback".to_string() } else { "Tacchetta arretrata".to_string() },
                reason: if is_en { "Relieves forefoot pressure and reduces Achilles / calf tendon tension.".to_string() } else { "Scarica la pressione dai metatarsi e riduce la tensione sui polpacci e sul tendine d'Achille.".to_string() },
            });
        }

        // 5. HIP CLOSED ANGLE AT TDC
        if let Some(hip_tdc) = va.hip_tdc {
            if hip_tdc < targets.hip_tdc.min {
                let rec_crank = (pedivelle - 5.0).max(160.0);
                issues.push(DiagnosticIssue {
                    area: if is_en { "Cranks & Hip Angle at TDC".to_string() } else { "Pedivelle & Angolo Anca al TDC".to_string() },
                    priority: "media".to_string(),
                    title: if is_en {
                        format!("Pinched hip angle at TDC ({:.1}° < {:.0}°)", hip_tdc, targets.hip_tdc.min)
                    } else {
                        format!("Angolo anca chiuso a {:.1}° al TDC (< {:.0}°)", hip_tdc, targets.hip_tdc.min)
                    },
                    details: if is_en { "Thigh rises too high at 12 o'clock, compressing hip joint and restricting breathing.".to_string() } else { "Al punto morto superiore la coscia sale troppo verso il busto, comprimendo l'articolazione dell'anca.".to_string() },
                    recommendation: if is_en { format!("Downsize to shorter cranks ({} mm → {} mm) or raise handlebars.", pedivelle, rec_crank) } else { format!("Passare a pedivelle più corte ({} mm → {} mm) o alzare il manubrio.", pedivelle, rec_crank) },
                });

                action_plan.push(ActionStep {
                    priority: "bassa".to_string(),
                    step_order: 5,
                    category: if is_en { "Cranks".to_string() } else { "Pedivelle".to_string() },
                    action: if is_en { format!("Consider shorter cranks ({} mm) or raise handlebar", rec_crank) } else { format!("Valutare pedivelle da {} mm (-5 mm) o alzare il manubrio", rec_crank) },
                    current: format!("{} mm ({:.1}° TDC)", pedivelle, hip_tdc),
                    target: format!("{} mm (> {:.0}° TDC)", rec_crank, targets.hip_tdc.min),
                    reason: if is_en { "Opens hip angle at 12 o'clock and frees diaphragm breathing.".to_string() } else { "Apre l'angolo dell'anca al punto morto superiore, sbloccando la respirazione diaframmatica.".to_string() },
                });
            }
        }

        // Calculate score
        let mut score: i64 = 100;
        for iss in &issues {
            match iss.priority.as_str() {
                "alta" => score -= 22,
                "media" => score -= 12,
                _ => score -= 6,
            }
        }
        let final_score = score.clamp(20, 100) as u32;

        action_plan.sort_by(|a, b| {
            if a.step_order != b.step_order {
                a.step_order.cmp(&b.step_order)
            } else {
                let prio_val = |p: &str| if p == "alta" { 0 } else { 1 };
                prio_val(&a.priority).cmp(&prio_val(&b.priority))
            }
        });

        let total_issues = issues.len();
        let high_priority_count = issues.iter().filter(|i| i.priority == "alta").count();
        let medium_priority_count = issues.iter().filter(|i| i.priority == "media").count();
        let low_priority_count = issues.iter().filter(|i| i.priority == "bassa").count();

        FitAnalysisResult {
            discipline: disc_key,
            discipline_name: targets.name.clone(),
            targets,
            issues,
            action_plan,
            score: final_score,
            total_issues,
            high_priority_count,
            medium_priority_count,
            low_priority_count,
        }
    }
}
