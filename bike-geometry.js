/**
 * BIKE FIT GEOMETRY & STATIC SIZING CALCULATOR
 * Static Fit Formulas (LeMond, Hamley 109%, Holmes, Reach/Drop)
 * Cockpit Trigonometric Vector Solver & 2D Geometry Simulator
 */

const BikeGeometry = {
  /**
   * Calculate static fit benchmarks from body measurements
   * @param {Object} body - { cavallo, altezza, femore, braccio, busto, pedivelle, h_sella, flessibilita }
   * @returns {Object} benchmarks and comparisons
   */
  calculateStaticBenchmarks(body) {
    const cavallo = parseFloat(body.cavallo) || 0; // in mm
    const altezza = parseFloat(body.altezza) || 0; // in cm
    const pedivella = parseFloat(body.pedivelle) || 170; // in mm
    const hSellaAttuale = parseFloat(body.h_sella) || 0; // in mm
    const busto = parseFloat(body.busto) || (altezza ? (altezza * 10 - cavallo) * 0.6 : 0);
    const braccio = parseFloat(body.braccio) || (altezza ? altezza * 3.8 : 0);

    if (!cavallo) {
      return null;
    }

    // 1. Greg LeMond Method (0.883 * Cavallo)
    const lemondH = Math.round(cavallo * 0.883);

    // 2. Hamley 109% Method (Cavallo * 1.09 - Pedivella)
    const hamleyH = Math.round(cavallo * 1.09 - pedivella);

    // 3. Recommended Saddle Height Range (Average of LeMond & Hamley ± 5mm)
    const avgH = Math.round((lemondH + hamleyH) / 2);
    const minRecommendedH = avgH - 6;
    const maxRecommendedH = avgH + 6;

    // 4. Holmes Dynamic Target (140° - 145° knee extension at BDC)
    const holmesTarget = "140° - 145° (35° - 40° flessione)";

    // 5. Estimated Cockpit Reach (Saddle nose to bar center)
    // Formula: (Torso + Arm) * factor based on riding discipline
    let estReach = 0;
    if (busto && braccio) {
      estReach = Math.round((busto + braccio) * 0.44);
    }

    // 6. Estimated Saddle-to-Handlebar Drop (Dislivello) based on height/cavallo & flexibility
    let estDropMin = 30;
    let estDropMax = 60;
    if (cavallo > 800) {
      estDropMin = 50;
      estDropMax = 90;
    } else if (cavallo > 750) {
      estDropMin = 40;
      estDropMax = 75;
    }

    // Delta with current saddle height
    let deltaLemond = null;
    let deltaHamley = null;
    let deltaStatus = "Non compilata";
    if (hSellaAttuale > 0) {
      deltaLemond = Math.round(hSellaAttuale - lemondH);
      deltaHamley = Math.round(hSellaAttuale - hamleyH);
      if (hSellaAttuale >= minRecommendedH && hSellaAttuale <= maxRecommendedH) {
        deltaStatus = "Nel range teorico ottimale";
      } else if (hSellaAttuale < minRecommendedH) {
        deltaStatus = `Sella più bassa di ${minRecommendedH - hSellaAttuale} mm rispetto al range`;
      } else {
        deltaStatus = `Sella più alta di ${hSellaAttuale - maxRecommendedH} mm rispetto al range`;
      }
    }

    return {
      cavallo,
      pedivella,
      hSellaAttuale,
      lemondH,
      hamleyH,
      avgH,
      minRecommendedH,
      maxRecommendedH,
      holmesTarget,
      estReach,
      estDropMin,
      estDropMax,
      deltaLemond,
      deltaHamley,
      deltaStatus
    };
  },

  /**
   * Solve Cockpit Trigonometric Vector Geometry
   * @param {Object} current - { headTubeAngle, spacers, stemLength, stemAngle, barReach, barDrop }
   * @param {Object} proposed - { headTubeAngle, spacers, stemLength, stemAngle, barReach, barDrop }
   * @returns {Object} { currentPos, proposedPos, deltaX, deltaY, angleDeg }
   */
  solveCockpit(current, proposed) {
    const calcPos = (setup) => {
      const htAngle = (parseFloat(setup.headTubeAngle) || 73) * Math.PI / 180;
      const spacers = parseFloat(setup.spacers) || 0;
      const stemLen = parseFloat(setup.stemLength) || 100;
      const stemAngDeg = parseFloat(setup.stemAngle) || -6;
      const stemAng = stemAngDeg * Math.PI / 180;
      const barReach = parseFloat(setup.barReach) || 0;
      const barDrop = parseFloat(setup.barDrop) || 0;

      // 1. Headtube top is reference origin (0, 0)
      // Steerer vector from origin along steerer axis (angle = htAngle)
      // Steerer moves UP along htAngle: dx = -spacers * cos(htAngle), dy = spacers * sin(htAngle)
      const steererDx = -spacers * Math.cos(htAngle);
      const steererDy = spacers * Math.sin(htAngle);

      // 2. Stem vector:
      // Stem angle is specified relative to perpendicular of steerer.
      // Perpendicular to steerer is (htAngle - 90 deg).
      // Total stem angle relative to ground: theta = htAngle - (90 deg - stemAngle) = htAngle - 90 + stemAngle
      const thetaStem = htAngle - (Math.PI / 2) + stemAng;

      const stemDx = stemLen * Math.cos(thetaStem);
      const stemDy = stemLen * Math.sin(thetaStem);

      // Handlebar clamp center coordinates
      const clampX = steererDx + stemDx;
      const clampY = steererDy + stemDy;

      // Hoods / Hand position coordinates
      const hoodsX = clampX + barReach;
      const hoodsY = clampY - (barDrop * 0.4); // Hoods typically drop slightly below clamp

      // Drops position coordinates
      const dropsX = clampX + (barReach * 0.9);
      const dropsY = clampY - barDrop;

      return {
        steererDx,
        steererDy,
        clampX,
        clampY,
        hoodsX,
        hoodsY,
        dropsX,
        dropsY,
        thetaStemDeg: Math.round(thetaStem * 180 / Math.PI * 10) / 10
      };
    };

    const cur = calcPos(current);
    const prop = calcPos(proposed);

    const deltaClampReach = Math.round((prop.clampX - cur.clampX) * 10) / 10;
    const deltaClampStack = Math.round((prop.clampY - cur.clampY) * 10) / 10;
    const deltaHoodsReach = Math.round((prop.hoodsX - cur.hoodsX) * 10) / 10;
    const deltaHoodsStack = Math.round((prop.hoodsY - cur.hoodsY) * 10) / 10;

    return {
      current: cur,
      proposed: prop,
      deltaClampReach,
      deltaClampStack,
      deltaHoodsReach,
      deltaHoodsStack
    };
  },

  /**
   * Generate Interactive SVG visualization of Current vs Proposed Cockpit
   * @param {Object} solution - result of solveCockpit
   * @returns {string} SVG HTML string
   */
  renderCockpitSVG(solution) {
    const { current, proposed, deltaClampReach, deltaClampStack } = solution;

    // SVG coordinates setup
    const viewBoxW = 540;
    const viewBoxH = 340;
    const originX = 140;
    const originY = 250;
    const scale = 1.3; // 1mm = 1.3px

    // Transform bike coordinate to SVG pixel coordinate
    const toSvg = (dx, dy) => ({
      x: originX + dx * scale,
      y: originY - dy * scale // Invert Y for screen
    });

    const o = { x: originX, y: originY };
    const curClamp = toSvg(current.clampX, current.clampY);
    const propClamp = toSvg(proposed.clampX, proposed.clampY);
    const curSteererTop = toSvg(current.steererDx, current.steererDy);
    const propSteererTop = toSvg(proposed.steererDx, proposed.steererDy);

    const curHoods = toSvg(current.hoodsX, current.hoodsY);
    const propHoods = toSvg(proposed.hoodsX, proposed.hoodsY);

    const reachLabel = deltaClampReach >= 0 ? `+${deltaClampReach} mm` : `${deltaClampReach} mm`;
    const stackLabel = deltaClampStack >= 0 ? `+${deltaClampStack} mm (più alto)` : `${deltaClampStack} mm (più basso)`;

    return `<svg viewBox="0 0 ${viewBoxW} ${viewBoxH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0F172A; border-radius:6px;">
      <!-- Grid Lines -->
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      <!-- Head Tube Reference (Grey) -->
      <path d="M ${o.x - 30} ${o.y + 70} L ${o.x} ${o.y}" stroke="#475569" stroke-width="12" stroke-linecap="round"/>
      <text x="${o.x - 45}" y="${o.y + 40}" fill="#94A3B8" font-family="monospace" font-size="10">TUBO STERZO</text>

      <!-- ================= CURRENT SETUP (Ghost Grey) ================= -->
      <!-- Current Spacers -->
      <line x1="${o.x}" y1="${o.y}" x2="${curSteererTop.x}" y2="${curSteererTop.y}" stroke="#64748B" stroke-width="8" stroke-linecap="butt"/>
      <!-- Current Stem -->
      <line x1="${curSteererTop.x}" y1="${curSteererTop.y}" x2="${curClamp.x}" y2="${curClamp.y}" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
      <!-- Current Handlebar / Hoods -->
      <path d="M ${curClamp.x} ${curClamp.y} Q ${curClamp.x + 20} ${curClamp.y - 15} ${curHoods.x} ${curHoods.y}" fill="none" stroke="#64748B" stroke-width="3" stroke-dasharray="3 3"/>
      <circle cx="${curClamp.x}" cy="${curClamp.y}" r="6" fill="#475569" stroke="#64748B" stroke-width="2"/>
      <text x="${curClamp.x - 10}" y="${curClamp.y - 12}" fill="#94A3B8" font-family="monospace" font-size="9" text-anchor="end">ATTUALE</text>

      <!-- ================= PROPOSED SETUP (Bright Cyan / Yellow) ================= -->
      <!-- Proposed Spacers -->
      <line x1="${o.x}" y1="${o.y}" x2="${propSteererTop.x}" y2="${propSteererTop.y}" stroke="#F59E0B" stroke-width="8" stroke-linecap="butt"/>
      <!-- Proposed Stem -->
      <line x1="${propSteererTop.x}" y1="${propSteererTop.y}" x2="${propClamp.x}" y2="${propClamp.y}" stroke="#00D4FF" stroke-width="6" stroke-linecap="round"/>
      <!-- Proposed Handlebar / Hoods -->
      <path d="M ${propClamp.x} ${propClamp.y} Q ${propClamp.x + 20} ${propClamp.y - 15} ${propHoods.x} ${propHoods.y}" fill="none" stroke="#00D4FF" stroke-width="3.5"/>
      <circle cx="${propClamp.x}" cy="${propClamp.y}" r="7" fill="#00D4FF" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="${propHoods.x}" cy="${propHoods.y}" r="4" fill="#F59E0B"/>
      <text x="${propClamp.x + 12}" y="${propClamp.y - 12}" fill="#00D4FF" font-family="monospace" font-weight="bold" font-size="10">PROPOSTO</text>

      <!-- Delta Vectors & Dimension Lines -->
      <g stroke="#F59E0B" stroke-width="1.2" stroke-dasharray="2 2">
        <!-- Horizontal Delta line -->
        <line x1="${curClamp.x}" y1="${curClamp.y}" x2="${propClamp.x}" y2="${curClamp.y}"/>
        <!-- Vertical Delta line -->
        <line x1="${propClamp.x}" y1="${curClamp.y}" x2="${propClamp.x}" y2="${propClamp.y}"/>
      </g>

      <!-- Delta Summary Overlay Card -->
      <rect x="20" y="20" width="220" height="74" rx="5" fill="rgba(15, 23, 42, 0.88)" stroke="#334155" stroke-width="1"/>
      <text x="32" y="40" fill="#94A3B8" font-family="monospace" font-size="10" font-weight="bold">VARIAZIONE COCKPIT:</text>
      <text x="32" y="58" fill="${deltaClampReach >= 0 ? '#38BDF8' : '#F59E0B'}" font-family="monospace" font-size="12" font-weight="bold">Δ Reach: ${reachLabel}</text>
      <text x="32" y="76" fill="${deltaClampStack >= 0 ? '#34D399' : '#F87171'}" font-family="monospace" font-size="12" font-weight="bold">Δ Stack / Drop: ${stackLabel}</text>
    </svg>`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BikeGeometry };
}
