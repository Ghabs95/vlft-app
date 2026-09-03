/**
 * BIKE FIT PRO - UNIVERSAL BIOMECHANICAL EXPERT DIAGNOSTIC ENGINE
 * Purely deterministic, unbiased multi-discipline fit solver with full i18n support.
 * Applies international clinical biomechanics standards (Pruitt, Retül, Holmes, Burt, Hogg).
 */

const DiagnosticEngine = {
  DISCIPLINE_TARGETS: {
    "Strada": {
      name: "Strada / Road (Endurance & Performance)",
      kneeBDC: { min: 140, max: 146, optimal: 143 },
      torso: { min: 38, max: 48, optimal: 43 },
      shoulder: { min: 80, max: 92, optimal: 86 },
      elbow: { min: 150, max: 165, optimal: 157 },
      hipTDC: { min: 45, max: 60, optimal: 50 }
    },
    "Gravel": {
      name: "Gravel / All-Road",
      kneeBDC: { min: 138, max: 145, optimal: 142 },
      torso: { min: 42, max: 52, optimal: 47 },
      shoulder: { min: 75, max: 88, optimal: 82 },
      elbow: { min: 150, max: 165, optimal: 158 },
      hipTDC: { min: 48, max: 62, optimal: 53 }
    },
    "MTB cross country": {
      name: "MTB Cross Country (XC)",
      kneeBDC: { min: 138, max: 144, optimal: 141 },
      torso: { min: 44, max: 55, optimal: 49 },
      shoulder: { min: 70, max: 85, optimal: 78 },
      elbow: { min: 145, max: 162, optimal: 155 },
      hipTDC: { min: 50, max: 65, optimal: 55 }
    },
    "MTB trail o enduro": {
      name: "MTB Trail / Enduro",
      kneeBDC: { min: 135, max: 142, optimal: 139 },
      torso: { min: 50, max: 65, optimal: 58 },
      shoulder: { min: 65, max: 80, optimal: 72 },
      elbow: { min: 140, max: 160, optimal: 150 },
      hipTDC: { min: 52, max: 70, optimal: 58 }
    },
    "Crono o triathlon": {
      name: "Crono / Triathlon (Aero Bars)",
      kneeBDC: { min: 142, max: 148, optimal: 145 },
      torso: { min: 15, max: 30, optimal: 22 },
      shoulder: { min: 85, max: 95, optimal: 90 },
      elbow: { min: 85, max: 100, optimal: 90 },
      hipTDC: { min: 38, max: 50, optimal: 44 }
    },
    "Ciclocross": {
      name: "Ciclocross (CX)",
      kneeBDC: { min: 138, max: 144, optimal: 141 },
      torso: { min: 42, max: 52, optimal: 47 },
      shoulder: { min: 75, max: 88, optimal: 82 },
      elbow: { min: 148, max: 162, optimal: 155 },
      hipTDC: { min: 48, max: 62, optimal: 53 }
    },
    "Urbano o cicloturismo": {
      name: "Cicloturismo / Urbano / Trekking",
      kneeBDC: { min: 135, max: 142, optimal: 138 },
      torso: { min: 55, max: 75, optimal: 65 },
      shoulder: { min: 65, max: 80, optimal: 72 },
      elbow: { min: 155, max: 170, optimal: 162 },
      hipTDC: { min: 55, max: 75, optimal: 62 }
    }
  },

  analyzeFit(state) {
    const isEn = typeof I18N !== 'undefined' && I18N.currentLang === "en";
    const v = state.v || {};
    const sx = state.sx || {};
    const va = state.videoAngles || {};

    const discMap = {
      "Road": "Strada",
      "Gravel": "Gravel",
      "MTB Cross Country": "MTB cross country",
      "MTB Trail / Enduro": "MTB trail o enduro",
      "Cyclocross": "Ciclocross",
      "TT / Triathlon": "Crono o triathlon",
      "Urban / Touring": "Urbano o cicloturismo"
    };
    const disciplineKey = discMap[v.disciplina] || v.disciplina || "Strada";
    const targets = this.DISCIPLINE_TARGETS[disciplineKey] || this.DISCIPLINE_TARGETS["Strada"];

    const issues = [];
    const actionPlan = [];

    const cavallo = parseFloat(v.cavallo) || 0;
    const altezza = parseFloat(v.altezza) || 0;
    const ischiMm = parseFloat(v.ischi_mm) || 0;
    const hSella = parseFloat(v.h_sella) || 0;
    const inclSella = v.incl_sella !== undefined && v.incl_sella !== "" ? parseFloat(v.incl_sella) : null;
    const sellaLarg = parseFloat(v.sella_larg) || 0;
    const attaccoLun = parseFloat(v.attacco_lun) || 0;
    const pedivelle = parseFloat(v.pedivelle) || 170;

    const kneeBDC = parseFloat(va.kneeBDC) || 0;
    const torsoAng = parseFloat(va.torso) || 0;
    const shoulderAng = parseFloat(va.shoulder) || 0;
    const elbowAng = parseFloat(va.elbow) || 0;
    const hipTDCAng = parseFloat(va.hipTDC) || 0;
    const frontalDev = parseFloat(va.rightKneeDeviation) || 0;
    const frontalStatus = va.frontalValgusVarus || "Neutro";

    const hasSx = (zoneId) => {
      const s = sx[zoneId];
      return s && s.p && s.p !== "No" && s.p !== "";
    };

    // 1. SADDLE HEIGHT
    const ginAnt = hasSx("gin_ant");
    const ginPost = hasSx("gin_post");
    const lombare = hasSx("lombare");

    if (kneeBDC > 0) {
      if (kneeBDC < targets.kneeBDC.min) {
        const deltaDeg = targets.kneeBDC.optimal - kneeBDC;
        const mmAdj = Math.round(deltaDeg * 1.25);
        const safeAdj = Math.max(4, Math.min(25, mmAdj));
        
        issues.push({
          area: isEn ? "Saddle Height (Dynamic)" : "Altezza Sella (Dinamica)",
          priority: ginAnt ? "alta" : "media",
          title: isEn ? `Under-extension at BDC (${kneeBDC}° vs Target ${targets.kneeBDC.min}°-${targets.kneeBDC.max}°)` : `Estensione ginocchio ridotta al BDC (${kneeBDC}° vs Target ${targets.kneeBDC.min}°-${targets.kneeBDC.max}°)`,
          details: isEn ? `Knee is over-flexed at 6 o'clock (${kneeBDC}°), increasing patellofemoral knee joint compression and quadriceps fatigue.` : `Al punto morto inferiore (6 o'clock) il ginocchio è troppo flesso (${kneeBDC}°). Questo genera un picco di pressione patellofemorale sulla rotula e affaticamento precoce dei quadricipiti.`,
          recommendation: isEn ? `Raise saddle by +${safeAdj} mm along the seat tube.` : `Alzare la sella di +${safeAdj} mm lungo l'asse del piantone.`
        });

        actionPlan.push({
          priority: ginAnt ? "alta" : "media",
          stepOrder: 2,
          category: isEn ? "Saddle Height" : "Altezza Sella",
          action: isEn ? `Raise saddle by +${safeAdj} mm` : `Alzare la sella di +${safeAdj} mm`,
          current: `${hSella ? hSella + " mm" : (isEn ? "Current" : "Attuale")} (${kneeBDC}° BDC)`,
          target: `${hSella ? (hSella + safeAdj) + " mm" : "Target"} (~${targets.kneeBDC.optimal}° BDC)`,
          reason: isEn ? "Restores optimal knee extension and relieves patellar tendon pressure." : "Raggiunge l'estensione articolare ottimale riducendo il carico sulla rotula."
        });
      } else if (kneeBDC > targets.kneeBDC.max) {
        const deltaDeg = kneeBDC - targets.kneeBDC.optimal;
        const mmAdj = Math.round(deltaDeg * 1.25);
        const safeAdj = Math.max(4, Math.min(25, mmAdj));

        issues.push({
          area: isEn ? "Saddle Height (Dynamic)" : "Altezza Sella (Dinamica)",
          priority: (ginPost || lombare) ? "alta" : "media",
          title: isEn ? `Knee Hyperextension at BDC (${kneeBDC}° vs Target ${targets.kneeBDC.min}°-${targets.kneeBDC.max}°)` : `Iperestensione del ginocchio al BDC (${kneeBDC}° vs Target ${targets.kneeBDC.min}°-${targets.kneeBDC.max}°)`,
          details: isEn ? `Knee is locked / overextended (${kneeBDC}°), causing hamstring strain and rocking pelvis.` : `Il ginocchio si estende eccessivamente a ${kneeBDC}°. Questo stira i tendini posteriori del cavo popliteo e costringe il bacino a basculare lateralmente.`,
          recommendation: isEn ? `Lower saddle by -${safeAdj} mm.` : `Abbassare la sella di -${safeAdj} mm.`
        });

        actionPlan.push({
          priority: (ginPost || lombare) ? "alta" : "media",
          stepOrder: 2,
          category: isEn ? "Saddle Height" : "Altezza Sella",
          action: isEn ? `Lower saddle by -${safeAdj} mm` : `Abbassare la sella di -${safeAdj} mm`,
          current: `${hSella ? hSella + " mm" : (isEn ? "Current" : "Attuale")} (${kneeBDC}° BDC)`,
          target: `${hSella ? (hSella - safeAdj) + " mm" : "Target"} (~${targets.kneeBDC.optimal}° BDC)`,
          reason: isEn ? "Stabilizes pelvis and removes posterior knee / hamstring strain." : "Stabilizza il bacino ed elimina il sovraccarico tendineo posteriore."
        });
      }
    } else if (cavallo > 0 && hSella > 0) {
      const lemond = Math.round(cavallo * 0.883);
      if (Math.abs(hSella - lemond) > 25) {
        issues.push({
          area: isEn ? "Saddle Height (Static)" : "Altezza Sella (Statica)",
          priority: "media",
          title: isEn ? `Saddle height deviates from LeMond baseline (${hSella} mm vs ${lemond} mm)` : `Scostamento significativo dal riferimento teorico LeMond (${hSella} mm vs ${lemond} mm)`,
          details: isEn ? `Current saddle differs from theoretical baseline by ${hSella - lemond} mm.` : `La sella attuale differisce dal riferimento teorico di ${hSella - lemond} mm.`,
          recommendation: isEn ? "Record a side video to verify dynamic knee extension." : "Registrare un video laterale per verificare l'effettiva estensione dinamica."
        });
      }
    }

    // 2. SADDLE WIDTH & TILT
    const sellaSx = hasSx("sella");
    if (ischiMm > 0 && sellaLarg > 0) {
      let requiredMargin = 20;
      if (disciplineKey.includes("Urbano")) requiredMargin = 28;
      else if (disciplineKey.includes("Crono")) requiredMargin = 12;

      const minWidth = ischiMm + 15;
      const recWidth = ischiMm + requiredMargin;

      if (sellaLarg < minWidth) {
        issues.push({
          area: isEn ? "Saddle Width & Pelvic Support" : "Larghezza Sella & Appoggio Bacino",
          priority: "alta",
          title: isEn ? `Saddle too narrow for sit bones (${sellaLarg} mm vs ${ischiMm} mm sit bones)` : `Sella troppo stretta per la distanza ischiatica (${sellaLarg} mm vs ${ischiMm} mm ischi)`,
          details: isEn ? `Sit bones (${ischiMm} mm) fall off the wings of a ${sellaLarg} mm saddle, causing body weight to collapse onto the soft perineal tissue, compressing the pudendal nerve.` : `Le ossa ischiatiche (${ischiMm} mm) scivolano all'esterno su una sella da ${sellaLarg} mm, facendo collassare il peso corporeo sui tessuti molli perineali e comprimendo l'arteria e il nervo pudendo.`,
          recommendation: isEn ? `Switch to a ${recWidth} - ${recWidth + 5} mm ergonomic saddle with central relief cut-out.` : `Adottare una sella di larghezza ${recWidth} - ${recWidth + 5} mm dotata di canale di scarico centrale anatomico (cut-out).`
        });

        actionPlan.push({
          priority: "alta",
          stepOrder: 1,
          category: isEn ? "Saddle" : "Sella",
          action: isEn ? `Switch to a ${recWidth}–${recWidth + 5} mm saddle with center relief cut-out` : `Sostituire la sella con un modello largo ${recWidth}–${recWidth + 5} mm con foro centrale`,
          current: `${sellaLarg} mm (${v.sella_mod || (isEn ? "Current" : "Attuale")})`,
          target: `${recWidth} mm ${isEn ? "with center relief" : "con scarico centrale"}`,
          reason: isEn ? "Ensures skeletal support on sit bones and eliminates numbness in the perineal nerve." : "Garantisce il sostegno scheletrico sugli ischi ed elimina la compressione perineale."
        });
      }
    } else if (sellaSx) {
      issues.push({
        area: isEn ? "Saddle & Perineum" : "Sella & Perineo",
        priority: "alta",
        title: isEn ? "Perineal pressure or genital numbness reported" : "Pressione perineale o intorpidimento ai genitali segnalato",
        details: isEn ? "Numbness indicates pudendal nerve compression due to improper width or tilt." : "La perdita di sensibilità indica una compressione del nervo pudendo dovuta a larghezza sella non idonea o inclinazione errata.",
        recommendation: isEn ? "Measure sit bones (section 06), choose a cut-out saddle, and tilt nose -1° to -2° down." : "Misurare la distanza ischiatica (sezione 06), scegliere una sella forata e inclinare la punta di -1°/-2° in basso."
      });
    }

    // Saddle Tilt
    if (inclSella !== null) {
      if (inclSella > 0.5) {
        issues.push({
          area: isEn ? "Saddle Tilt" : "Inclinazione Sella",
          priority: "alta",
          title: isEn ? `Nose tilted upward (+${inclSella}°)` : `Punta sella rialzata verso l'alto (+${inclSella}°)`,
          details: isEn ? `Upward tilt creates direct pubic bone contact and soft tissue compression when bending forward.` : `Una sella con punta verso l'alto esercita una pressione diretta sul pube e sulle parti molli.`,
          recommendation: isEn ? `Tilt saddle nose down to -1° / -2°.` : `Inclinare la punta della sella verso il basso portandola a -1° o -2°.`
        });

        actionPlan.push({
          priority: "alta",
          stepOrder: 1,
          category: isEn ? "Saddle" : "Sella",
          action: isEn ? `Tilt saddle nose down to -1° / -2°` : `Inclinare la punta sella a -1° / -2°`,
          current: `+${inclSella}°`,
          target: `-1.5°`,
          reason: isEn ? "Allows healthy anterior pelvic tilt without soft tissue pubic compression." : "Consente la rotazione fisiologica del bacino senza impatto sui tessuti molli anteriori."
        });
      }
    }

    // 3. COCKPIT REACH & ARMS
    const maniSx = hasSx("mani");
    if (elbowAng > 0 && elbowAng > targets.elbow.max) {
      const deltaReach = Math.min(35, Math.max(10, Math.round((elbowAng - targets.elbow.optimal) * 1.5)));
      const targetStem = attaccoLun > 0 ? Math.max(70, attaccoLun - deltaReach) : 90;

      issues.push({
        area: isEn ? "Cockpit Reach & Arm Extension" : "Cockpit & Distensione Braccia",
        priority: maniSx ? "alta" : "media",
        title: isEn ? `Locked straight arms / Over-reach (Elbow at ${elbowAng}° vs Target ${targets.elbow.min}°-${targets.elbow.max}°)` : `Braccia iperestese / Cockpit troppo lungo (Gomito a ${elbowAng}° vs Target ${targets.elbow.min}°-${targets.elbow.max}°)`,
        details: isEn ? `Locked arms act as rigid struts transmitting road vibration straight into the ulnar/median wrist nerves.` : `I gomiti sono bloccati in estensione (${elbowAng}°). Le braccia trasmettono tutti gli urti ai polsi, comprimendo il nervo ulnare/mediano.`,
        recommendation: isEn ? `Shorten stem by -${deltaReach} mm or add steerer spacers.` : `Accorciare l'attacco manubrio di -${deltaReach} mm o aumentare gli spessori.`
      });

      actionPlan.push({
        priority: "alta",
        stepOrder: 3,
        category: isEn ? "Cockpit" : "Cockpit",
        action: isEn ? `Shorten stem by -${deltaReach} mm (or raise stack)` : `Accorciare attacco manubrio di -${deltaReach} mm (oppure aggiungere spessori)`,
        current: `${attaccoLun ? attaccoLun + " mm" : (isEn ? "Current" : "Attuale")} (${elbowAng}° ${isEn ? "elbow" : "gomito"})`,
        target: `${attaccoLun ? targetStem + " mm" : "Target"} (~${targets.elbow.optimal}° ${isEn ? "elbow bend" : "gomito"})`,
        reason: isEn ? "Allows soft elbow bend to absorb road shock and take weight off hands." : "Permette una leggera flessione dei gomiti che ammortizza le vibrazioni e toglie peso dalle mani."
      });
    } else if (maniSx) {
      issues.push({
        area: isEn ? "Cockpit & Hands" : "Cockpit & Manubrio",
        priority: "alta",
        title: isEn ? "Hand / finger numbness reported" : "Intorpidimento a mani e dita segnalato",
        details: isEn ? "Excessive weight bearing on handlebars compressing ulnar / median nerves." : "Eccessivo sovraccarico ponderale sul manubrio con compressione nervosa.",
        recommendation: isEn ? "Shorten reach by 10-20 mm or raise handlebars with 10 mm spacers." : "Accorciare il reach di 10-20 mm o alzare il manubrio con 10 mm di spessori."
      });
    }

    // 4. FEET & CLEATS
    const piediSx = hasSx("piedi");
    if (piediSx) {
      issues.push({
        area: isEn ? "Feet & Cleats" : "Piedi & Tacchette",
        priority: "media",
        title: isEn ? "Foot numbness / burning hot spots" : "Intorpidimento ai piedi / Bruciore alla pianta (Hot-spots)",
        details: isEn ? "Metatarsal nerve compression from cleats placed too far forward under toes or tight shoe closure." : "Compressione dei nervi metatarsali da tacchette troppo avanzate sotto le dita o scarpa troppo stretta.",
        recommendation: isEn ? "Slide cleats rearward 5-8 mm towards heel and loosen midfoot dial." : "Arretrare le tacchette di 5-8 mm verso il tallone e allentare la chiusura sul mesopiede."
      });

      actionPlan.push({
        priority: "media",
        stepOrder: 4,
        category: isEn ? "Cleats" : "Tacchette",
        action: isEn ? "Slide cleats rearward by 5-8 mm towards heel" : "Arretrare le tacchette di 5-8 mm verso il tallone",
        current: isEn ? "Forward position" : "Posizione avanzata",
        target: isEn ? "Rearward setback" : "Tacchetta arretrata",
        reason: isEn ? "Relieves forefoot pressure and reduces Achilles / calf tendon tension." : "Scarica la pressione dai metatarsi e riduce la tensione sui polpacci e sul tendine d'Achille."
      });
    }

    // 5. HIP IMPINGEMENT
    if (hipTDCAng > 0 && hipTDCAng < targets.hipTDC.min) {
      const recCrank = Math.max(160, pedivelle - 5);
      issues.push({
        area: isEn ? "Cranks & Hip Angle at TDC" : "Pedivelle & Angolo Anca al TDC",
        priority: "media",
        title: isEn ? `Pinched hip angle at TDC (${hipTDCAng}° < ${targets.hipTDC.min}°)` : `Angolo anca chiuso a ${hipTDCAng}° al TDC (< ${targets.hipTDC.min}°)`,
        details: isEn ? `Thigh rises too high at 12 o'clock, causing femoroacetabular impingement and restricted breathing.` : `Al punto morto superiore la coscia sale troppo verso il busto, comprimendo l'articolazione dell'anca.`,
        recommendation: isEn ? `Downsize to shorter cranks (${pedivelle} mm → ${recCrank} mm) or raise handlebars.` : `Passare a pedivelle più corte (${pedivelle} mm → ${recCrank} mm) o alzare il manubrio.`
      });

      actionPlan.push({
        priority: "bassa",
        stepOrder: 5,
        category: isEn ? "Cranks" : "Pedivelle",
        action: isEn ? `Consider shorter cranks (${recCrank} mm) or raise handlebar` : `Valutare pedivelle da ${recCrank} mm (-5 mm) o alzare il manubrio`,
        current: `${pedivelle} mm (${hipTDCAng}° TDC)`,
        target: `${recCrank} mm (> ${targets.hipTDC.min}° TDC)`,
        reason: isEn ? "Opens hip angle at 12 o'clock and frees diaphragm breathing." : "Apre l'angolo dell'anca al punto morto superiore, sbloccando la respirazione diaframmatica."
      });
    }

    let score = 100;
    issues.forEach(iss => {
      if (iss.priority === "alta") score -= 22;
      else if (iss.priority === "media") score -= 12;
      else score -= 6;
    });
    score = Math.max(20, Math.min(100, score));

    actionPlan.sort((a, b) => {
      if (a.stepOrder !== b.stepOrder) return a.stepOrder - b.stepOrder;
      return a.priority === "alta" ? -1 : 1;
    });

    return {
      discipline: disciplineKey,
      disciplineName: targets.name,
      targets,
      issues,
      actionPlan,
      score,
      totalIssues: issues.length,
      highPriorityCount: issues.filter(i => i.priority === "alta").length,
      mediumPriorityCount: issues.filter(i => i.priority === "media").length
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DiagnosticEngine };
}
