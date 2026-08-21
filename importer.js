/**
 * Markdown and JSON Importer/Exporter for Bike Fit Application
 */

const BikeFitIO = {
  /**
   * Parse a Markdown string (e.g. Bike Position Sheet.md) into the app state format
   * @param {string} mdContent
   * @param {Array} schema - SCHEMA array from app
   * @param {Array} zoneList - ZONE array from app
   * @returns {Object} imported state { mode, v, chk, sx, log }
   */
  parseMarkdown(mdContent, schema, zoneList) {
    const newState = {
      mode: "rapido",
      v: {},
      chk: {},
      sx: {},
      log: []
    };

    if (!mdContent || typeof mdContent !== 'string') return newState;

    const lines = mdContent.split(/\r?\n/);
    let currentSection = null;
    let isTable = false;
    let isSymptomTable = false;
    let isLogTable = false;
    let tableHeaders = [];

    // Map labels to schema field definitions for quick lookup
    const labelToFieldMap = new Map();
    schema.forEach(sec => {
      (sec.fields || []).forEach(f => {
        labelToFieldMap.set(f.lab.toLowerCase().trim(), f);
        // Also map simplified label without colon/notes
        const simplified = f.lab.toLowerCase().replace(/[:→]/g, ' ').replace(/\s+/g, ' ').trim();
        labelToFieldMap.set(simplified, f);
      });
    });

    // Map checklist text to checklist item IDs
    const checklistMap = new Map();
    schema.forEach(sec => {
      (sec.checklist || []).forEach(c => {
        checklistMap.set(c.t.toLowerCase().trim(), c.id);
      });
    });

    // Map zone label to zone ID
    const zoneMap = new Map();
    zoneList.forEach(z => {
      zoneMap.set(z.lab.toLowerCase().trim(), z.id);
      zoneMap.set(z.id.toLowerCase().trim(), z.id);
    });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check mode header
      if (line.toLowerCase().includes('modalità:')) {
        if (line.toLowerCase().includes('completa')) {
          newState.mode = 'completa';
        } else {
          newState.mode = 'rapido';
        }
        continue;
      }

      // Check section headers
      if (line.startsWith('## ')) {
        const title = line.replace(/^##\s+/, '').trim();
        currentSection = title;
        isTable = false;
        isSymptomTable = false;
        isLogTable = false;
        continue;
      }

      // Checklist item parsing: - [x] or - [ ]
      const chkMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (chkMatch) {
        const checked = chkMatch[1].toLowerCase() === 'x';
        const text = chkMatch[2].trim();
        // find matching checklist ID
        for (const [t, id] of checklistMap.entries()) {
          if (text.toLowerCase().includes(t) || t.includes(text.toLowerCase())) {
            newState.chk[id] = checked;
            break;
          }
        }
        continue;
      }

      // Table line parsing
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        
        // Skip separator row |---|---|
        if (cells.every(c => /^[-:]+$/.test(c))) {
          continue;
        }

        // Header detection
        if (cells.some(c => c.toLowerCase() === 'zona' || c.toLowerCase() === 'presente')) {
          isSymptomTable = true;
          isLogTable = false;
          isTable = false;
          tableHeaders = cells.map(c => c.toLowerCase());
          continue;
        }
        if (cells.some(c => c.toLowerCase() === 'modifica' || c.toLowerCase() === 'cosa ho cambiato' || c.toLowerCase() === 'effetto')) {
          isLogTable = true;
          isSymptomTable = false;
          isTable = false;
          tableHeaders = cells.map(c => c.toLowerCase());
          continue;
        }
        if (cells.some(c => c.toLowerCase() === 'voce' && c.toLowerCase() === 'valore')) {
          isTable = true;
          isSymptomTable = false;
          isLogTable = false;
          tableHeaders = cells.map(c => c.toLowerCase());
          continue;
        }

        // Parse symptom table row
        if (isSymptomTable && cells.length >= 2) {
          const zoneLabel = cells[0];
          let foundZoneId = null;
          for (const [zLab, zId] of zoneMap.entries()) {
            if (zoneLabel.toLowerCase().includes(zLab) || zLab.includes(zoneLabel.toLowerCase())) {
              foundZoneId = zId;
              break;
            }
          }
          if (foundZoneId) {
            newState.sx[foundZoneId] = {
              p: cells[1] || "",
              q: cells[2] || "",
              l: cells[3] || "",
              n: cells[4] || ""
            };
          }
          continue;
        }

        // Parse log table row
        if (isLogTable && cells.length >= 2) {
          newState.log.push([
            cells[0] || "",
            cells[1] || "",
            cells[2] || "",
            cells[3] || "",
            cells[4] || ""
          ]);
          continue;
        }

        // Key-Value table row
        if (cells.length >= 2) {
          const rawKey = cells[0];
          const rawVal = cells[1];
          if (!rawKey || !rawVal) continue;

          // Lookup matching field
          let targetField = labelToFieldMap.get(rawKey.toLowerCase().trim());
          if (!targetField) {
            const simplifiedKey = rawKey.toLowerCase().replace(/[:→]/g, ' ').replace(/\s+/g, ' ').trim();
            targetField = labelToFieldMap.get(simplifiedKey);
          }
          if (!targetField) {
            for (const [lbl, fld] of labelToFieldMap.entries()) {
              if (lbl.includes(rawKey.toLowerCase().trim()) || rawKey.toLowerCase().trim().includes(lbl)) {
                targetField = fld;
                break;
              }
            }
          }

          if (targetField) {
            let cleanVal = rawVal;
            // If field is number, strip unit suffix if present
            if (targetField.t === 'number') {
              const numMatch = rawVal.match(/^([-+]?[0-9]*\.?[0-9]+)/);
              if (numMatch) {
                cleanVal = numMatch[1];
              }
            }
            newState.v[targetField.id] = cleanVal;
          }
        }
      }
    }

    if (newState.log.length === 0) {
      newState.log = [["", "", "", "", ""]];
    }

    return newState;
  },

  /**
   * Parse a JSON backup string into app state
   * @param {string} jsonString
   * @returns {Object} state
   */
  parseJSON(jsonString) {
    const parsed = JSON.parse(jsonString);
    return {
      mode: parsed.mode || "rapido",
      v: parsed.v || {},
      chk: parsed.chk || {},
      sx: parsed.sx || {},
      log: Array.isArray(parsed.log) && parsed.log.length ? parsed.log : [["","","","",""]],
      videoAngles: parsed.videoAngles || null
    };
  },

  /**
   * Build complete JSON export string
   * @param {Object} state
   * @returns {string} JSON string
   */
  buildJSON(state) {
    const exportData = {
      app: "BikeFitPro",
      version: "3.0",
      exportedAt: new Date().toISOString(),
      ...state
    };
    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Build complete Markdown document from state
   * @param {Object} state
   * @param {Array} schema
   * @param {Array} zoneList
   * @returns {string} Markdown string
   */
  buildMarkdown(state, schema, zoneList) {
    const d = new Date();
    const oggi = d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
    let out = "# Scheda di rilevamento posizione in bici\n\n";
    out += "**Esportata il:** " + oggi + "  \n**Modalità:** " + (state.mode === "completa" ? "Completa" : "Rapida") + "\n\n---\n\n";

    const mancanti = [];
    schema.forEach((sec, i) => {
      let body = "";
      if (sec.matrix) {
        const righe = zoneList.filter(z => state.sx[z.id] && state.sx[z.id].p && state.sx[z.id].p !== "No");
        if (righe.length) {
          body += "| Zona | Presente | Dopo quanto | Lato | Note |\n|---|---|---|---|---|\n";
          righe.forEach(z => {
            const r = state.sx[z.id];
            body += "| " + z.lab + " | " + (r.p || "") + " | " + (r.q || "") + " | " + (r.l || "") + " | " + (r.n || "") + " |\n";
          });
          body += "\n";
        } else {
          const compilate = zoneList.filter(z => state.sx[z.id] && state.sx[z.id].p).length;
          body += compilate ? "Nessun fastidio segnalato in nessuna zona.\n\n" : "";
        }
      }
      if (sec.checklist) {
        let rows = "";
        sec.checklist.forEach(c => {
          rows += "- [" + (state.chk[c.id] ? "x" : " ") + "] " + c.t + "\n";
          if (c.pri && !state.chk[c.id]) mancanti.push(c.t);
        });
        if (rows) body += rows + "\n";
      }
      let rows = "";
      (sec.fields || []).forEach(f => {
        const val = (state.v[f.id] || "").trim();
        if (val) rows += "| " + f.lab + " | " + val + (f.u ? " " + f.u : "") + " |\n";
        else if (f.pri) mancanti.push(f.lab);
      });
      if (rows) body = "| Voce | Valore |\n|---|---|\n" + rows + "\n" + body;
      if (sec.log) {
        const filled = (state.log || []).filter(r => r.some(c => (c || "").trim()));
        if (filled.length) {
          body += "| Data | Modifica | Prima | Dopo | Effetto |\n|---|---|---|---|---|\n";
          filled.forEach(r => body += "| " + r.map(c => c || "").join(" | ") + " |\n");
          body += "\n";
        }
      }

      // Add detected video angles if stored in state
      if (sec.id === 'media' && state.videoAngles) {
        body += "\n### Rilevamento Video & Angoli Articolari\n\n";
        body += "| Articolazione / Angolo | Valore Misurato | Range Ottimale di Riferimento |\n|---|---|---|\n";
        if (state.videoAngles.kneeBDC) body += `| Estensione Ginocchio (BDC) | ${state.videoAngles.kneeBDC}° | 140° - 145° (35°-40° flessione) |\n`;
        if (state.videoAngles.kneeTDC) body += `| Flessione Ginocchio (TDC) | ${state.videoAngles.kneeTDC}° | 65° - 75° |\n`;
        if (state.videoAngles.torso) body += `| Inclinazione Busto (Torso) | ${state.videoAngles.torso}° | 40° - 50° (Endurance) / 35°-42° (Race) |\n`;
        if (state.videoAngles.shoulder) body += `| Angolo Spalla | ${state.videoAngles.shoulder}° | 80° - 90° |\n`;
        if (state.videoAngles.elbow) body += `| Angolo Gomito | ${state.videoAngles.elbow}° | 150° - 165° (15°-30° flessione) |\n`;
        if (state.videoAngles.hipTDC) body += `| Angolo Anca Chiusa (TDC) | ${state.videoAngles.hipTDC}° | > 45° (evita compressione) |\n`;
        if (state.videoAngles.ankle) body += `| Angolo Caviglia | ${state.videoAngles.ankle}° | 90° - 110° |\n`;
        body += "\n";
      }

      if (body) out += "## " + String(i + 1).padStart(2, "0") + ". " + sec.title + "\n\n" + body;
    });

    if (mancanti.length) {
      out += "---\n\n## Dati essenziali ancora mancanti\n\n";
      mancanti.forEach(m => out += "- " + m + "\n");
      out += "\n";
    } else {
      out += "---\n\nTutti i dati essenziali sono compilati.\n";
    }
    return out;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BikeFitIO };
}
