/**
 * BIKE FIT PRO - APPLICATION CONTROLLER
 * SPA router, Form renderer, Video Pose analyzer,
 * Static Fitting & Cockpit Simulator, Diagnostic & Action Plan Engine,
 * Synchronized Dual Video Player, Import/Export, and i18n Manager
 */

// ===================== SVG DIAGRAMS =====================
const D = {};

D.bici = `<svg viewBox="0 0 480 230" xmlns="http://www.w3.org/2000/svg">
  <circle class="ghost" cx="108" cy="168" r="44" stroke="#9CA3AF" fill="none" stroke-width="1"/>
  <circle class="ghost" cx="372" cy="168" r="44" stroke="#9CA3AF" fill="none" stroke-width="1"/>
  <path class="part" d="M108 168 L196 168 L262 78 L318 78 L372 168" stroke="#111827" stroke-width="1.5" fill="none"/>
  <path class="part" d="M196 168 L246 78" stroke="#111827" stroke-width="1.5" fill="none"/>
  <path class="part" d="M246 78 L318 78" stroke="#111827" stroke-width="1.5" fill="none"/>
  <path class="part" d="M262 78 L318 78" stroke="#111827" stroke-width="1.5" fill="none"/>
  <path class="part" d="M246 78 L240 56" stroke="#111827" stroke-width="1.5" fill="none"/>
  <path class="part" d="M222 52 L266 52" stroke="#111827" stroke-width="5" fill="none"/>
  <path class="part" d="M318 78 L318 58" stroke="#111827" stroke-width="1.5" fill="none"/>
  <path class="part" d="M318 58 L352 58" stroke="#111827" stroke-width="4" fill="none"/>
  <path class="part" d="M352 58 L352 74 L344 84" stroke="#111827" stroke-width="1.5" fill="none"/>
  <circle class="part" cx="196" cy="168" r="7" stroke="#111827" stroke-width="1.5" fill="#E5E7EB"/>
  <path class="part" d="M196 168 L214 196" stroke="#111827" stroke-width="2" fill="none"/>
  <text x="215" y="42" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">SELLA / SADDLE</text>
  <text x="188" y="46" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700" text-anchor="end">CARRELLI / RAILS</text>
  <path d="M186 44 L222 50" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="252" y="52" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700" text-anchor="middle">REGGISELLA / SEATPOST</text>
  <path d="M252 56 L244 70" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="216" y="120" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700" text-anchor="end">PIANTONE / SEAT TUBE</text>
  <path d="M218 116 L228 108" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="374" y="44" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">ATTACCO / STEM</text>
  <path d="M372 48 L338 56" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="366" y="100" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">MANUBRIO / HANDLEBAR</text>
  <path d="M364 96 L352 84" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="150" y="200" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700" text-anchor="middle">MOVIMENTO CENTRALE / BB</text>
  <path d="M172 194 L192 176" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="238" y="212" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">PEDIVELLA / CRANK</text>
  <path d="M236 208 L216 198" stroke="#0284C7" stroke-width="1" fill="none"/>
</svg>`;

D.sellaMis = `<svg viewBox="0 0 470 240" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="196" r="9" stroke="#111827" stroke-width="2" fill="#E5E7EB"/>
  <text x="150" y="222" text-anchor="middle" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">MOV. CENTRALE / BB</text>
  <path d="M150 196 L226 52" stroke="#111827" stroke-width="2" fill="none"/>
  <path d="M226 52 L226 40" stroke="#111827" stroke-width="2" fill="none"/>
  <path d="M196 36 L262 36" stroke="#111827" stroke-width="5" fill="none"/>
  <path d="M196 36 L196 214" stroke="#9CA3AF" stroke-dasharray="3 3" fill="none"/>
  <path d="M150 196 L150 214" stroke="#9CA3AF" stroke-dasharray="3 3" fill="none"/>
  <path d="M150 208 L196 208" stroke="#0284C7" stroke-width="1" fill="none"/>
  <path d="M150 204 L150 212" stroke="#0284C7" stroke-width="1" fill="none"/>
  <path d="M196 204 L196 212" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="173" y="204" text-anchor="middle" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">B</text>
  <path d="M158 190 L232 50" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="212" y="130" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">A</text>
  <path d="M196 36 L400 36" stroke="#9CA3AF" stroke-dasharray="3 3" fill="none"/>
  <text x="300" y="30" font-family="monospace" font-size="9" fill="#0284C7">top sella / saddle top</text>
  <text x="30" y="60" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">A = ALTEZZA SELLA / SADDLE HEIGHT</text>
  <text x="30" y="74" font-family="sans-serif" font-size="8.5" fill="#4B5563">BB center → saddle top</text>
  <text x="30" y="108" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">B = ARRETRAMENTO / SETBACK</text>
  <text x="30" y="122" font-family="sans-serif" font-size="8.5" fill="#4B5563">BB vertical plumb → saddle nose</text>
</svg>`;

D.carrelli = `<svg viewBox="0 0 470 220" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="20" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">SELLA VISTA DA SOTTO / SADDLE BOTTOM</text>
  <path d="M60 60 Q150 44 250 52 L400 52 Q416 60 400 68 L250 68 Q150 76 60 60 Z" fill="#F3F4F6" stroke="#111827" stroke-width="1.5"/>
  <path d="M110 100 L390 100" stroke="#111827" stroke-width="3"/>
  <path d="M110 140 L390 140" stroke="#111827" stroke-width="3"/>
  <path d="M110 100 Q92 120 110 140" stroke="#111827" stroke-width="3" fill="none"/>
  <rect x="226" y="88" width="46" height="64" rx="3" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
  <text x="249" y="170" text-anchor="middle" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">MORSETTO / CLAMP</text>
  <text x="330" y="94" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">CARRELLI (rails)</text>
  <path d="M330 97 L350 100" stroke="#0284C7" stroke-width="1" fill="none"/>
  <path d="M300 96 L300 104" stroke="#E5B111" stroke-width="2"/>
  <path d="M320 96 L320 104" stroke="#E5B111" stroke-width="2"/>
  <path d="M340 96 L340 104" stroke="#E5B111" stroke-width="2"/>
  <text x="320" y="124" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#6B7280">tacche / marks</text>
  <path d="M400 200 L226 200" stroke="#0284C7" stroke-width="1" fill="none"/>
  <path d="M400 196 L400 204" stroke="#0284C7" stroke-width="1" fill="none"/>
  <path d="M226 196 L226 204" stroke="#0284C7" stroke-width="1" fill="none"/>
  <text x="313" y="196" text-anchor="middle" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">misura / dimension</text>
</svg>`;

D.ischi = `<svg viewBox="0 0 470 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="24" width="350" height="130" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="1"/>
  <text x="70" y="42" font-family="monospace" font-size="9" fill="#0284C7" font-weight="700">CARTONE / CARDBOARD</text>
  <ellipse cx="185" cy="96" rx="22" ry="30" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
  <ellipse cx="285" cy="96" rx="22" ry="30" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
  <circle cx="185" cy="96" r="3" fill="#EF4444"/><circle cx="285" cy="96" r="3" fill="#EF4444"/>
  <path d="M185 96 L285 96" stroke="#EF4444" stroke-width="1.5"/>
  <text x="235" y="86" text-anchor="middle" font-family="monospace" font-size="9" fill="#EF4444" font-weight="700">CENTER-TO-CENTER</text>
  <text x="235" y="146" text-anchor="middle" font-family="sans-serif" font-size="8.5" fill="#6B7280">da centro a centro impronta</text>
</svg>`;

// ===================== SCHEMA =====================
const ZONE = [
  { id: "collo", lab: "Collo e spalle", labEn: "Neck and shoulders" },
  { id: "mani", lab: "Mani, polsi, avambracci", labEn: "Hands, wrists, forearms" },
  { id: "lombare", lab: "Schiena lombare", labEn: "Lower back" },
  { id: "sella", lab: "Zona sella: perineo o genitali", labEn: "Saddle: perineum / numbness" },
  { id: "ischi_s", lab: "Ischi e glutei", labEn: "Sit bones and glutes" },
  { id: "gin_ant", lab: "Ginocchio, parte anteriore", labEn: "Knee, anterior / patella" },
  { id: "gin_post", lab: "Ginocchio, parte posteriore", labEn: "Knee, posterior / hamstrings" },
  { id: "gin_lat", lab: "Ginocchio, interno o esterno", labEn: "Knee, medial / lateral IT-band" },
  { id: "anca", lab: "Anca o inguine", labEn: "Hip / groin" },
  { id: "piedi", lab: "Piedi", labEn: "Feet / hot-spots" },
  { id: "altro_z", lab: "Altro", labEn: "Other" }
];

const SCHEMA = [
  {
    id: "profilo", title: "Profilo del rilevamento", titleEn: "Rider & Fit Profile", note: "5 minuti",
    intro: "Chi sei in bici e cosa cerchi da questa analisi.",
    introEn: "Your riding background and target fit goals.",
    fields: [
      { id: "data", lab: "Data del rilevamento", labEn: "Session Date", t: "text", ph: "gg/mm/aaaa" },
      { id: "disciplina", lab: "Disciplina", labEn: "Riding Discipline", pri: 1, t: "select", opt: ["", "Strada", "Gravel", "MTB cross country", "MTB trail o enduro", "Ciclocross", "Crono o triathlon", "Urbano o cicloturismo", "Altro"] },
      { id: "tipo_manubrio", lab: "Tipo di manubrio", labEn: "Handlebar Type", pri: 1, t: "select", opt: ["", "Piega da strada", "Flat bar", "Manubrio rialzato", "Da crono con appendici", "Altro"] },
      { id: "uso", lab: "Uso prevalente", labEn: "Primary Use", pri: 1, t: "select", opt: ["", "Allenamento e gare", "Granfondo e uscite lunghe", "Cicloturismo o viaggio", "Prevalentemente indoor", "Uso misto"] },
      { id: "obiettivo", lab: "Obiettivo del fit", labEn: "Fit Goal", pri: 1, t: "select", opt: ["", "Comfort", "Potenza ed efficienza", "Aerodinamica", "Risolvere un fastidio specifico", "Controllo generale, niente fa male"] },
      { id: "obiettivo_txt", lab: "Obiettivo in una frase", labEn: "Fit Goal Description", pri: 1, t: "text", ph: "cosa vorresti ottenere, con parole tue" },
      { id: "ore", lab: "Ore settimanali", labEn: "Weekly Hours", pri: 1, t: "text" },
      { id: "durata", lab: "Durata tipica dell'uscita", labEn: "Typical Ride Duration", pri: 1, t: "text" },
      { id: "indoor", lab: "Indoor o outdoor", labEn: "Indoor or Outdoor", pri: 1, t: "select", opt: ["", "Solo outdoor", "Solo indoor", "Entrambi, uguale", "Entrambi, ma indoor va peggio", "Entrambi, ma outdoor va peggio"] },
      { id: "anni", lab: "Anni di pratica", labEn: "Years of Cycling", adv: 1, t: "text" }
    ]
  },
  {
    id: "bici", title: "La bici", titleEn: "The Bicycle", note: "Senza metro",
    fields: [
      { id: "marca", lab: "Marca e modello del telaio", labEn: "Frame Brand & Model", pri: 1, t: "text", ph: "es. Argon 18 Gallium" },
      { id: "taglia", lab: "Taglia", labEn: "Frame Size", pri: 1, t: "text", ph: "es. M / 54" },
      { id: "anno", lab: "Anno del modello", labEn: "Model Year", adv: 1, t: "text" },
      { id: "stack", lab: "Stack", labEn: "Frame Stack", adv: 1, t: "number", u: "mm" },
      { id: "reach_telaio", lab: "Reach", labEn: "Frame Reach", adv: 1, t: "number", u: "mm" },
      { id: "ang_piantone", lab: "Angolo del piantone", labEn: "Seat Tube Angle", adv: 1, t: "number", u: "°" },
      { id: "reggisella", lab: "Reggisella: dritto o arretrato", labEn: "Seatpost: Straight / Setback", adv: 1, t: "select", opt: ["", "Dritto (offset 0)", "Arretrato", "Non so"] }
    ]
  },
  {
    id: "componenti", title: "Componenti", titleEn: "Components", note: "Etichette",
    fields: [
      { id: "sella_mod", lab: "Sella: marca e modello", labEn: "Saddle: Brand & Model", pri: 1, t: "text", ph: "es. Prologo Kappa Space" },
      { id: "sella_larg", lab: "Sella: larghezza", labEn: "Saddle Width", pri: 1, t: "number", u: "mm" },
      { id: "attacco_lun", lab: "Attacco: lunghezza", labEn: "Stem Length", pri: 1, t: "number", u: "mm" },
      { id: "attacco_ang", lab: "Attacco: angolo e orientamento", labEn: "Stem Angle", pri: 1, t: "text", ph: "es. 6° / -6°" },
      { id: "spessori", lab: "Spessori sotto l'attacco", labEn: "Spacers Under Stem", pri: 1, t: "text", ph: "es. 3 spessori, 23 mm" },
      { id: "manubrio_larg", lab: "Manubrio: larghezza", labEn: "Handlebar Width", pri: 1, t: "number", u: "mm" },
      { id: "manubrio_std", lab: "Larghezza misurata come", labEn: "Bar Width Measured As", pri: 1, t: "select", opt: ["", "Centro-centro (c-c)", "Esterno-esterno (e-e)", "Dato produttore"] },
      { id: "pedivelle", lab: "Lunghezza pedivelle", labEn: "Crank Length", pri: 1, t: "number", u: "mm" },
      { id: "fondello", lab: "Salopette o pantaloncini: marca e anni d'uso", labEn: "Bib Shorts: Brand & Age", pri: 1, t: "text" }
    ]
  },
  {
    id: "regolazioni", title: "Regolazioni attuali", titleEn: "Current Setup Dimensions", note: "Metro alla mano",
    fields: [
      { id: "h_sella", lab: "Altezza sella", labEn: "Saddle Height", pri: 1, t: "number", u: "mm", help: `<p>Dal movimento centrale al top sella.</p>` + D.sellaMis },
      { id: "arretramento", lab: "Arretramento sella", labEn: "Saddle Setback", pri: 1, t: "number", u: "mm", help: `<p>Distanza orizzontale punta sella - mov centrale.</p>` + D.sellaMis },
      { id: "incl_sella", lab: "Inclinazione sella", labEn: "Saddle Tilt Angle", pri: 1, t: "number", u: "°" },
      { id: "reach_sm", lab: "Punta sella → centro manubrio", labEn: "Saddle Nose to Handlebar Reach", pri: 1, t: "number", u: "mm" },
      { id: "drop_sm", lab: "Dislivello sella → manubrio", labEn: "Saddle-to-Bar Drop", pri: 1, t: "number", u: "mm" }
    ]
  },
  {
    id: "corpo", title: "Misure corporee", titleEn: "Rider Body Anthropometry", note: "Meglio in due",
    fields: [
      { id: "altezza", lab: "Altezza", labEn: "Rider Total Height", pri: 1, t: "number", u: "cm" },
      { id: "peso", lab: "Peso", labEn: "Rider Weight", adv: 1, t: "number", u: "kg" },
      { id: "cavallo", lab: "Cavallo", labEn: "Inseam", pri: 1, t: "number", u: "mm" },
      { id: "femore", lab: "Femore", labEn: "Thigh / Femur Length", adv: 1, t: "number", u: "mm" },
      { id: "tibia", lab: "Tibia", labEn: "Lower Leg / Tibia", adv: 1, t: "number", u: "mm" },
      { id: "busto", lab: "Busto", labEn: "Torso Length", adv: 1, t: "number", u: "mm" },
      { id: "braccio", lab: "Lunghezza braccio", labEn: "Arm Length", adv: 1, t: "number", u: "mm" }
    ]
  },
  {
    id: "ischi", title: "Ossa ischiatiche", titleEn: "Ischial Tuberosities (Sit Bones)", note: "Larghezza sella",
    fields: [
      { id: "ischi_mm", lab: "Distanza tra le ossa ischiatiche", labEn: "Sit Bone Span (Center-to-Center)", pri: 1, t: "number", u: "mm", help: `<p>Misura tra i centri delle impronte.</p>` + D.ischi },
      { id: "ischi_foto", lab: "Foto dell'impronta con righello accanto", labEn: "Impression Photo with Ruler", pri: 1, t: "select", opt: ["", "Sì", "No"] }
    ]
  },
  {
    id: "mobilita", title: "Mobilità", titleEn: "Pelvic Mobility Test", note: "Test rapido",
    fields: [
      { id: "basculamento", lab: "Basculamento del bacino", labEn: "Pelvic Anterior Tilt Rotation", pri: 1, t: "select", opt: ["", "Ruoto bene in avanti, la schiena bassa si inarca", "Ruoto poco, sento subito blocco", "Non riesco quasi per niente"] }
    ]
  },
  {
    id: "sintomi", title: "Fastidi e sintomi", titleEn: "Discomforts & Symptoms Matrix",
    matrix: true,
    fields: [
      { id: "storia_inizio", lab: "Come è iniziato", labEn: "Onset & History", t: "textarea" },
      { id: "meglio_peggio", lab: "Cosa lo migliora o peggiora", labEn: "What eases or worsens it", t: "textarea" },
      { id: "persistenza", lab: "Resta anche dopo essere sceso dalla bici?", labEn: "Persists after dismounting?", pri: 1, t: "select", opt: ["", "Nessun fastidio", "No, passa subito", "Sì, qualche minuto", "Sì, più di mezz'ora", "Sì, ore o giorni"] },
      { id: "cambi", lab: "Cambiamenti recenti", labEn: "Recent Bike Changes", pri: 1, t: "textarea" }
    ]
  },
  {
    id: "media", title: "Foto e video", titleEn: "Photos & Videos Checklist",
    checklist: [
      { id: "v1", pri: 1, t: "Video laterale, posizione più usata", tEn: "Side video, most used posture", s: "20-30s camera ad altezza anca" },
      { id: "v2", pri: 1, t: "Video laterale, posizione più bassa", tEn: "Side video, low aero drops", s: "Presa bassa o appendici" },
      { id: "v3", pri: 1, t: "Video posteriore", tEn: "Rear video (pelvic alignment)", s: "Allineamento bacino" }
    ],
    fields: [
      { id: "supporto", lab: "Su cosa hai registrato i video", labEn: "Trainer / Rig Setup", pri: 1, t: "select", opt: ["", "Rullo interattivo o a rulli", "Rullo a resistenza fissa", "Cavalletto con ruota sollevata", "In strada", "Non ho ancora registrato"] }
    ]
  },
  {
    id: "registro", title: "Registro modifiche", titleEn: "Fit Modification Register",
    log: true,
    fields: []
  }
];

// ===================== STATE & STORAGE =====================
const STORAGE_KEY = "bikefit:pro:v3";

function getFreshBlankState() {
  return {
    version: 3,
    mode: "rapido",
    v: {},
    chk: {},
    sx: {},
    log: [["", "", "", "", ""]],
    videoAngles: null
  };
}

let state = getFreshBlankState();

let saveTimer = null;
let poseEngine = null;
let webcamStream = null;
let demoAnimationTimer = null;
let dualVideoSync = { syncOffset: 0, isSynced: false };

function getCameraErrorMessage(error) {
  const errorKey = {
    NotAllowedError: "statusCameraPermissionDenied",
    SecurityError: "statusCameraPermissionDenied",
    NotFoundError: "statusCameraNotFound",
    NotReadableError: "statusCameraInUse",
    AbortError: "statusCameraInUse",
    OverconstrainedError: "statusCameraNotFound"
  }[error?.name] || "statusCameraError";
  return I18N.t(errorKey);
}

let pendingCameraRetryFn = null;

function showCameraPermissionGuide(onRetry, nativeFallbackInput) {
  pendingCameraRetryFn = onRetry;
  const modal = document.getElementById("modalCameraPermissionGuide");
  if (modal) {
    const btnNative = document.getElementById("btnCamGuideNative");
    if (btnNative) {
      if (nativeFallbackInput) {
        btnNative.style.display = "inline-flex";
        btnNative.onclick = () => {
          modal.close();
          nativeFallbackInput.click();
        };
      } else {
        btnNative.style.display = "none";
      }
    }
    modal.showModal();
  } else {
    alert(I18N.t("statusCameraPermissionDenied"));
  }
}

function initCameraPermissionGuide() {
  const modal = document.getElementById("modalCameraPermissionGuide");
  const btnClose = document.getElementById("btnCloseCamGuide");
  const btnCloseBottom = document.getElementById("btnCamGuideClose");
  const btnRetry = document.getElementById("btnCamGuideRetry");

  const closeGuide = () => { if (modal) modal.close(); };
  btnClose?.addEventListener("click", closeGuide);
  btnCloseBottom?.addEventListener("click", closeGuide);

  btnRetry?.addEventListener("click", async () => {
    if (modal) modal.close();
    if (typeof pendingCameraRetryFn === "function") {
      try {
        await pendingCameraRetryFn();
      } catch (e) {
        console.warn("Camera retry failed:", e);
      }
    }
  });
}

async function attachStreamToVideo(video, stream) {
  if (!video || !stream) return;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("autoplay", "");
  video.srcObject = stream;
  try {
    await video.play();
  } catch (e) {
    console.warn("Video play error suppressed:", e);
  }
}

async function requestCameraStream(facingMode, dimensions) {
  if (!window.isSecureContext) {
    throw new Error("Camera access requires a secure context (HTTPS).");
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera API unavailable in this browser.");
  }

  const preferredConstraints = {
    video: { ...dimensions, facingMode: { ideal: facingMode } },
    audio: false
  };

  try {
    return await navigator.mediaDevices.getUserMedia(preferredConstraints);
  } catch (error) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      throw error;
    }
    console.warn("Preferred camera constraints failed, attempting fallback...", error);
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false
      });
    } catch (error2) {
      if (error2.name === "NotAllowedError" || error2.name === "SecurityError") {
        throw error2;
      }
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
  }
}

function saveToLocalStorage() {
  try {
    if (typeof ProfileManager !== "undefined") {
      ProfileManager.saveActiveState(state);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    setStatusBadge(I18N.t("statusSaved"));
    updateActiveProfileBadge();
  } catch (e) {
    setStatusBadge(I18N.t("statusSaveError"));
  }
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToLocalStorage();
    if (typeof ProfileManager !== "undefined") {
      ProfileManager.updateActiveMetaFromState(state);
      updateActiveProfileBadge();
    }
  }, 400);
}

function loadState() {
  try {
    if (typeof ProfileManager !== "undefined") {
      ProfileManager.init();
      const loaded = ProfileManager.loadActiveState();
      if (loaded) {
        state = Object.assign(getFreshBlankState(), loaded);
      }
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
      }
    }
  } catch (e) {
    console.warn("Storage load error:", e);
  }
}

function setStatusBadge(text) {
  const el = document.getElementById("saveStatus");
  if (!el) return;
  el.textContent = text;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    const d = new Date();
    el.textContent = I18N.t("statusLastSave") + " " + d.toLocaleTimeString();
  }, 2000);
}

// ===================== FORM RENDERING =====================
function fieldEl(f) {
  const isEn = I18N.currentLang === "en";
  const wrap = document.createElement("div");
  wrap.className = "f";
  if (f.adv) wrap.dataset.adv = "1";
  const top = document.createElement("div"); top.className = "f-top";
  const lab = document.createElement("div"); lab.className = "f-label";
  const l1 = document.createElement("div"); l1.className = "lab";
  l1.appendChild(document.createTextNode(isEn && f.labEn ? f.labEn : f.lab));
  if (f.pri) { const b = document.createElement("span"); b.className = "pri"; b.textContent = I18N.t("badgeEssential"); l1.appendChild(b); }
  if (f.adv) { const b = document.createElement("span"); b.className = "adv"; b.textContent = I18N.t("badgeDetail"); l1.appendChild(b); }
  if (f.help) {
    const hb = document.createElement("button");
    hb.className = "helpbtn"; hb.type = "button"; hb.textContent = "?";
    hb.setAttribute("aria-expanded", "false");
    hb.setAttribute("aria-label", "Spiegazione");
    l1.appendChild(hb); wrap._hb = hb;
  }
  lab.appendChild(l1);
  if (f.how) { const h = document.createElement("div"); h.className = "f-how"; h.textContent = f.how; lab.appendChild(h); }
  top.appendChild(lab);

  const inw = document.createElement("div"); inw.className = "f-in";
  let input;
  if (f.t === "select") {
    input = document.createElement("select");
    f.opt.forEach(o => { const op = document.createElement("option"); op.value = o; op.textContent = o || (isEn ? "Select" : "seleziona"); input.appendChild(op); });
  } else if (f.t === "textarea") {
    input = document.createElement("textarea");
    if (f.ph) input.placeholder = f.ph;
  } else {
    input = document.createElement("input");
    input.type = f.t === "number" ? "number" : "text";
    if (f.t === "number") input.step = "any";
    if (f.ph) input.placeholder = f.ph;
  }
  input.id = "fld-" + f.id;
  input.value = state.v[f.id] || "";
  if (input.value) input.classList.add("filled");
  input.addEventListener("input", () => {
    state.v[f.id] = input.value;
    input.classList.toggle("filled", !!input.value);
    queueSave(); updateProgress();
    if (["disciplina", "cavallo", "altezza", "h_sella", "pedivelle", "ischi_mm", "sella_larg", "incl_sella", "attacco_lun"].includes(f.id)) {
      updateStaticCalculator();
      renderDiagnostics();
    }
  });
  inw.appendChild(input);
  if (f.u) { const u = document.createElement("span"); u.className = "unit"; u.textContent = f.u; inw.appendChild(u); }
  if (f.t === "textarea") inw.style.flexBasis = "100%";
  top.appendChild(inw);
  wrap.appendChild(top);

  if (f.help) {
    const h = document.createElement("div"); h.className = "help"; h.hidden = true;
    h.innerHTML = f.help;
    wrap.appendChild(h);
    wrap._hb.addEventListener("click", () => {
      const open = h.hidden;
      h.hidden = !open;
      wrap._hb.setAttribute("aria-expanded", String(open));
    });
  }
  return wrap;
}

function matrixEl() {
  const isEn = I18N.currentLang === "en";
  const box = document.createElement("div"); box.className = "scroll";
  const tb = document.createElement("table");
  const cols = isEn ? ["Body Zone", "Present", "After how long", "Side", "Notes"] : ["Zona", "Presente", "Dopo quanto", "Lato", "Note"];
  const thead = document.createElement("thead"); const tr = document.createElement("tr");
  cols.forEach((c, i) => {
    const th = document.createElement("th"); th.textContent = c;
    if (i === 4) th.dataset.adv = "1";
    tr.appendChild(th);
  });
  thead.appendChild(tr); tb.appendChild(thead);
  const body = document.createElement("tbody");
  ZONE.forEach(z => {
    const row = document.createElement("tr");
    const tdz = document.createElement("td"); tdz.className = "zone"; tdz.textContent = (isEn && z.labEn) ? z.labEn : z.lab; row.appendChild(tdz);
    state.sx[z.id] = state.sx[z.id] || { p: "", q: "", l: "", n: "" };
    const mk = (key, kind, opts, ph, adv) => {
      const td = document.createElement("td");
      if (adv) td.dataset.adv = "1";
      let el;
      if (kind === "select") {
        el = document.createElement("select");
        opts.forEach(o => { const op = document.createElement("option"); op.value = o; op.textContent = o || "-"; el.appendChild(op); });
      } else {
        el = document.createElement("input"); el.type = "text"; if (ph) el.placeholder = ph;
      }
      el.value = state.sx[z.id][key] || "";
      if (el.value) el.classList.add("filled");
      el.addEventListener("input", () => {
        state.sx[z.id][key] = el.value;
        el.classList.toggle("filled", !!el.value);
        queueSave(); updateProgress();
        renderDiagnostics();
      });
      td.appendChild(el); row.appendChild(td);
    };
    mk("p", "select", ["", "No", isEn ? "Mild" : "Lieve", isEn ? "Severe" : "Marcato"]);
    mk("q", "text", null, isEn ? "e.g. after 1h" : "es. dopo 1h");
    mk("l", "select", ["", isEn ? "Both" : "Entrambi", isEn ? "Right" : "Destra", isEn ? "Left" : "Sinistra"]);
    mk("n", "text", null, isEn ? "details" : "note", true);
    body.appendChild(row);
  });
  tb.appendChild(body); box.appendChild(tb);
  return box;
}

function chkEl(c) {
  const isEn = I18N.currentLang === "en";
  const w = document.createElement("label"); w.className = "chk";
  if (!c.pri) w.dataset.adv = "1";
  const i = document.createElement("input"); i.type = "checkbox"; i.checked = !!state.chk[c.id];
  i.addEventListener("change", () => { state.chk[c.id] = i.checked; queueSave(); updateProgress(); });
  const d = document.createElement("div");
  const t = document.createElement("div"); t.className = "chk-t";
  t.appendChild(document.createTextNode(isEn && c.tEn ? c.tEn : c.t));
  if (c.pri) { const b = document.createElement("span"); b.className = "pri"; b.textContent = I18N.t("badgeEssential"); b.style.marginLeft = "7px"; t.appendChild(b); }
  const s = document.createElement("div"); s.className = "chk-s"; s.textContent = c.s;
  d.appendChild(t); d.appendChild(s);
  w.appendChild(i); w.appendChild(d);
  return w;
}

function logEl() {
  const isEn = I18N.currentLang === "en";
  const cols = isEn ? ["Date", "Adjustment Made", "Before", "After", "Feedback after 3 rides"] : ["Data", "Cosa ho cambiato", "Prima", "Dopo", "Effetto dopo 3 uscite"];
  const box = document.createElement("div");
  const sc = document.createElement("div"); sc.className = "scroll";
  const tb = document.createElement("table");
  const thead = document.createElement("thead"); const tr = document.createElement("tr");
  cols.forEach(c => { const th = document.createElement("th"); th.textContent = c; tr.appendChild(th); });
  thead.appendChild(tr); tb.appendChild(thead);
  const body = document.createElement("tbody");
  function row(r, idx) {
    const tr = document.createElement("tr");
    cols.forEach((_, i) => {
      const td = document.createElement("td");
      const inp = document.createElement("input"); inp.type = "text"; inp.value = r[i] || "";
      inp.addEventListener("input", () => { state.log[idx][i] = inp.value; queueSave(); });
      td.appendChild(inp); tr.appendChild(td);
    });
    return tr;
  }
  (state.log || []).forEach((r, i) => body.appendChild(row(r, i)));
  tb.appendChild(body); sc.appendChild(tb); box.appendChild(sc);
  const add = document.createElement("button");
  add.className = "btn"; add.type = "button"; add.textContent = isEn ? "+ Add Row" : "+ Aggiungi riga"; add.style.marginTop = "12px";
  add.addEventListener("click", () => {
    state.log.push(["", "", "", "", ""]);
    body.appendChild(row(state.log[state.log.length - 1], state.log.length - 1));
    queueSave();
  });
  box.appendChild(add);
  return box;
}

function renderForm() {
  const isEn = I18N.currentLang === "en";
  const root = document.getElementById("formContainer");
  if (!root) return;
  root.innerHTML = "";
  SCHEMA.forEach((sec, i) => {
    const s = document.createElement("section"); s.className = "block"; s.dataset.sec = sec.id;
    const hd = document.createElement("div"); hd.className = "block-head";
    const n = document.createElement("span"); n.className = "num"; n.textContent = String(i + 1).padStart(2, "0");
    const h2 = document.createElement("h2"); h2.textContent = isEn && sec.titleEn ? sec.titleEn : sec.title;
    const nt = document.createElement("span"); nt.className = "note"; nt.textContent = sec.note || "";
    hd.appendChild(n); hd.appendChild(h2); hd.appendChild(nt); s.appendChild(hd);
    if (sec.intro) { const it = document.createElement("div"); it.className = "block-intro"; it.textContent = isEn && sec.introEn ? sec.introEn : sec.intro; s.appendChild(it); }
    const b = document.createElement("div"); b.className = "block-body";
    if (sec.matrix) b.appendChild(matrixEl());
    if (sec.checklist) {
      const cw = document.createElement("div"); cw.style.marginTop = "8px";
      sec.checklist.forEach(c => cw.appendChild(chkEl(c)));
      b.appendChild(cw);
    }
    if (sec.id === "corpo") {
      const pBtnCard = document.createElement("div");
      pBtnCard.className = "photo-wizard-btn-card";
      pBtnCard.innerHTML = `
        <div class="photo-wizard-btn-text">
          <h4>${I18N.t("photoWizardTitle")}</h4>
          <p>${I18N.t("photoWizardSub")}</p>
        </div>
        <button type="button" class="btn btn-action-cyan" id="btnOpenPhotoWizard">${I18N.t("photoWizardBtn")}</button>
      `;
      b.appendChild(pBtnCard);
      pBtnCard.querySelector("#btnOpenPhotoWizard")?.addEventListener("click", () => openPhotoWizard());
    }
    if (sec.id === "regolazioni") {
      const bBtnCard = document.createElement("div");
      bBtnCard.className = "bike-wizard-btn-card card-amber";
      bBtnCard.innerHTML = `
        <div class="bike-wizard-btn-text">
          <h4>${I18N.t("bikePhotoWizardTitle")}</h4>
          <p>${I18N.t("bikePhotoWizardSub")}</p>
        </div>
        <button type="button" class="btn btn-action-amber" id="btnOpenBikePhotoWizard">${I18N.t("bikePhotoWizardBtn")}</button>
      `;
      b.appendChild(bBtnCard);
      bBtnCard.querySelector("#btnOpenBikePhotoWizard")?.addEventListener("click", () => openBikePhotoWizard());
    }
    if (sec.id === "ischi") {
      const sBtnCard = document.createElement("div");
      sBtnCard.className = "bike-wizard-btn-card card-green";
      sBtnCard.innerHTML = `
        <div class="bike-wizard-btn-text">
          <h4>${I18N.t("sitBoneModalTitle")}</h4>
          <p>${I18N.t("sitBoneModalSub")}</p>
        </div>
        <button type="button" class="btn btn-action-green" id="btnOpenSitBoneWizard">${I18N.t("btnSitBoneWizard")}</button>
      `;
      b.appendChild(sBtnCard);
      sBtnCard.querySelector("#btnOpenSitBoneWizard")?.addEventListener("click", () => openSitBoneWizard());
    }
    if (sec.id === "scarpe") {
      const fBtnCard = document.createElement("div");
      fBtnCard.className = "bike-wizard-btn-card card-cyan";
      fBtnCard.innerHTML = `
        <div class="bike-wizard-btn-text">
          <h4>${I18N.t("footFlareModalTitle")}</h4>
          <p>${I18N.t("footFlareModalSub")}</p>
        </div>
        <button type="button" class="btn btn-action-cyan" id="btnOpenFootFlareWizard">${I18N.t("btnFootFlareWizard")}</button>
      `;
      b.appendChild(fBtnCard);
      fBtnCard.querySelector("#btnOpenFootFlareWizard")?.addEventListener("click", () => openFootFlareWizard());
    }
    (sec.fields || []).forEach(f => b.appendChild(fieldEl(f)));
    if (sec.log) b.appendChild(logEl());
    s.appendChild(b);
    root.appendChild(s);
  });
  applyMode();
  updateProgress();
}

function applyMode() {
  const adv = state.mode === "completa";
  document.querySelectorAll('[data-adv="1"]').forEach(el => el.classList.toggle("hidden", !adv));
  const rBtn = document.getElementById("mRapido");
  const cBtn = document.getElementById("mCompleta");
  if (rBtn) rBtn.setAttribute("aria-pressed", String(!adv));
  if (cBtn) cBtn.setAttribute("aria-pressed", String(adv));
  updateProgress();
}

function activeFields() {
  const adv = state.mode === "completa";
  let tot = 0, done = 0;
  SCHEMA.forEach(sec => {
    if (sec.matrix) {
      ZONE.forEach(z => { tot++; if (state.sx[z.id] && state.sx[z.id].p) done++; });
    }
    (sec.fields || []).forEach(f => {
      if (f.adv && !adv) return;
      tot++; if ((state.v[f.id] || "").trim()) done++;
    });
    (sec.checklist || []).forEach(c => {
      if (!c.pri && !adv) return;
      tot++; if (state.chk[c.id]) done++;
    });
  });
  return { tot, done };
}

function drawTicks() {
  const svg = document.getElementById("tapeTicks");
  if (!svg) return;
  const w = svg.clientWidth || 900;
  svg.setAttribute("viewBox", "0 0 " + w + " 26");
  let s = "";
  for (let x = 0; x <= w; x += 10) {
    const big = (x % 50 === 0);
    s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + (big ? 12 : 6) + '" stroke="#000" stroke-opacity="' + (big ? .45 : .2) + '" stroke-width="1"/>';
  }
  svg.innerHTML = s;
}

function updateProgress() {
  const { tot, done } = activeFields();
  const pct = tot ? Math.round(done / tot * 100) : 0;
  const fill = document.getElementById("tapeFill");
  const label = document.getElementById("tapeLabel");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = done + " / " + tot + " " + I18N.t("tapeCompiled") + " (" + pct + "%)";
}

// ===================== THEME MANAGER (System / Light / Dark) =====================
const THEME_MANAGER = {
  theme: "system", // "system" | "light" | "dark"
  mediaQuery: window.matchMedia("(prefers-color-scheme: dark)"),

  init() {
    try {
      const saved = localStorage.getItem("vlft_theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        this.theme = saved;
      } else {
        // First arrival from landing or external link: check ?theme=
        const urlParam = new URLSearchParams(window.location.search).get("theme");
        if (urlParam === "light" || urlParam === "dark" || urlParam === "system") {
          this.theme = urlParam;
          try { localStorage.setItem("vlft_theme", urlParam); } catch (e) {}
        } else {
          this.theme = "system";
        }
      }
    } catch (e) {
      this.theme = "system";
    }

    this.apply();
    this.mediaQuery.addEventListener("change", () => {
      if (this.theme === "system") {
        this.apply();
      }
    });

    document.getElementById("themeSystem")?.addEventListener("click", () => this.setTheme("system"));
    document.getElementById("themeLight")?.addEventListener("click", () => this.setTheme("light"));
    document.getElementById("themeDark")?.addEventListener("click", () => this.setTheme("dark"));
  },

  setTheme(theme) {
    if (theme !== "system" && theme !== "light" && theme !== "dark") return;
    this.theme = theme;
    try {
      localStorage.setItem("vlft_theme", theme);
    } catch (e) {}
    this.apply();
  },

  apply() {
    const isDark = this.theme === "dark" || (this.theme === "system" && this.mediaQuery.matches);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    const btnSys = document.getElementById("themeSystem");
    const btnLight = document.getElementById("themeLight");
    const btnDark = document.getElementById("themeDark");

    if (btnSys && btnLight && btnDark) {
      btnSys.setAttribute("aria-pressed", String(this.theme === "system"));
      btnLight.setAttribute("aria-pressed", String(this.theme === "light"));
      btnDark.setAttribute("aria-pressed", String(this.theme === "dark"));

      btnSys.title = I18N.t("themeSystem") || "System theme";
      btnLight.title = I18N.t("themeLight") || "Light theme";
      btnDark.title = I18N.t("themeDark") || "Dark theme";
    }

    if (typeof drawTicks === "function") {
      drawTicks();
    }
    if (typeof updateCockpitSim === "function") {
      updateCockpitSim();
    }
    if (typeof renderDiagnostics === "function" && document.getElementById("tab-diagnostics")?.classList.contains("active")) {
      renderDiagnostics();
    }
  }
};

// ===================== I18N UI TEXT BINDINGS =====================
function applyLanguage() {
  const isEn = I18N.currentLang === "en";
  document.documentElement.lang = I18N.currentLang;

  document.getElementById("langIT")?.setAttribute("aria-pressed", String(!isEn));
  document.getElementById("langEN")?.setAttribute("aria-pressed", String(isEn));

  const btnSys = document.getElementById("themeSystem");
  const btnLight = document.getElementById("themeLight");
  const btnDark = document.getElementById("themeDark");
  if (btnSys && btnLight && btnDark) {
    btnSys.title = I18N.t("themeSystem");
    btnLight.title = I18N.t("themeLight");
    btnDark.title = I18N.t("themeDark");
  }

  const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = I18N.t(key); };
  setTxt("txtKicker", "kicker");
  setTxt("txtBrandTitle", "brandTitle");
  setTxt("txtMenuLabel", "menuActions");
  setTxt("txtProfilesGroupTitle", "txtProfilesGroupTitle");
  setTxt("txtBtnNewProfile", "txtBtnNewProfile");
  setTxt("txtBtnDuplicateProfile", "txtBtnDuplicateProfile");
  updateActiveProfileBadge();
  setTxt("txtMenuSecData", "menuSecData");
  setTxt("txtMenuItemSample", "menuItemSample");
  setTxt("txtMenuItemImport", "menuItemImport");
  setTxt("txtMenuItemPhoto", "txtMenuItemPhoto");
  setTxt("txtMenuItemBikePhoto", "txtMenuItemBikePhoto");
  setTxt("txtMenuItemSitBone", "txtMenuItemSitBone");
  setTxt("txtMenuItemFootFlare", "txtMenuItemFootFlare");
  setTxt("txtMenuSecExport", "menuSecExport");
  setTxt("txtMenuItemExportMd", "menuItemExportMd");
  setTxt("txtMenuItemExportJson", "menuItemExportJson");
  setTxt("txtMenuItemCopy", "menuItemCopy");
  setTxt("txtMenuItemReset", "menuItemReset");

  setTxt("tabNavForm", "tabForm");
  setTxt("tabNavVideo", "tabVideo");
  setTxt("tabNavDiag", "tabDiagnostics");
  setTxt("tabNavCalc", "tabCalculator");
  setTxt("tabNavComp", "tabComparison");
  setTxt("tabNavGloss", "tabGlossary");

  setTxt("mRapido", "modeRapid");
  setTxt("mCompleta", "modeComplete");
  setTxt("expandAll", "btnExpandAll");

  setTxt("btnUploadVideo", "btnUploadVideo");
  setTxt("btnVideoTabOpenPhoto", "btnVideoTabOpenPhoto");
  setTxt("btnVideoTabBikePhoto", "btnVideoTabBikePhoto");
  setTxt("btnPlayDemo", "btnPlayDemo");
  setTxt("btnRecordVideo", "btnRecordVideo");
  setTxt("btnDownloadClip", "btnDownloadRecordedVideo");
  setTxt("lblCamModeTxt", "camModeLabel");
  setTxt("lblViewModeTxt", "lblViewMode");
  setTxt("lblSideTxt", "lblSide");
  setTxt("btnSeekBDC", "btnSeekBDC");
  setTxt("btnCaptureSnapshot", "btnSnapshot");
  setTxt("btnSaveAnglesToForm", "btnSaveAngles");
  setTxt("countdownLabel", "countdownGetReady");
  setTxt("btnStopRecImmediate", "statusStop");
  setTxt("camWarningText", "camWarningNonPerp");

  const camModeSelect = document.getElementById("camModeSelect");
  if (camModeSelect && camModeSelect.options.length >= 2) {
    camModeSelect.options[0].text = I18N.t("camModeRiderOnBike");
    camModeSelect.options[1].text = I18N.t("camModeBikeOnly");
  }

  const viewModeSelect = document.getElementById("viewModeSelect");
  if (viewModeSelect && viewModeSelect.options.length >= 2) {
    viewModeSelect.options[0].text = I18N.t("optLateral");
    viewModeSelect.options[1].text = I18N.t("optFrontal");
  }

  const sideSelect = document.getElementById("sideSelect");
  if (sideSelect && sideSelect.options.length >= 3) {
    sideSelect.options[0].text = I18N.t("optSideAuto");
    sideSelect.options[1].text = I18N.t("optSideRight");
    sideSelect.options[2].text = I18N.t("optSideLeft");
  }

  // Photo modal translations
  setTxt("photoModalTitle", "photoWizardTitle");
  setTxt("photoModalSub", "photoWizardSub");
  setTxt("lblPhotoHeightPrompt", "photoHeightPrompt");
  setTxt("lblPhotoHeightHelp", "photoHeightHelp");
  setTxt("lblPhotoInstTitle", "photoInstructionsTitle");
  setTxt("lblPhotoPrivacy", "photoPrivacyNote");
  setTxt("btnUploadPhotoFile", "btnUploadPhoto");
  setTxt("btnStartPhotoCam", "btnStartPhotoCam");
  setTxt("btnTriggerPhotoSnap", "btnTriggerPhotoSnap");
  setTxt("btnCancelPhotoCam", "btnCancel");
  setTxt("lblPhotoProcessing", "photoProcessing");
  setTxt("lblPhotoDetectedTitle", "photoDetectedTitle");
  setTxt("lblPhotoResCavallo", "photoInseamLbl");
  setTxt("lblPhotoResFemore", "photoFemurLbl");
  setTxt("lblPhotoResTibia", "photoTibiaLbl");
  setTxt("lblPhotoResBusto", "photoTorsoLbl");
  setTxt("lblPhotoResBraccio", "photoArmLbl");
  setTxt("lblPhotoResSpalle", "photoShoulderLbl");
  setTxt("lblPhotoSitBonesNote", "photoSitBonesNote");
  setTxt("btnRetakePhoto", "btnRetakePhotoFull");
  setTxt("btnCancelPhotoWizard", "btnCancel");
  setTxt("btnApplyPhotoMeasurements", "btnApplyPhotoMeasurements");

  const pInst1 = document.getElementById("lblPhotoInst1");
  if (pInst1) pInst1.innerHTML = I18N.t("photoInstruction1");
  const pInst2 = document.getElementById("lblPhotoInst2");
  if (pInst2) pInst2.innerHTML = I18N.t("photoInstruction2");
  const pInst3 = document.getElementById("lblPhotoInst3");
  if (pInst3) pInst3.innerHTML = I18N.t("photoInstruction3");

  // Bike photo modal translations
  setTxt("bikePhotoModalTitle", "bikePhotoWizardTitle");
  setTxt("bikePhotoModalSub", "bikePhotoWizardSub");
  setTxt("lblBikePhotoWheelPreset", "bikePhotoWheelPresetLabel");
  setTxt("lblBikePhotoInstTitle", "bikePhotoInstTitle");
  setTxt("btnUploadBikePhotoFile", "btnUploadBikePhoto");
  setTxt("btnStartBikePhotoCam", "btnStartBikePhotoCam");
  setTxt("btnTriggerBikePhotoSnap", "btnTriggerSnap");
  setTxt("btnCancelBikePhotoCam", "btnCancel");
  setTxt("lblBikeLiveTitle", "lblBikeLiveTitle");
  setTxt("lblBikeMetricHs", "bikePhotoSaddleHeightLbl");
  setTxt("lblBikeMetricSb", "bikePhotoSetbackLbl");
  setTxt("lblBikeMetricDrop", "bikePhotoDropLbl");
  setTxt("lblBikeMetricReach", "bikePhotoReachLbl");
  setTxt("lblBikeMetricTilt", "bikePhotoTiltLbl");
  setTxt("lblBikeMetricWb", "bikePhotoWheelbaseLbl");
  setTxt("lblBikeMetricStack", "bikePhotoStackLbl");
  setTxt("lblBikeMetricFReach", "bikePhotoFReachLbl");
  setTxt("lblBikeMetricRatio", "bikePhotoRatioLbl");
  setTxt("lblBikeMetricSpacers", "bikePhotoSpacersLbl");
  setTxt("btnRetakeBikePhoto", "btnRetakePhoto");
  setTxt("btnCancelBikePhotoWizard", "btnCancel");
  setTxt("btnApplyBikePhotoMeasurements", "bikePhotoApplyBtn");

  const bInst1 = document.getElementById("lblBikePhotoInst1");
  if (bInst1) bInst1.innerHTML = I18N.t("bikePhotoInst1");
  const bInst2 = document.getElementById("lblBikePhotoInst2");
  if (bInst2) bInst2.innerHTML = I18N.t("bikePhotoInst2");

  const wheelPresetSelect = document.getElementById("bikeWheelPresetSelect");
  if (wheelPresetSelect && wheelPresetSelect.options.length >= 4) {
    wheelPresetSelect.options[0].text = I18N.t("optWheel700c");
    wheelPresetSelect.options[1].text = I18N.t("optWheel29");
    wheelPresetSelect.options[2].text = I18N.t("optWheel650b");
    wheelPresetSelect.options[3].text = I18N.t("optWheel26");
  }

  // Sit-bone modal translations
  setTxt("sitBoneModalTitle", "sitBoneModalTitle");
  setTxt("sitBoneModalSub", "sitBoneModalSub");
  setTxt("lblSitBoneInstTitle", "lblSitBoneInstTitle");
  setTxt("btnUploadSitBoneFile", "btnUploadSitBoneFile");
  setTxt("btnStartSitBoneCam", "btnStartSitBoneCam");
  setTxt("btnTriggerSitBoneSnap", "btnTriggerSnap");
  setTxt("btnCancelSitBoneCam", "btnCancel");
  setTxt("lblSitBoneHeaderTitle", "lblSitBoneHeaderTitle");
  setTxt("lblSitBoneDist", "lblSitBoneDist");
  setTxt("lblSitBoneRoad", "lblSitBoneRoad");
  setTxt("lblSitBoneEndurance", "lblSitBoneEndurance");
  setTxt("lblSitBoneMtb", "lblSitBoneMtb");
  setTxt("btnRetakeSitBone", "btnRetakePhoto");
  setTxt("btnCancelSitBoneWizard", "btnCancel");
  setTxt("btnApplySitBoneMeasurements", "btnApplySitBoneMeasurements");

  const sInst1 = document.getElementById("lblSitBoneInst1");
  if (sInst1) sInst1.innerHTML = I18N.t("lblSitBoneInst1");
  const sInst2 = document.getElementById("lblSitBoneInst2");
  if (sInst2) sInst2.innerHTML = I18N.t("lblSitBoneInst2");
  const sInst3 = document.getElementById("lblSitBoneInst3");
  if (sInst3) sInst3.innerHTML = I18N.t("lblSitBoneInst3");

  // Foot flare modal translations
  setTxt("footFlareModalTitle", "footFlareModalTitle");
  setTxt("footFlareModalSub", "footFlareModalSub");
  setTxt("lblFootFlareInstTitle", "lblFootFlareInstTitle");
  setTxt("btnUploadFootFlareFile", "btnUploadFootFlareFile");
  setTxt("btnStartFootFlareCam", "btnStartFootFlareCam");
  setTxt("btnTriggerFootFlareSnap", "btnTriggerSnap");
  setTxt("btnCancelFootFlareCam", "btnCancel");
  setTxt("lblFootFlareHeaderTitle", "lblFootFlareHeaderTitle");
  setTxt("lblFootAngleL", "lblFootAngleL");
  setTxt("lblFootAngleR", "lblFootAngleR");
  setTxt("lblFootAsym", "lblFootAsym");
  setTxt("lblFootRecFloat", "lblFootRecFloat");
  setTxt("btnRetakeFootFlare", "btnRetakePhoto");
  setTxt("btnCancelFootFlareWizard", "btnCancel");
  setTxt("btnApplyFootFlareMeasurements", "btnApplyFootFlareMeasurements");

  const fInst1 = document.getElementById("lblFootFlareInst1");
  if (fInst1) fInst1.innerHTML = I18N.t("lblFootFlareInst1");
  const fInst2 = document.getElementById("lblFootFlareInst2");
  if (fInst2) fInst2.innerHTML = I18N.t("lblFootFlareInst2");
  const fInst3 = document.getElementById("lblFootFlareInst3");
  if (fInst3) fInst3.innerHTML = I18N.t("lblFootFlareInst3");

  // Glossary headers
  setTxt("glossaryTitleHeading", "glossaryTitle");
  setTxt("glossaryNoteHeading", "glossaryNote");

  const tipEl = document.getElementById("videoTipText");
  if (tipEl) tipEl.innerHTML = I18N.t("videoTip");

  setTxt("lblMetricKnee", "metricKneeBDC");
  setTxt("lblMetricKneeTarget", "metricKneeTarget");
  setTxt("lblMetricCadence", "metricCadence");
  setTxt("lblMetricCadenceSub", "metricCadenceSub");
  setTxt("lblMetricTorso", "metricTorso");
  setTxt("lblMetricTorsoTarget", "metricTorsoTarget");
  setTxt("lblMetricShoulder", "metricShoulder");
  setTxt("lblMetricShoulderTarget", "metricShoulderTarget");
  setTxt("lblMetricElbow", "metricElbow");
  setTxt("lblMetricElbowTarget", "metricElbowTarget");
  setTxt("lblMetricHip", "metricHipTDC");
  setTxt("lblMetricHipTarget", "metricHipTarget");
  setTxt("lblMetricFrontAlign", "metricFrontalAlign");
  setTxt("lblMetricFrontTarget", "metricFrontalTarget");
  setTxt("lblMetricFrontDev", "metricFrontalDev");
  setTxt("lblMetricFrontDevSub", "metricFrontalDevSub");

  setTxt("diagTitleText", "diagTitle");
  setTxt("btnCopyActionPlan", "btnCopyPlan");
  setTxt("btnApplyPlanToLog", "btnApplyToLog");
  setTxt("diagSec1Title", "diagSectionIssues");
  setTxt("diagSec2Title", "diagSectionPlan");
  setTxt("diagSec2Note", "diagPlanNote");

  setTxt("calcSec1Heading", "calcSection1");
  setTxt("calcSec1NoteTxt", "calcSec1Note");
  setTxt("lblCalcInseam", "calcInseamLbl");
  setTxt("lblCalcHeight", "calcHeightLbl");
  setTxt("lblCalcCrank", "calcCrankLbl");
  setTxt("lblCalcSaddle", "calcSaddleLbl");
  setTxt("thCalcMethod", "calcMethodCol");
  setTxt("thCalcFormula", "calcFormulaCol");
  setTxt("thCalcVal", "calcValCol");
  setTxt("thCalcComp", "calcCompCol");
  setTxt("txtLemondName", "calcLemondName");
  setTxt("txtHamleyName", "calcHamleyName");
  setTxt("txtRangeName", "calcRangeName");
  setTxt("txtHolmesName", "calcHolmesName");
  setTxt("btnApplyCalculatedSaddle", "btnApplySaddle");

  setTxt("calcSec2Heading", "calcSection2");
  setTxt("calcSec2NoteTxt", "calcSec2Note");
  setTxt("calcSec2IntroTxt", "calcSec2Intro");
  setTxt("lblSimHeadAngle", "simHeadAngle");
  setTxt("lblSimCurSetup", "simCurrentSetup");
  setTxt("lblSimPropSetup", "simProposedSetup");
  setTxt("lblSimCurSpacers", "simSpacers");
  setTxt("lblSimCurStemLen", "simStemLen");
  setTxt("lblSimCurStemAngle", "simStemAngle");
  setTxt("lblSimCurBarReach", "simBarReach");
  setTxt("lblSimCurBarDrop", "simBarDrop");
  setTxt("lblSimPropSpacers", "simSpacers");
  setTxt("lblSimPropStemLen", "simStemLen");
  setTxt("lblSimPropStemAngle", "simStemAngle");
  setTxt("lblSimPropBarReach", "simBarReach");
  setTxt("lblSimPropBarDrop", "simBarDrop");
  setTxt("lblDeltaReachTxt", "simDeltaReachLbl");
  setTxt("lblDeltaStackTxt", "simDeltaStackLbl");

  setTxt("dualTitleHeading", "dualTitle");
  setTxt("dualNoteTxt", "dualNote");
  setTxt("lblDualV1", "dualVideo1Lbl");
  setTxt("lblDualV2", "dualVideo2Lbl");
  setTxt("btnDualPlayPause", "btnDualPlay");
  setTxt("btnDualSyncBDC", "btnDualSync");

  setTxt("importModalTitle", "importTitle");
  setTxt("importDropMain", "importDropText");
  setTxt("importDropSubTxt", "importDropSub");
  setTxt("importPasteLabel", "importPasteLbl");
  setTxt("btnProcessImport", "btnProcessImport");
  setTxt("btnImportLoadSample", "menuItemSample");

  // Camera Permission Guide & Native Capture Buttons
  setTxt("lblCamGuideTitle", "lblCamGuideTitle");
  setTxt("lblCamBlockedTitle", "lblCamBlockedTitle");
  setTxt("lblCamBlockedDesc", "lblCamBlockedDesc");
  setTxt("lblCamHowToTitle", "lblCamHowToTitle");
  setTxt("lblCamGuideIosTitle", "lblCamGuideIosTitle");
  setTxt("lblCamGuideIos1", "lblCamGuideIos1");
  setTxt("lblCamGuideIos2", "lblCamGuideIos2");
  setTxt("lblCamGuideIos3", "lblCamGuideIos3");
  setTxt("lblCamGuideAndroidTitle", "lblCamGuideAndroidTitle");
  setTxt("lblCamGuideAndroid1", "lblCamGuideAndroid1");
  setTxt("lblCamGuideAndroid2", "lblCamGuideAndroid2");
  setTxt("lblCamGuideAndroid3", "lblCamGuideAndroid3");
  setTxt("lblCamGuideDesktopTitle", "lblCamGuideDesktopTitle");
  setTxt("lblCamGuideDesktopDesc", "lblCamGuideDesktopDesc");
  setTxt("btnCamGuideClose", "btnCamGuideClose");
  setTxt("btnCamGuideRetry", "btnCamGuideRetry");
  setTxt("btnCamGuideNative", "btnCamGuideNative");

  setTxt("btnNativePhotoCam", "btnNativePhotoCam");
  setTxt("btnNativeBikePhotoCam", "btnNativePhotoCam");
  setTxt("btnNativeSitBoneCam", "btnNativePhotoCam");
  setTxt("btnNativeFootFlareCam", "btnNativePhotoCam");

  renderForm();
  renderGlossary();
  renderDiagnostics();
  updateStaticCalculator();
  updateCockpitSimulation();
}

// ===================== DIAGNOSTIC & ACTION PLAN CONTROLLER =====================
function initDiagnosticsModule() {
  document.getElementById("btnCopyActionPlan")?.addEventListener("click", () => {
    const res = getDiagnosticResult();
    if (!res || !res.actionPlan.length) {
      alert(I18N.t("diagNoIssues"));
      return;
    }
    const isEn = I18N.currentLang === "en";
    let txt = isEn ? `# BIOMECHANICAL ACTION PLAN (BIKE FIT PRO)\nDiscipline: ${res.disciplineName}\nFitness Index: ${res.score}%\n\n` : `# PIANO DI INTERVENTO BIOMECCANICO (BIKE FIT PRO)\nDisciplina: ${res.disciplineName}\nIndice di Idoneità: ${res.score}%\n\n`;
    res.actionPlan.forEach((act, idx) => {
      txt += `## ${isEn ? "Step" : "Passo"} ${idx + 1} [${act.priority.toUpperCase()}]: ${act.action}\n`;
      txt += `- ${I18N.t("diagCurrent")} ${act.current}\n`;
      txt += `- ${I18N.t("diagTarget")} ${act.target}\n`;
      txt += `- ${act.reason}\n\n`;
    });
    navigator.clipboard.writeText(txt).then(() => {
      setStatusBadge(I18N.t("statusPlanCopied"));
    });
  });

  document.getElementById("btnApplyPlanToLog")?.addEventListener("click", () => {
    const res = getDiagnosticResult();
    if (!res || !res.actionPlan.length) return;
    const today = new Date().toLocaleDateString(I18N.currentLang === "en" ? "en-US" : "it-IT");
    res.actionPlan.forEach(act => {
      state.log.push([today, act.action, act.current, act.target, I18N.currentLang === "en" ? "Trial (3 rides)" : "In prova (3 uscite)"]);
    });
    queueSave();
    renderForm();
    alert("✅ " + (I18N.currentLang === "en" ? "Action steps added to Fit Modification Log!" : "Proposte di modifica inserite nel Registro Modifiche!"));
  });

  renderDiagnostics();
}

function getDiagnosticResult() {
  if (typeof WasmBikeFit !== 'undefined' && WasmBikeFit.isReady) {
    return WasmBikeFit.analyzeFit(state, I18N.currentLang);
  }
  if (typeof DiagnosticEngine !== 'undefined') {
    return DiagnosticEngine.analyzeFit(state);
  }
  return null;
}

function renderDiagnostics() {
  const res = getDiagnosticResult();
  if (!res) return;

  const isEn = I18N.currentLang === "en";
  const scoreCircle = document.getElementById("diagScoreCircle");
  const diagSummaryText = document.getElementById("diagSummaryText");
  const highBadge = document.getElementById("diagHighCount");
  const medBadge = document.getElementById("diagMedCount");

  if (scoreCircle) {
    scoreCircle.textContent = `${res.score}%`;
    if (res.score >= 80) scoreCircle.style.background = "#10B981";
    else if (res.score >= 50) scoreCircle.style.background = "#F59E0B";
    else scoreCircle.style.background = "#EF4444";
  }

  if (highBadge) highBadge.textContent = `${res.highPriorityCount} ${I18N.t("diagCritical")}`;
  if (medBadge) medBadge.textContent = `${res.mediumPriorityCount} ${I18N.t("diagModerate")}`;

  if (diagSummaryText) {
    if (res.totalIssues === 0) {
      diagSummaryText.textContent = I18N.t("diagNoIssues");
    } else {
      diagSummaryText.textContent = isEn ? `Setup for [${res.disciplineName}]: Found ${res.totalIssues} biomechanical points of attention. Follow the step-by-step action plan.` : `Assetto per [${res.disciplineName}]: Rilevati ${res.totalIssues} punti di attenzione biomeccanica. Segui il piano d'azione ordinato.`;
    }
  }

  // Issues List
  const issuesContainer = document.getElementById("diagIssuesContainer");
  if (issuesContainer) {
    issuesContainer.innerHTML = "";
    if (res.issues.length === 0) {
      issuesContainer.innerHTML = `<div style="padding:14px; color:var(--muted); font-size:13px;">${I18N.t("diagNoIssues")}</div>`;
    } else {
      res.issues.forEach(iss => {
        const d = document.createElement("div");
        d.className = `diag-issue-card priority-${iss.priority}`;
        d.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; font-family:var(--mono); text-transform:uppercase; font-weight:700; color:var(--muted);">${iss.area}</span>
            <span class="pri" style="background:${iss.priority === 'alta' ? 'var(--danger-soft)' : 'var(--warn-soft)'}; color:${iss.priority === 'alta' ? '#F87171' : '#FBBF24'}; border-color:${iss.priority === 'alta' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'};">${iss.priority.toUpperCase()}</span>
          </div>
          <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:var(--ink);">${iss.title}</div>
          <p style="font-size:12.5px; color:var(--ink-2); margin-bottom:8px; line-height:1.45;">${iss.details}</p>
          <div class="diag-rec-box">
            <b>${I18N.t("diagAction")}</b> ${iss.recommendation}
          </div>
        `;
        issuesContainer.appendChild(d);
      });
    }
  }

  // 1-2-3 Action Plan List
  const planContainer = document.getElementById("diagActionPlanContainer");
  if (planContainer) {
    planContainer.innerHTML = "";
    if (res.actionPlan.length === 0) {
      planContainer.innerHTML = `<div style="padding:14px; color:var(--muted); font-size:13px;">${I18N.t("diagNoIssues")}</div>`;
    } else {
      res.actionPlan.forEach((act, idx) => {
        const c = document.createElement("div");
        c.className = "action-step-card";
        c.innerHTML = `
          <div class="action-step-num">${idx + 1}</div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
              <div style="font-weight:700; font-size:14px; color:var(--ink);">${act.action}</div>
              <span class="tag">${act.category}</span>
            </div>
            <div style="display:flex; gap:16px; font-size:12px; font-family:var(--mono); color:var(--ink-2); margin-bottom:6px;">
              <div>${I18N.t("diagCurrent")} <b style="color:var(--danger);">${act.current}</b></div>
              <div>${I18N.t("diagTarget")} <b style="color:var(--ok);">${act.target}</b></div>
            </div>
            <p style="font-size:12.5px; color:var(--muted); margin:0;">${act.reason}</p>
          </div>
        `;
        planContainer.appendChild(c);
      });
    }
  }
}

// ===================== VIDEO & AI POSE CONTROLLER =====================
function initVideoModule() {
  const video = document.getElementById("videoPlayer");
  const canvas = document.getElementById("poseCanvas");
  if (!video || !canvas) return;

  poseEngine = new BikeFitPoseEngine(canvas, video);
  poseEngine.initPose();

  const fileInput = document.getElementById("videoFileInput");
  const btnUpload = document.getElementById("btnUploadVideo");
  const btnCamera = document.getElementById("btnToggleCamera");
  const btnDemo = document.getElementById("btnPlayDemo");
  const btnPlay = document.getElementById("btnPlayPause");
  const scrubber = document.getElementById("videoScrubber");
  const timeDisplay = document.getElementById("timeDisplay");
  const sideSelect = document.getElementById("sideSelect");
  const viewModeSelect = document.getElementById("viewModeSelect");
  const bannerInput = document.getElementById("bannerTextInput");
  const btnSnapshot = document.getElementById("btnCaptureSnapshot");
  const btnSaveToForm = document.getElementById("btnSaveAnglesToForm");
  const btnStepFwd = document.getElementById("btnStepForward");
  const btnStepBwd = document.getElementById("btnStepBackward");
  const btnSeekBDC = document.getElementById("btnSeekBDC");
  const btnRec = document.getElementById("btnRecordVideo");
  const btnStopRec = document.getElementById("btnStopRecImmediate");
  const btnDl = document.getElementById("btnDownloadClip");
  const camModeSelect = document.getElementById("camModeSelect");

  if (camModeSelect) {
    camModeSelect.addEventListener("change", (e) => {
      if (poseEngine) poseEngine.setCameraMode(e.target.value);
    });
  }

  if (btnRec) {
    btnRec.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    });
  }

  if (btnStopRec) {
    btnStopRec.addEventListener("click", () => {
      stopVideoRecording();
    });
  }

  if (btnDl) {
    btnDl.addEventListener("click", () => {
      downloadRecordedClip();
    });
  }

  if (poseEngine) {
    poseEngine.onDiagnosticsChange = (diag) => {
      const warnBar = document.getElementById("camWarningBar");
      const warnTxt = document.getElementById("camWarningText");
      if (!warnBar || !warnTxt) return;
      if (diag.warningText && diag.warningKey !== "camStatusReadyToRecord") {
        warnTxt.textContent = diag.warningText;
        warnBar.style.display = "flex";
      } else {
        warnBar.style.display = "none";
      }
    };
  }

  if (btnUpload && fileInput) {
    btnUpload.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        stopWebcam();
        stopDemo();
        const url = URL.createObjectURL(e.target.files[0]);
        video.src = url;
        video.load();
        video.onloadeddata = () => {
          canvas.width = video.videoWidth || 800;
          canvas.height = video.videoHeight || 600;
          poseEngine.startLoop();
          poseEngine.setBannerText(bannerInput.value || "VIDEO ANALYSIS");
          video.play();
        };
      }
    });
  }

  if (btnCamera) {
    btnCamera.addEventListener("click", async () => {
      stopDemo();
      if (webcamStream) {
        stopWebcam();
        btnCamera.textContent = I18N.t("btnToggleCamOn");
      } else {
        const started = await startWebcam();
        if (started) btnCamera.textContent = I18N.t("btnToggleCamOff");
      }
    });
  }

  if (btnDemo) {
    btnDemo.addEventListener("click", () => {
      stopWebcam();
      startDemoLoop();
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        btnPlay.textContent = I18N.t("btnPause");
      } else {
        video.pause();
        btnPlay.textContent = I18N.t("btnPlay");
      }
    });
  }

  if (btnStepFwd) {
    btnStepFwd.addEventListener("click", () => {
      video.pause();
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 0.033);
      poseEngine.processFrame();
    });
  }
  if (btnStepBwd) {
    btnStepBwd.addEventListener("click", () => {
      video.pause();
      video.currentTime = Math.max(0, video.currentTime - 0.033);
      poseEngine.processFrame();
    });
  }

  if (btnSeekBDC) {
    btnSeekBDC.addEventListener("click", () => {
      if (poseEngine.pedalCycle.strokes.length > 0) {
        const lastStroke = poseEngine.pedalCycle.strokes[poseEngine.pedalCycle.strokes.length - 1];
        video.pause();
        video.currentTime = lastStroke.bdcTime;
        poseEngine.processFrame();
        setStatusBadge(`BDC: ${lastStroke.bdcKnee}°`);
      } else {
        alert(I18N.currentLang === "en" ? "Pedal for 2 more seconds to detect cadence and BDC." : "Pedala ancora qualche secondo per rilevare la cadenza e il punto BDC.");
      }
    });
  }

  if (video && scrubber) {
    video.addEventListener("timeupdate", () => {
      if (video.duration) {
        scrubber.value = (video.currentTime / video.duration) * 100;
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }
      updateMetricsDashboard();
    });

    scrubber.addEventListener("input", () => {
      if (video.duration) {
        video.currentTime = (scrubber.value / 100) * video.duration;
      }
    });
  }

  if (viewModeSelect) {
    viewModeSelect.addEventListener("change", () => {
      poseEngine.setViewMode(viewModeSelect.value);
      const isFrontal = viewModeSelect.value === 'frontal';
      document.getElementById("lateralMetrics")?.classList.toggle("hidden", isFrontal);
      document.getElementById("frontalMetrics")?.classList.toggle("hidden", !isFrontal);
      poseEngine.render();
    });
  }

  if (sideSelect) {
    sideSelect.addEventListener("change", () => {
      poseEngine.setSide(sideSelect.value);
    });
  }

  if (bannerInput) {
    bannerInput.addEventListener("input", () => {
      poseEngine.setBannerText(bannerInput.value);
      poseEngine.render();
    });
  }

  if (btnSnapshot) {
    btnSnapshot.addEventListener("click", () => {
      const dataUrl = poseEngine.captureSnapshotPNG();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `bikefit-snapshot-${Date.now()}.png`;
      a.click();
      setStatusBadge(I18N.t("statusSnapshotSaved"));
    });
  }

  if (btnSaveToForm) {
    btnSaveToForm.addEventListener("click", () => {
      const a = poseEngine.angles;
      state.videoAngles = {
        kneeBDC: poseEngine.pedalCycle.medianBdcKnee || poseEngine.stats.kneeMax || a.knee,
        kneeTDC: poseEngine.stats.kneeMin || 70,
        torso: a.torso,
        shoulder: a.shoulder,
        elbow: a.elbow,
        hipTDC: a.hipTDC,
        ankle: a.ankle
      };
      const today = new Date().toLocaleDateString(I18N.currentLang === "en" ? "en-US" : "it-IT");
      state.log.push([
        today,
        "Video pose tracking",
        "-",
        `Knee BDC ${state.videoAngles.kneeBDC}°, Torso ${state.videoAngles.torso}°, Shoulder ${state.videoAngles.shoulder}°`,
        "Recorded via video"
      ]);
      queueSave();
      renderForm();
      renderDiagnostics();
      alert(I18N.currentLang === "en" ? "✅ Joint angles saved into data sheet and diagnostics!" : "✅ Angoli articolari inseriti con successo nel dossier e nella diagnosi!");
    });
  }

  document.querySelectorAll("[data-speed]").forEach(btn => {
    btn.addEventListener("click", () => {
      const spd = parseFloat(btn.dataset.speed);
      video.playbackRate = spd;
      document.querySelectorAll("[data-speed]").forEach(b => b.classList.remove("btn-solid"));
      btn.classList.add("btn-solid");
    });
  });
}

function formatTime(secs) {
  if (isNaN(secs)) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function startWebcam() {
  const video = document.getElementById("videoPlayer");
  const canvas = document.getElementById("poseCanvas");
  const btnRec = document.getElementById("btnRecordVideo");
  try {
    webcamStream = await requestCameraStream("environment", { width: { ideal: 1280 }, height: { ideal: 720 } });
    await attachStreamToVideo(video, webcamStream);
    const setupCanvas = () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      if (poseEngine) {
        poseEngine.setLiveCameraActive(true);
        poseEngine.startLoop();
        poseEngine.setBannerText("LIVE CAM");
      }
      if (btnRec) btnRec.style.display = "inline-block";
    };
    video.onloadedmetadata = setupCanvas;
    if (video.videoWidth > 0) setupCanvas();
    return true;
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      showCameraPermissionGuide(startWebcam);
    } else {
      alert(getCameraErrorMessage(err));
    }
    return false;
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
    const video = document.getElementById("videoPlayer");
    if (video) video.srcObject = null;
  }
  if (poseEngine) {
    poseEngine.setLiveCameraActive(false);
  }
  const btnRec = document.getElementById("btnRecordVideo");
  if (btnRec) btnRec.style.display = "none";
  const recBadge = document.getElementById("recBadge");
  if (recBadge) recBadge.style.display = "none";
  const warnBar = document.getElementById("camWarningBar");
  if (warnBar) warnBar.style.display = "none";
}

// ===================== IN-APP VIDEO RECORDING & AUDIO SYNTH =====================
let mediaRecorder = null;
let recordedChunks = [];
let recCountdownTimer = null;
let recDurationTimer = null;
let recSecondsElapsed = 0;
let lastRecordedBlobUrl = null;
let audioCtx = null;

function playSynthBeep(freq = 440, durationMs = 120) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
  } catch (e) {}
}

function startVideoRecording() {
  if (!webcamStream) {
    startWebcam();
    return;
  }

  const overlay = document.getElementById("countdownOverlay");
  const numEl = document.getElementById("countdownNumber");
  const labelEl = document.getElementById("countdownLabel");
  const btnRec = document.getElementById("btnRecordVideo");

  if (overlay && numEl) {
    overlay.style.display = "flex";
    let countdown = 5;
    numEl.textContent = countdown;
    if (labelEl) labelEl.textContent = I18N.t("countdownGetReady");
    playSynthBeep(440, 150);

    clearInterval(recCountdownTimer);
    recCountdownTimer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        numEl.textContent = countdown;
        playSynthBeep(440, 150);
      } else {
        clearInterval(recCountdownTimer);
        overlay.style.display = "none";
        playSynthBeep(880, 300);
        beginMediaRecording();
      }
    }, 1000);
  } else {
    beginMediaRecording();
  }
}

function beginMediaRecording() {
  if (!webcamStream) return;
  recordedChunks = [];

  let options = { mimeType: 'video/webm;codecs=vp9' };
  if (!window.MediaRecorder || !MediaRecorder.isTypeSupported(options.mimeType)) {
    options = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/mp4' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {};
      }
    }
  }

  try {
    mediaRecorder = new MediaRecorder(webcamStream, options);
  } catch (e) {
    mediaRecorder = new MediaRecorder(webcamStream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    handleRecordingComplete();
  };

  mediaRecorder.start(100);

  const recBadge = document.getElementById("recBadge");
  const recTimerTxt = document.getElementById("recTimerText");
  const btnRec = document.getElementById("btnRecordVideo");
  if (btnRec) btnRec.textContent = I18N.t("btnStopRecording");
  if (recBadge) recBadge.style.display = "flex";

  recSecondsElapsed = 0;
  if (recTimerTxt) recTimerTxt.textContent = `REC 00:00 / 00:20`;

  clearInterval(recDurationTimer);
  recDurationTimer = setInterval(() => {
    recSecondsElapsed++;
    const s = String(recSecondsElapsed).padStart(2, '0');
    if (recTimerTxt) recTimerTxt.textContent = `REC 00:${s} / 00:20`;

    if (recSecondsElapsed >= 20) {
      stopVideoRecording();
    }
  }, 1000);
}

function stopVideoRecording() {
  clearInterval(recDurationTimer);
  clearInterval(recCountdownTimer);
  const overlay = document.getElementById("countdownOverlay");
  if (overlay) overlay.style.display = "none";

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  const recBadge = document.getElementById("recBadge");
  if (recBadge) recBadge.style.display = "none";
  const btnRec = document.getElementById("btnRecordVideo");
  if (btnRec) btnRec.textContent = I18N.t("btnRecordVideo");
}

function handleRecordingComplete() {
  if (recordedChunks.length === 0) return;
  const mime = (mediaRecorder && mediaRecorder.mimeType) || 'video/webm';
  const blob = new Blob(recordedChunks, { type: mime });
  if (lastRecordedBlobUrl) {
    URL.revokeObjectURL(lastRecordedBlobUrl);
  }
  lastRecordedBlobUrl = URL.createObjectURL(blob);

  // Stop live webcam now that recording is finished
  stopWebcam();
  const btnCam = document.getElementById("btnToggleCamera");
  if (btnCam) btnCam.textContent = I18N.t("btnToggleCamOn");

  const video = document.getElementById("videoPlayer");
  const canvas = document.getElementById("poseCanvas");
  if (video) {
    video.src = lastRecordedBlobUrl;
    video.load();
    video.onloadeddata = () => {
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      poseEngine.startLoop();
      poseEngine.setBannerText("RECORDED FIT");
      video.play();
    };
  }

  const btnDl = document.getElementById("btnDownloadClip");
  if (btnDl) btnDl.style.display = "inline-block";

  setStatusBadge(I18N.t("videoRecordingSaved"));
}

function downloadRecordedClip() {
  if (!lastRecordedBlobUrl) return;
  const a = document.createElement("a");
  a.href = lastRecordedBlobUrl;
  a.download = `velofit-recording-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function initDeviceOrientation() {
  const handleOrientation = (e) => {
    if (poseEngine) {
      poseEngine.updateDeviceOrientation(e.beta, e.gamma, e.alpha);
    }
  };

  if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Permission requestable on iOS
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }
}

// ===================== PHOTO ANTHROPOMETRY WIZARD =====================
let photoCamStream = null;
let photoCamCountdownTimer = null;
let lastPhotoAnalysisResult = null;
let currentPhotoImage = null;

function openPhotoWizard() {
  const modal = document.getElementById("modalPhotoMeasure");
  if (!modal) return;

  const heightInput = document.getElementById("photoKnownHeightInput");
  if (heightInput) {
    heightInput.value = state.v.altezza || 178;
  }

  resetPhotoWizardUI();
  modal.showModal();
}

function closePhotoWizard() {
  stopPhotoCam();
  const modal = document.getElementById("modalPhotoMeasure");
  if (modal) modal.close();
}

function resetPhotoWizardUI() {
  stopPhotoCam();
  document.getElementById("photoStep1Box")?.style.setProperty("display", "block");
  document.getElementById("photoCamContainer")?.style.setProperty("display", "none");
  document.getElementById("photoProcessingIndicator")?.style.setProperty("display", "none");
  document.getElementById("photoResultsContainer")?.style.setProperty("display", "none");
  document.getElementById("photoErrorMsg")?.style.setProperty("display", "none");
  document.getElementById("btnApplyPhotoMeasurements")?.style.setProperty("display", "none");
  lastPhotoAnalysisResult = null;
  currentPhotoImage = null;
}

async function startPhotoCamera() {
  const container = document.getElementById("photoCamContainer");
  const video = document.getElementById("photoCamVideo");
  const countdownOverlay = document.getElementById("photoCamCountdown");
  const countdownNum = document.getElementById("photoCountdownNum");

  try {
    photoCamStream = await requestCameraStream("user", { width: { ideal: 1280 }, height: { ideal: 960 } });
    await attachStreamToVideo(video, photoCamStream);
    if (container) container.style.display = "block";

    if (countdownOverlay && countdownNum) {
      countdownOverlay.style.display = "flex";
      let count = 5;
      countdownNum.textContent = count;
      playSynthBeep(440, 150);

      clearInterval(photoCamCountdownTimer);
      photoCamCountdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownNum.textContent = count;
          playSynthBeep(440, 150);
        } else {
          clearInterval(photoCamCountdownTimer);
          countdownOverlay.style.display = "none";
          playSynthBeep(880, 300);
          capturePhotoSnapshot();
        }
      }, 1000);
    }
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      const nativeInput = document.getElementById("photoNativeCamInput");
      showCameraPermissionGuide(startPhotoCamera, nativeInput);
    } else {
      alert(getCameraErrorMessage(err));
    }
  }
}

function stopPhotoCam() {
  clearInterval(photoCamCountdownTimer);
  if (photoCamStream) {
    photoCamStream.getTracks().forEach(t => t.stop());
    photoCamStream = null;
    const video = document.getElementById("photoCamVideo");
    if (video) video.srcObject = null;
  }
  const container = document.getElementById("photoCamContainer");
  if (container) container.style.display = "none";
}

function capturePhotoSnapshot() {
  const video = document.getElementById("photoCamVideo");
  if (!video) return;

  const snapCanvas = document.createElement("canvas");
  snapCanvas.width = video.videoWidth || 800;
  snapCanvas.height = video.videoHeight || 1000;
  const sCtx = snapCanvas.getContext("2d");
  sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

  stopPhotoCam();

  const img = new Image();
  img.src = snapCanvas.toDataURL("image/jpeg", 0.95);
  img.onload = () => {
    processPhotoForAnthropometry(img);
  };
}

async function processPhotoForAnthropometry(imageElement) {
  currentPhotoImage = imageElement;
  const step1 = document.getElementById("photoStep1Box");
  const spinner = document.getElementById("photoProcessingIndicator");
  const errBox = document.getElementById("photoErrorMsg");
  const resultsContainer = document.getElementById("photoResultsContainer");
  const btnApply = document.getElementById("btnApplyPhotoMeasurements");

  if (step1) step1.style.display = "none";
  if (errBox) errBox.style.display = "none";
  if (spinner) spinner.style.display = "block";

  const heightInput = document.getElementById("photoKnownHeightInput");
  const knownHeight = parseFloat(heightInput?.value) || 178;

  try {
    const result = await poseEngine.analyzePhotoMeasurements(imageElement, knownHeight);
    lastPhotoAnalysisResult = result;

    if (spinner) spinner.style.display = "none";
    if (resultsContainer) resultsContainer.style.display = "block";
    if (btnApply) btnApply.style.display = "inline-block";

    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    setVal("photoResCavallo", result.measurements.cavallo);
    setVal("photoResFemore", result.measurements.femore);
    setVal("photoResTibia", result.measurements.tibia);
    setVal("photoResBusto", result.measurements.busto);
    setVal("photoResBraccio", result.measurements.braccio);
    setVal("photoResSpalle", result.measurements.spalle);

    const manubrioEl = document.getElementById("photoRecManubrioVal");
    if (manubrioEl) manubrioEl.textContent = String(result.measurements.manubrioConsigliato || 420);

    const reviewCanvas = document.getElementById("photoReviewCanvas");
    if (reviewCanvas) {
      poseEngine.renderPhotoAnalysis(reviewCanvas, imageElement, result);
    }
  } catch (err) {
    if (spinner) spinner.style.display = "none";
    if (step1) step1.style.display = "block";
    if (errBox) {
      errBox.style.display = "block";
      errBox.textContent = err.message === "photoErrorNoPerson"
        ? I18N.t("photoErrorNoPerson")
        : `Errore durante l'analisi: ${err.message}`;
    }
  }
}

function applyPhotoMeasurementsToFitSheet() {
  const heightInput = document.getElementById("photoKnownHeightInput");
  const knownHeight = parseFloat(heightInput?.value) || 178;

  const cavallo = parseFloat(document.getElementById("photoResCavallo")?.value) || (lastPhotoAnalysisResult?.measurements.cavallo);
  const femore = parseFloat(document.getElementById("photoResFemore")?.value) || (lastPhotoAnalysisResult?.measurements.femore);
  const tibia = parseFloat(document.getElementById("photoResTibia")?.value) || (lastPhotoAnalysisResult?.measurements.tibia);
  const busto = parseFloat(document.getElementById("photoResBusto")?.value) || (lastPhotoAnalysisResult?.measurements.busto);
  const braccio = parseFloat(document.getElementById("photoResBraccio")?.value) || (lastPhotoAnalysisResult?.measurements.braccio);
  const spalle = parseFloat(document.getElementById("photoResSpalle")?.value) || (lastPhotoAnalysisResult?.measurements.spalle);
  const recManubrio = lastPhotoAnalysisResult?.measurements.manubrioConsigliato;

  // Update state values
  state.v.altezza = String(Math.round(knownHeight));
  if (cavallo) state.v.cavallo = String(Math.round(cavallo));
  if (femore) state.v.femore = String(Math.round(femore));
  if (tibia) state.v.tibia = String(Math.round(tibia));
  if (busto) state.v.busto = String(Math.round(busto));
  if (braccio) state.v.braccio = String(Math.round(braccio));
  if (spalle) state.v.spalle = String(Math.round(spalle));
  if (recManubrio && !state.v.manubrio_larg) state.v.manubrio_larg = String(recManubrio);

  const today = new Date().toLocaleDateString(I18N.currentLang === "en" ? "en-US" : "it-IT");
  state.log.push([
    today,
    "Rilevamento Misure da Foto (AI)",
    "-",
    `Cavallo ${cavallo}mm, Femore ${femore}mm, Tibia ${tibia}mm, Busto ${busto}mm, Braccio ${braccio}mm, Spalle ${spalle}mm (Manubrio raccomandato ${recManubrio}mm)`,
    "Photo anthropometry"
  ]);

  queueSave();
  renderForm();
  updateStaticCalculator();
  closePhotoWizard();

  setStatusBadge(I18N.t("photoAppliedToast"));
  alert("✅ " + I18N.t("photoAppliedToast"));
}

function initPhotoWizardEvents() {
  const btnClose = document.getElementById("btnClosePhotoWizard");
  const btnCancel = document.getElementById("btnCancelPhotoWizard");
  const btnUpload = document.getElementById("btnUploadPhotoFile");
  const fileInput = document.getElementById("photoFileInput");
  const btnStartCam = document.getElementById("btnStartPhotoCam");
  const btnSnap = document.getElementById("btnTriggerPhotoSnap");
  const btnCancelCam = document.getElementById("btnCancelPhotoCam");
  const btnRetake = document.getElementById("btnRetakePhoto");
  const btnApply = document.getElementById("btnApplyPhotoMeasurements");

  btnClose?.addEventListener("click", closePhotoWizard);
  btnCancel?.addEventListener("click", closePhotoWizard);

  if (btnUpload && fileInput) {
    btnUpload.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processPhotoForAnthropometry(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnNativeCam = document.getElementById("btnNativePhotoCam");
  const nativeCamInput = document.getElementById("photoNativeCamInput");
  if (btnNativeCam && nativeCamInput) {
    btnNativeCam.addEventListener("click", () => nativeCamInput.click());
    nativeCamInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processPhotoForAnthropometry(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  btnStartCam?.addEventListener("click", () => startPhotoCamera());
  btnSnap?.addEventListener("click", () => capturePhotoSnapshot());
  btnCancelCam?.addEventListener("click", () => stopPhotoCam());
  btnRetake?.addEventListener("click", () => resetPhotoWizardUI());
  btnApply?.addEventListener("click", () => applyPhotoMeasurementsToFitSheet());

  // Additional quick shortcuts
  document.getElementById("btnMenuOpenPhoto")?.addEventListener("click", () => {
    document.getElementById("menuDropdownPanel")?.setAttribute("hidden", "");
    openPhotoWizard();
  });
  document.getElementById("btnVideoTabOpenPhoto")?.addEventListener("click", () => {
    openPhotoWizard();
  });
}

// ===================== BIKE PHOTO MEASUREMENT WIZARD =====================
let bikeMeasureEngine = null;
let bikePhotoCamStream = null;
let bikePhotoCountdownTimer = null;
let currentBikePhotoImage = null;

function openBikePhotoWizard() {
  const modal = document.getElementById("modalBikePhotoMeasure");
  if (!modal) return;

  const canvas = document.getElementById("bikePhotoCanvas");
  if (canvas && !bikeMeasureEngine) {
    bikeMeasureEngine = new BikeMeasureEngine(canvas);
    bikeMeasureEngine.onMeasurementsChanged = (m) => updateBikeTelemetryUI(m);
  }

  resetBikePhotoWizardUI();
  modal.showModal();
}

function closeBikePhotoWizard() {
  stopBikePhotoCamera();
  const modal = document.getElementById("modalBikePhotoMeasure");
  if (modal) modal.close();
}

function resetBikePhotoWizardUI() {
  stopBikePhotoCamera();
  document.getElementById("bikePhotoStep1Box")?.style.setProperty("display", "block");
  document.getElementById("bikePhotoCamContainer")?.style.setProperty("display", "none");
  document.getElementById("bikePhotoStageContainer")?.style.setProperty("display", "none");
  document.getElementById("btnApplyBikePhotoMeasurements")?.style.setProperty("display", "none");
  currentBikePhotoImage = null;
}

function updateBikeTelemetryUI(m) {
  if (!m) return;
  const setV = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setV("bikeValHs", m.saddleHeightMm);
  setV("bikeValSb", m.saddleSetbackMm);
  setV("bikeValDrop", m.saddleToBarDropMm);
  setV("bikeValReach", m.saddleToBarReachMm);
  setV("bikeValTilt", m.saddleTiltDeg > 0 ? `+${m.saddleTiltDeg}` : m.saddleTiltDeg);
  setV("bikeValWb", m.wheelbaseMm);
  setV("bikeValStack", m.frameStackMm);
  setV("bikeValFReach", m.frameReachMm);
  setV("bikeValSRRatio", m.stackToReachRatio);
  setV("bikeValSpacers", m.spacerStackMm);
}

function processBikePhoto(imgElement) {
  currentBikePhotoImage = imgElement;
  const step1 = document.getElementById("bikePhotoStep1Box");
  const stage = document.getElementById("bikePhotoStageContainer");
  const btnApply = document.getElementById("btnApplyBikePhotoMeasurements");

  if (step1) step1.style.display = "none";
  if (stage) stage.style.display = "block";
  if (btnApply) btnApply.style.display = "inline-block";

  const presetSelect = document.getElementById("bikeWheelPresetSelect");
  const presetKey = presetSelect?.value || "700c";

  if (bikeMeasureEngine) {
    bikeMeasureEngine.setWheelPreset(presetKey);
    bikeMeasureEngine.loadImage(imgElement);
  }
}

async function startBikePhotoCamera() {
  const container = document.getElementById("bikePhotoCamContainer");
  const video = document.getElementById("bikePhotoCamVideo");
  const countdownEl = document.getElementById("bikePhotoCountdown");
  if (!container || !video) return;

  try {
    const stream = await requestCameraStream("environment", { width: { ideal: 1920 }, height: { ideal: 1080 } });
    bikePhotoCamStream = stream;
    await attachStreamToVideo(video, stream);
    container.style.display = "block";

    let count = 5;
    if (countdownEl) {
      countdownEl.style.display = "flex";
      countdownEl.textContent = count;
      clearInterval(bikePhotoCountdownTimer);
      bikePhotoCountdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.textContent = count;
        } else {
          clearInterval(bikePhotoCountdownTimer);
          countdownEl.style.display = "none";
          captureBikePhotoSnapshot();
        }
      }, 1000);
    }
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      const nativeInput = document.getElementById("bikePhotoNativeCamInput");
      showCameraPermissionGuide(startBikePhotoCamera, nativeInput);
    } else {
      alert(getCameraErrorMessage(err));
    }
  }
}

function stopBikePhotoCamera() {
  clearInterval(bikePhotoCountdownTimer);
  if (bikePhotoCamStream) {
    bikePhotoCamStream.getTracks().forEach(t => t.stop());
    bikePhotoCamStream = null;
    const video = document.getElementById("bikePhotoCamVideo");
    if (video) video.srcObject = null;
  }
  const container = document.getElementById("bikePhotoCamContainer");
  if (container) container.style.display = "none";
}

function captureBikePhotoSnapshot() {
  const video = document.getElementById("bikePhotoCamVideo");
  if (!video) return;

  const snapCanvas = document.createElement("canvas");
  snapCanvas.width = video.videoWidth || 1280;
  snapCanvas.height = video.videoHeight || 720;
  const sCtx = snapCanvas.getContext("2d");
  sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

  stopBikePhotoCamera();

  const img = new Image();
  img.src = snapCanvas.toDataURL("image/jpeg", 0.95);
  img.onload = () => processBikePhoto(img);
}

function applyBikePhotoMeasurements() {
  if (!bikeMeasureEngine || !bikeMeasureEngine.measurements) return;
  const m = bikeMeasureEngine.measurements;

  if (m.saddleHeightMm > 0) state.v.h_sella = String(m.saddleHeightMm);
  if (m.saddleSetbackMm !== undefined) state.v.arretramento = String(m.saddleSetbackMm);
  if (m.saddleToBarDropMm !== undefined) state.v.drop_sm = String(m.saddleToBarDropMm);
  if (m.saddleToBarReachMm > 0) state.v.reach_sm = String(m.saddleToBarReachMm);
  if (m.saddleTiltDeg !== undefined) state.v.incl_sella = String(m.saddleTiltDeg);
  if (m.frameStackMm > 0) state.v.stack = String(m.frameStackMm);
  if (m.frameReachMm > 0) state.v.reach_telaio = String(m.frameReachMm);
  if (m.spacerStackMm > 0) state.v.spessori = String(m.spacerStackMm);

  const today = new Date().toLocaleDateString(I18N.currentLang === "en" ? "en-US" : "it-IT");
  state.log.push([
    today,
    "Rilevamento Setup Bici da Foto (Lente 3x)",
    "-",
    `Altezza Sella ${m.saddleHeightMm}mm, Arretramento ${m.saddleSetbackMm}mm, Drop ${m.saddleToBarDropMm}mm, Reach ${m.saddleToBarReachMm}mm, Stack ${m.frameStackMm}mm, Reach Telaio ${m.frameReachMm}mm`,
    "Bike photo calibration"
  ]);

  queueSave();
  renderForm();
  updateStaticCalculator();
  updateCockpitSimulation();
  closeBikePhotoWizard();

  setStatusBadge(I18N.t("bikePhotoAppliedToast"));
  alert("✅ " + I18N.t("bikePhotoAppliedToast"));
}

function initBikePhotoWizardEvents() {
  const btnClose = document.getElementById("btnCloseBikePhotoWizard");
  const btnCancel = document.getElementById("btnCancelBikePhotoWizard");
  const btnUpload = document.getElementById("btnUploadBikePhotoFile");
  const fileInput = document.getElementById("bikePhotoFileInput");
  const btnStartCam = document.getElementById("btnStartBikePhotoCam");
  const btnSnap = document.getElementById("btnTriggerBikePhotoSnap");
  const btnCancelCam = document.getElementById("btnCancelBikePhotoCam");
  const btnRetake = document.getElementById("btnRetakeBikePhoto");
  const btnApply = document.getElementById("btnApplyBikePhotoMeasurements");
  const presetSelect = document.getElementById("bikeWheelPresetSelect");

  btnClose?.addEventListener("click", closeBikePhotoWizard);
  btnCancel?.addEventListener("click", closeBikePhotoWizard);

  if (btnUpload && fileInput) {
    btnUpload.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processBikePhoto(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnNativeCam = document.getElementById("btnNativeBikePhotoCam");
  const nativeCamInput = document.getElementById("bikePhotoNativeCamInput");
  if (btnNativeCam && nativeCamInput) {
    btnNativeCam.addEventListener("click", () => nativeCamInput.click());
    nativeCamInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processBikePhoto(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  presetSelect?.addEventListener("change", (e) => {
    if (bikeMeasureEngine) {
      bikeMeasureEngine.setWheelPreset(e.target.value);
    }
  });

  btnStartCam?.addEventListener("click", () => startBikePhotoCamera());
  btnSnap?.addEventListener("click", () => captureBikePhotoSnapshot());
  btnCancelCam?.addEventListener("click", () => stopBikePhotoCamera());
  btnRetake?.addEventListener("click", () => resetBikePhotoWizardUI());
  btnApply?.addEventListener("click", () => applyBikePhotoMeasurements());

  // Direct shortcuts from dropdown menu and video tab
  document.getElementById("btnMenuBikePhoto")?.addEventListener("click", () => {
    document.getElementById("menuDropdownPanel")?.setAttribute("hidden", "");
    openBikePhotoWizard();
  });
  document.getElementById("btnVideoTabBikePhoto")?.addEventListener("click", () => {
    openBikePhotoWizard();
  });
}

// ===================== SIT-BONE CARDBOARD IMPRESSION WIZARD =====================
let sitBoneEngine = null;
let sitBoneCamStream = null;
let sitBoneCountdownTimer = null;

function openSitBoneWizard() {
  const modal = document.getElementById("modalSitBoneMeasure");
  if (!modal) return;

  const canvas = document.getElementById("sitBoneCanvas");
  if (canvas && !sitBoneEngine) {
    sitBoneEngine = new SitBoneMeasureEngine(canvas);
    sitBoneEngine.onMeasurementsChanged = (m) => updateSitBoneTelemetryUI(m);
  }

  resetSitBoneWizardUI();
  modal.showModal();
}

function closeSitBoneWizard() {
  stopSitBoneCamera();
  const modal = document.getElementById("modalSitBoneMeasure");
  if (modal) modal.close();
}

function resetSitBoneWizardUI() {
  stopSitBoneCamera();
  document.getElementById("sitBoneStep1Box")?.style.setProperty("display", "block");
  document.getElementById("sitBoneCamContainer")?.style.setProperty("display", "none");
  document.getElementById("sitBoneStageContainer")?.style.setProperty("display", "none");
  document.getElementById("btnApplySitBoneMeasurements")?.style.setProperty("display", "none");
}

function updateSitBoneTelemetryUI(m) {
  if (!m) return;
  const setV = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setV("sitBoneDistVal", m.sitBoneDistMm);
  setV("sitBoneRoadVal", m.recSaddleRoadMm);
  setV("sitBoneEnduranceVal", m.recSaddleEnduranceMm);
  setV("sitBoneMtbVal", m.recSaddleMtbMm);
}

function processSitBonePhoto(imgElement) {
  const step1 = document.getElementById("sitBoneStep1Box");
  const stage = document.getElementById("sitBoneStageContainer");
  const btnApply = document.getElementById("btnApplySitBoneMeasurements");

  if (step1) step1.style.display = "none";
  if (stage) stage.style.display = "block";
  if (btnApply) btnApply.style.display = "inline-block";

  if (sitBoneEngine) {
    sitBoneEngine.loadImage(imgElement);
  }
}

async function startSitBoneCamera() {
  const container = document.getElementById("sitBoneCamContainer");
  const video = document.getElementById("sitBoneCamVideo");
  const countdownEl = document.getElementById("sitBoneCountdown");
  if (!container || !video) return;

  try {
    const stream = await requestCameraStream("environment", { width: { ideal: 1920 }, height: { ideal: 1080 } });
    sitBoneCamStream = stream;
    await attachStreamToVideo(video, stream);
    container.style.display = "block";

    let count = 5;
    if (countdownEl) {
      countdownEl.style.display = "flex";
      countdownEl.textContent = count;
      clearInterval(sitBoneCountdownTimer);
      sitBoneCountdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.textContent = count;
        } else {
          clearInterval(sitBoneCountdownTimer);
          countdownEl.style.display = "none";
          captureSitBoneSnapshot();
        }
      }, 1000);
    }
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      const nativeInput = document.getElementById("sitBoneNativeCamInput");
      showCameraPermissionGuide(startSitBoneCamera, nativeInput);
    } else {
      alert(getCameraErrorMessage(err));
    }
  }
}

function stopSitBoneCamera() {
  clearInterval(sitBoneCountdownTimer);
  if (sitBoneCamStream) {
    sitBoneCamStream.getTracks().forEach(t => t.stop());
    sitBoneCamStream = null;
    const video = document.getElementById("sitBoneCamVideo");
    if (video) video.srcObject = null;
  }
  const container = document.getElementById("sitBoneCamContainer");
  if (container) container.style.display = "none";
}

function captureSitBoneSnapshot() {
  const video = document.getElementById("sitBoneCamVideo");
  if (!video) return;

  const snapCanvas = document.createElement("canvas");
  snapCanvas.width = video.videoWidth || 1280;
  snapCanvas.height = video.videoHeight || 720;
  const sCtx = snapCanvas.getContext("2d");
  sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

  stopSitBoneCamera();

  const img = new Image();
  img.src = snapCanvas.toDataURL("image/jpeg", 0.95);
  img.onload = () => processSitBonePhoto(img);
}

function applySitBoneMeasurements() {
  if (!sitBoneEngine || !sitBoneEngine.measurements) return;
  const m = sitBoneEngine.measurements;

  if (m.sitBoneDistMm > 0) {
    state.v.ischi_mm = String(m.sitBoneDistMm);
    if (!state.v.sella_larg) {
      state.v.sella_larg = String(m.recSaddleRoadMm);
    }
  }

  const today = new Date().toLocaleDateString(I18N.currentLang === "en" ? "en-US" : "it-IT");
  state.log.push([
    today,
    "Analizzatore Ossa Ischiatiche (Foto)",
    "-",
    `Distanza Ischiale ${m.sitBoneDistMm}mm (Sella consigliata: Strada ${m.recSaddleRoadMm}mm, Gravel ${m.recSaddleEnduranceMm}mm)`,
    "Sit-bone cardboard calibration"
  ]);

  queueSave();
  renderForm();
  updateStaticCalculator();
  closeSitBoneWizard();

  setStatusBadge(I18N.t("sitBoneAppliedToast"));
  alert("✅ " + I18N.t("sitBoneAppliedToast"));
}

function initSitBoneWizardEvents() {
  const btnClose = document.getElementById("btnCloseSitBoneWizard");
  const btnCancel = document.getElementById("btnCancelSitBoneWizard");
  const btnUpload = document.getElementById("btnUploadSitBoneFile");
  const fileInput = document.getElementById("sitBoneFileInput");
  const btnStartCam = document.getElementById("btnStartSitBoneCam");
  const btnSnap = document.getElementById("btnTriggerSitBoneSnap");
  const btnCancelCam = document.getElementById("btnCancelSitBoneCam");
  const btnRetake = document.getElementById("btnRetakeSitBone");
  const btnApply = document.getElementById("btnApplySitBoneMeasurements");

  btnClose?.addEventListener("click", closeSitBoneWizard);
  btnCancel?.addEventListener("click", closeSitBoneWizard);

  if (btnUpload && fileInput) {
    btnUpload.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processSitBonePhoto(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnNativeCam = document.getElementById("btnNativeSitBoneCam");
  const nativeCamInput = document.getElementById("sitBoneNativeCamInput");
  if (btnNativeCam && nativeCamInput) {
    btnNativeCam.addEventListener("click", () => nativeCamInput.click());
    nativeCamInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processSitBonePhoto(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  btnStartCam?.addEventListener("click", () => startSitBoneCamera());
  btnSnap?.addEventListener("click", () => captureSitBoneSnapshot());
  btnCancelCam?.addEventListener("click", () => stopSitBoneCamera());
  btnRetake?.addEventListener("click", () => resetSitBoneWizardUI());
  btnApply?.addEventListener("click", () => applySitBoneMeasurements());

  document.getElementById("btnMenuSitBonePhoto")?.addEventListener("click", () => {
    document.getElementById("menuDropdownPanel")?.setAttribute("hidden", "");
    openSitBoneWizard();
  });
}

// ===================== FOOT ROTATION & CLEAT FLOAT WIZARD =====================
let footEngine = null;
let footCamStream = null;
let footCountdownTimer = null;

function openFootFlareWizard() {
  const modal = document.getElementById("modalFootFlareMeasure");
  if (!modal) return;

  const canvas = document.getElementById("footFlareCanvas");
  if (canvas && !footEngine) {
    footEngine = new FootMeasureEngine(canvas);
    footEngine.onMeasurementsChanged = (m) => updateFootFlareTelemetryUI(m);
  }

  resetFootFlareWizardUI();
  modal.showModal();
}

function closeFootFlareWizard() {
  stopFootFlareCamera();
  const modal = document.getElementById("modalFootFlareMeasure");
  if (modal) modal.close();
}

function resetFootFlareWizardUI() {
  stopFootFlareCamera();
  document.getElementById("footFlareStep1Box")?.style.setProperty("display", "block");
  document.getElementById("footFlareCamContainer")?.style.setProperty("display", "none");
  document.getElementById("footFlareStageContainer")?.style.setProperty("display", "none");
  document.getElementById("btnApplyFootFlareMeasurements")?.style.setProperty("display", "none");
}

function updateFootFlareTelemetryUI(m) {
  if (!m) return;
  const setV = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setV("footValAngleL", m.leftAngleDeg > 0 ? `+${m.leftAngleDeg}` : m.leftAngleDeg);
  setV("footValAngleR", m.rightAngleDeg > 0 ? `+${m.rightAngleDeg}` : m.rightAngleDeg);
  setV("footValAsym", m.asymmetryDeg);
  setV("footValRecFloat", m.recFloatType);
  setV("footValRecBrands", `${m.recFloatShimano} / ${m.recFloatLook}`);
}

function processFootFlarePhoto(imgElement) {
  const step1 = document.getElementById("footFlareStep1Box");
  const stage = document.getElementById("footFlareStageContainer");
  const btnApply = document.getElementById("btnApplyFootFlareMeasurements");

  if (step1) step1.style.display = "none";
  if (stage) stage.style.display = "block";
  if (btnApply) btnApply.style.display = "inline-block";

  if (footEngine) {
    footEngine.loadImage(imgElement);
  }
}

async function startFootFlareCamera() {
  const container = document.getElementById("footFlareCamContainer");
  const video = document.getElementById("footFlareCamVideo");
  const countdownEl = document.getElementById("footFlareCountdown");
  if (!container || !video) return;

  try {
    const stream = await requestCameraStream("environment", { width: { ideal: 1920 }, height: { ideal: 1080 } });
    footCamStream = stream;
    await attachStreamToVideo(video, stream);
    container.style.display = "block";

    let count = 5;
    if (countdownEl) {
      countdownEl.style.display = "flex";
      countdownEl.textContent = count;
      clearInterval(footCountdownTimer);
      footCountdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.textContent = count;
        } else {
          clearInterval(footCountdownTimer);
          countdownEl.style.display = "none";
          captureFootFlareSnapshot();
        }
      }, 1000);
    }
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      const nativeInput = document.getElementById("footFlareNativeCamInput");
      showCameraPermissionGuide(startFootFlareCamera, nativeInput);
    } else {
      alert(getCameraErrorMessage(err));
    }
  }
}

function stopFootFlareCamera() {
  clearInterval(footCountdownTimer);
  if (footCamStream) {
    footCamStream.getTracks().forEach(t => t.stop());
    footCamStream = null;
    const video = document.getElementById("footFlareCamVideo");
    if (video) video.srcObject = null;
  }
  const container = document.getElementById("footFlareCamContainer");
  if (container) container.style.display = "none";
}

function captureFootFlareSnapshot() {
  const video = document.getElementById("footFlareCamVideo");
  if (!video) return;

  const snapCanvas = document.createElement("canvas");
  snapCanvas.width = video.videoWidth || 1280;
  snapCanvas.height = video.videoHeight || 720;
  const sCtx = snapCanvas.getContext("2d");
  sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

  stopFootFlareCamera();

  const img = new Image();
  img.src = snapCanvas.toDataURL("image/jpeg", 0.95);
  img.onload = () => processFootFlarePhoto(img);
}

function applyFootFlareMeasurements() {
  if (!footEngine || !footEngine.measurements) return;
  const m = footEngine.measurements;

  const note = `Rotazione piedi: Sx ${m.leftAngleDeg}°, Dx ${m.rightAngleDeg}° (Asimmetria ${m.asymmetryDeg}°). Float: ${m.recFloatType} (${m.recFloatShimano} / ${m.recFloatLook}).`;
  state.v.tacchette_note = (state.v.tacchette_note ? state.v.tacchette_note + " | " : "") + note;

  const today = new Date().toLocaleDateString(I18N.currentLang === "en" ? "en-US" : "it-IT");
  state.log.push([
    today,
    "Analisi Rotazione Piede & Tacchette (Foto)",
    "-",
    `Sx ${m.leftAngleDeg}°, Dx ${m.rightAngleDeg}°, Asimmetria ${m.asymmetryDeg}°, Float raccomandato ${m.recFloatType}`,
    "Dangling-feet tibial torsion analysis"
  ]);

  queueSave();
  renderForm();
  closeFootFlareWizard();

  setStatusBadge(I18N.t("footFlareAppliedToast"));
  alert("✅ " + I18N.t("footFlareAppliedToast"));
}

function initFootFlareWizardEvents() {
  const btnClose = document.getElementById("btnCloseFootFlareWizard");
  const btnCancel = document.getElementById("btnCancelFootFlareWizard");
  const btnUpload = document.getElementById("btnUploadFootFlareFile");
  const fileInput = document.getElementById("footFlareFileInput");
  const btnStartCam = document.getElementById("btnStartFootFlareCam");
  const btnSnap = document.getElementById("btnTriggerFootFlareSnap");
  const btnCancelCam = document.getElementById("btnCancelFootFlareCam");
  const btnRetake = document.getElementById("btnRetakeFootFlare");
  const btnApply = document.getElementById("btnApplyFootFlareMeasurements");

  btnClose?.addEventListener("click", closeFootFlareWizard);
  btnCancel?.addEventListener("click", closeFootFlareWizard);

  if (btnUpload && fileInput) {
    btnUpload.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processFootFlarePhoto(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnNativeCam = document.getElementById("btnNativeFootFlareCam");
  const nativeCamInput = document.getElementById("footFlareNativeCamInput");
  if (btnNativeCam && nativeCamInput) {
    btnNativeCam.addEventListener("click", () => nativeCamInput.click());
    nativeCamInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.src = re.target.result;
          img.onload = () => processFootFlarePhoto(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  btnStartCam?.addEventListener("click", () => startFootFlareCamera());
  btnSnap?.addEventListener("click", () => captureFootFlareSnapshot());
  btnCancelCam?.addEventListener("click", () => stopFootFlareCamera());
  btnRetake?.addEventListener("click", () => resetFootFlareWizardUI());
  btnApply?.addEventListener("click", () => applyFootFlareMeasurements());

  document.getElementById("btnMenuFootFlarePhoto")?.addEventListener("click", () => {
    document.getElementById("menuDropdownPanel")?.setAttribute("hidden", "");
    openFootFlareWizard();
  });
}

function startDemoLoop() {
  stopWebcam();
  const canvas = document.getElementById("poseCanvas");
  canvas.width = 800;
  canvas.height = 600;
  poseEngine.setBannerText("DEMO SIMULATION");
  
  let crankAngle = 0;
  clearInterval(demoAnimationTimer);
  demoAnimationTimer = setInterval(() => {
    crankAngle = (crankAngle + 4) % 360;
    poseEngine.setKinematicModel(crankAngle);
    poseEngine.render();
    updateMetricsDashboard();
  }, 33);
}

function stopDemo() {
  if (demoAnimationTimer) {
    clearInterval(demoAnimationTimer);
    demoAnimationTimer = null;
  }
}

function updateMetricsDashboard() {
  if (!poseEngine) return;
  const a = poseEngine.angles;
  const c = poseEngine.pedalCycle;

  const elKnee = document.getElementById("valKnee");
  const stKnee = document.getElementById("statusKnee");
  if (elKnee) {
    const kVal = c.medianBdcKnee || a.knee || 0;
    elKnee.textContent = `${kVal}°`;
    if (stKnee) {
      if (kVal >= 140 && kVal <= 145) {
        stKnee.className = "metric-status status-optimal";
        stKnee.textContent = I18N.t("stOptimal") + " (140°-145°)";
      } else if (kVal < 138 && kVal > 80) {
        stKnee.className = "metric-status status-warn";
        stKnee.textContent = I18N.t("stLowSaddle") + " (<138°)";
      } else if (kVal > 148) {
        stKnee.className = "metric-status status-alert";
        stKnee.textContent = I18N.t("stHighSaddle") + " (>148°)";
      } else {
        stKnee.className = "metric-status";
        stKnee.textContent = I18N.t("stTracking");
      }
    }
  }

  const elCadence = document.getElementById("valCadence");
  if (elCadence) elCadence.textContent = c.currentCadence ? `${c.currentCadence} RPM` : "--";

  const elTorso = document.getElementById("valTorso");
  if (elTorso) elTorso.textContent = `${a.torso || 0}°`;

  const elShoulder = document.getElementById("valShoulder");
  if (elShoulder) elShoulder.textContent = `${a.shoulder || 0}°`;

  const elElbow = document.getElementById("valElbow");
  if (elElbow) elElbow.textContent = `${a.elbow || 0}°`;

  const elHip = document.getElementById("valHip");
  if (elHip) elHip.textContent = `${a.hipTDC || 0}°`;

  const elFrontStatus = document.getElementById("valFrontalStatus");
  if (elFrontStatus) elFrontStatus.textContent = a.frontalValgusVarus;

  const elFrontDev = document.getElementById("valFrontalDev");
  if (elFrontDev) elFrontDev.textContent = `${a.rightKneeDeviation > 0 ? '+' : ''}${a.rightKneeDeviation} px`;
}

// ===================== STATIC CALCULATOR & COCKPIT SIMULATOR =====================
function initCalculatorModule() {
  document.getElementById("calcInseam")?.addEventListener("input", updateStaticCalculator);
  document.getElementById("calcHeight")?.addEventListener("input", updateStaticCalculator);
  document.getElementById("calcCrank")?.addEventListener("input", updateStaticCalculator);
  document.getElementById("calcCurrentSaddle")?.addEventListener("input", updateStaticCalculator);

  document.getElementById("btnApplyCalculatedSaddle")?.addEventListener("click", () => {
    const cavallo = parseFloat(document.getElementById("calcInseam")?.value) || parseFloat(state.v.cavallo) || 0;
    if (cavallo > 0) {
      const lemond = Math.round(cavallo * 0.883);
      state.v.h_sella = String(lemond);
      queueSave();
      renderForm();
      updateStaticCalculator();
      renderDiagnostics();
      alert(`✅ ${lemond} mm ${I18N.currentLang === "en" ? "applied to Data Sheet!" : "applicata alla Scheda Dati!"}`);
    }
  });

  const simInputs = [
    "simHeadAngle",
    "simCurSpacers", "simCurStemLen", "simCurStemAngle", "simCurBarReach", "simCurBarDrop",
    "simPropSpacers", "simPropStemLen", "simPropStemAngle", "simPropBarReach", "simPropBarDrop"
  ];

  simInputs.forEach(id => {
    document.getElementById(id)?.addEventListener("input", updateCockpitSimulation);
  });

  updateStaticCalculator();
  updateCockpitSimulation();
}

function updateStaticCalculator() {
  const cavalloInput = document.getElementById("calcInseam");
  const heightInput = document.getElementById("calcHeight");
  const crankInput = document.getElementById("calcCrank");
  const saddleInput = document.getElementById("calcCurrentSaddle");

  const cavallo = parseFloat(cavalloInput?.value) || parseFloat(state.v.cavallo) || 0;
  const altezza = parseFloat(heightInput?.value) || parseFloat(state.v.altezza) || 0;
  const pedivelle = parseFloat(crankInput?.value) || parseFloat(state.v.pedivelle) || 170;
  const h_sella = parseFloat(saddleInput?.value) || parseFloat(state.v.h_sella) || 0;

  if (cavalloInput && !cavalloInput.value && cavallo) cavalloInput.value = cavallo;
  if (heightInput && !heightInput.value && altezza) heightInput.value = altezza;
  if (crankInput && !crankInput.value && pedivelle) crankInput.value = pedivelle;
  if (saddleInput && !saddleInput.value && h_sella) saddleInput.value = h_sella;

  if (!cavallo) return;

  const params = {
    cavallo, altezza, pedivelle, h_sella,
    busto: state.v.busto, braccio: state.v.braccio,
    lang: I18N.currentLang
  };

  const res = (typeof WasmBikeFit !== 'undefined' && WasmBikeFit.isReady)
    ? WasmBikeFit.calculateStaticBenchmarks(params)
    : BikeGeometry.calculateStaticBenchmarks(params);

  if (!res) return;

  const elLemond = document.getElementById("resLemond");
  const elHamley = document.getElementById("resHamley");
  const elRange = document.getElementById("resRange");
  const elDeltaStatus = document.getElementById("resDeltaStatus");

  if (elLemond) elLemond.textContent = `${res.lemondH} mm`;
  if (elHamley) elHamley.textContent = `${res.hamleyH} mm`;
  if (elRange) elRange.textContent = `${res.minRecommendedH} - ${res.maxRecommendedH} mm`;
  if (elDeltaStatus) elDeltaStatus.textContent = res.deltaStatus;
}

function updateCockpitSimulation() {
  const current = {
    headTubeAngle: document.getElementById("simHeadAngle")?.value || 73,
    spacers: document.getElementById("simCurSpacers")?.value || 20,
    stemLength: document.getElementById("simCurStemLen")?.value || 110,
    stemAngle: document.getElementById("simCurStemAngle")?.value || -6,
    barReach: document.getElementById("simCurBarReach")?.value || 80,
    barDrop: document.getElementById("simCurBarDrop")?.value || 125
  };

  const proposed = {
    headTubeAngle: document.getElementById("simHeadAngle")?.value || 73,
    spacers: document.getElementById("simPropSpacers")?.value || 15,
    stemLength: document.getElementById("simPropStemLen")?.value || 100,
    stemAngle: document.getElementById("simPropStemAngle")?.value || -6,
    barReach: document.getElementById("simPropBarReach")?.value || 80,
    barDrop: document.getElementById("simPropBarDrop")?.value || 125
  };

  const solution = (typeof WasmBikeFit !== 'undefined' && WasmBikeFit.isReady)
    ? WasmBikeFit.solveCockpit(current, proposed)
    : BikeGeometry.solveCockpit(current, proposed);

  if (!solution) return;

  const svgHtml = BikeGeometry.renderCockpitSVG(solution);
  const container = document.getElementById("cockpitSvgContainer");
  if (container) container.innerHTML = svgHtml;

  const reachSpan = document.getElementById("simDeltaReach");
  const stackSpan = document.getElementById("simDeltaStack");
  if (reachSpan) reachSpan.textContent = solution.deltaClampReach >= 0 ? `+${solution.deltaClampReach} mm` : `${solution.deltaClampReach} mm`;
  if (stackSpan) stackSpan.textContent = solution.deltaClampStack >= 0 ? `+${solution.deltaClampStack} mm` : `${solution.deltaClampStack} mm`;
}

// ===================== SYNCHRONIZED DUAL VIDEO PLAYER =====================
function initDualVideoModule() {
  const v1 = document.getElementById("dualVideo1");
  const v2 = document.getElementById("dualVideo2");
  const file1 = document.getElementById("dualFileInput1");
  const file2 = document.getElementById("dualFileInput2");
  const btnPlay = document.getElementById("btnDualPlayPause");
  const btnSyncBDC = document.getElementById("btnDualSyncBDC");
  const scrubber = document.getElementById("dualScrubber");

  if (file1 && v1) {
    file1.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        v1.src = URL.createObjectURL(e.target.files[0]);
        v1.load();
      }
    });
  }

  if (file2 && v2) {
    file2.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        v2.src = URL.createObjectURL(e.target.files[0]);
        v2.load();
      }
    });
  }

  if (btnPlay && v1 && v2) {
    btnPlay.addEventListener("click", () => {
      if (v1.paused) {
        v1.play();
        v2.play();
        btnPlay.textContent = I18N.t("btnDualPause");
      } else {
        v1.pause();
        v2.pause();
        btnPlay.textContent = I18N.t("btnDualPlay");
      }
    });
  }

  if (btnSyncBDC && v1 && v2) {
    btnSyncBDC.addEventListener("click", () => {
      dualVideoSync.syncOffset = v2.currentTime - v1.currentTime;
      dualVideoSync.isSynced = true;
      setStatusBadge(I18N.t("statusPhaseLocked"));
    });
  }

  if (scrubber && v1 && v2) {
    scrubber.addEventListener("input", () => {
      if (v1.duration) {
        const t1 = (scrubber.value / 100) * v1.duration;
        v1.currentTime = t1;
        if (dualVideoSync.isSynced) {
          v2.currentTime = Math.max(0, Math.min(v2.duration || 0, t1 + dualVideoSync.syncOffset));
        }
      }
    });

    v1.addEventListener("timeupdate", () => {
      if (v1.duration) {
        scrubber.value = (v1.currentTime / v1.duration) * 100;
        if (dualVideoSync.isSynced && !v1.paused) {
          const expectedV2 = v1.currentTime + dualVideoSync.syncOffset;
          if (Math.abs(v2.currentTime - expectedV2) > 0.15) {
            v2.currentTime = expectedV2;
          }
        }
      }
    });
  }
}

// ===================== IMPORT / EXPORT & MODALS =====================
function initImportExport() {
  const btnToggleMenu = document.getElementById("btnToggleMenu");
  const menuDropdownPanel = document.getElementById("menuDropdownPanel");

  if (btnToggleMenu && menuDropdownPanel) {
    btnToggleMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = menuDropdownPanel.hasAttribute("hidden");
      if (isHidden) {
        menuDropdownPanel.removeAttribute("hidden");
        btnToggleMenu.setAttribute("aria-expanded", "true");
      } else {
        menuDropdownPanel.setAttribute("hidden", "");
        btnToggleMenu.setAttribute("aria-expanded", "false");
      }
    });

    menuDropdownPanel.querySelectorAll(".menu-item").forEach(item => {
      item.addEventListener("click", () => {
        menuDropdownPanel.setAttribute("hidden", "");
        btnToggleMenu.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!menuDropdownPanel.hasAttribute("hidden") && !menuDropdownPanel.contains(e.target) && !btnToggleMenu.contains(e.target)) {
        menuDropdownPanel.setAttribute("hidden", "");
        btnToggleMenu.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menuDropdownPanel.hasAttribute("hidden")) {
        menuDropdownPanel.setAttribute("hidden", "");
        btnToggleMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  const modalImport = document.getElementById("modalImport");
  const btnOpenImport = document.getElementById("btnOpenImport");
  const btnCloseImport = document.getElementById("btnCloseImport");
  const dropzone = document.getElementById("importDropzone");
  const fileInput = document.getElementById("importFileInput");
  const textImport = document.getElementById("importTextArea");
  const btnProcessImport = document.getElementById("btnProcessImport");
  const btnLoadSample = document.getElementById("btnLoadSample");

  if (btnOpenImport && modalImport) {
    btnOpenImport.addEventListener("click", () => modalImport.showModal());
  }
  if (btnCloseImport && modalImport) {
    btnCloseImport.addEventListener("click", () => modalImport.close());
  }

  if (btnLoadSample) {
    btnLoadSample.addEventListener("click", () => {
      if (typeof SAMPLE_ARGON18_DATA !== 'undefined') {
        state = JSON.parse(JSON.stringify(SAMPLE_ARGON18_DATA));
        queueSave();
        renderForm();
        updateStaticCalculator();
        updateCockpitSimulation();
        renderDiagnostics();
        if (modalImport) modalImport.close();
        setStatusBadge(I18N.t("statusSampleLoaded"));
      }
    });
  }

  function handleImportText(text) {
    try {
      let imported;
      if (text.trim().startsWith("{")) {
        imported = BikeFitIO.parseJSON(text);
      } else {
        imported = BikeFitIO.parseMarkdown(text, SCHEMA, ZONE);
      }
      state = Object.assign(state, imported);
      queueSave();
      renderForm();
      updateStaticCalculator();
      updateCockpitSimulation();
      renderDiagnostics();
      if (modalImport) modalImport.close();
      alert("✅ " + I18N.t("statusDataImported"));
    } catch (e) {
      alert(I18N.t("statusImportError") + e.message);
    }
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => handleImportText(evt.target.result);
        reader.readAsText(file);
      }
    });
  }

  if (dropzone) {
    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => handleImportText(evt.target.result);
        reader.readAsText(file);
      }
    });
  }

  if (btnProcessImport && textImport) {
    btnProcessImport.addEventListener("click", () => {
      if (textImport.value.trim()) {
        handleImportText(textImport.value);
      }
    });
  }

  const btnExportMd = document.getElementById("btnExportMd");
  const btnExportJson = document.getElementById("btnExportJson");
  const btnCopyMd = document.getElementById("btnCopyMd");

  if (btnExportMd) {
    btnExportMd.addEventListener("click", () => {
      const md = BikeFitIO.buildMarkdown(state, SCHEMA, ZONE);
      downloadBlob(md, "bike-position-sheet.md", "text/markdown;charset=utf-8");
      setStatusBadge(I18N.t("statusMdDownloaded"));
    });
  }

  if (btnExportJson) {
    btnExportJson.addEventListener("click", () => {
      const jsonStr = BikeFitIO.buildJSON(state);
      downloadBlob(jsonStr, "bike-fit-data.json", "application/json;charset=utf-8");
      setStatusBadge(I18N.t("statusJsonDownloaded"));
    });
  }

  if (btnCopyMd) {
    btnCopyMd.addEventListener("click", async () => {
      const md = BikeFitIO.buildMarkdown(state, SCHEMA, ZONE);
      try {
        await navigator.clipboard.writeText(md);
        setStatusBadge(I18N.t("statusCopied"));
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = md; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
        setStatusBadge(I18N.t("statusCopied"));
      }
    });
  }

  const btnReset = document.getElementById("btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm(I18N.currentLang === "en" ? "Reset all form fields of this profile?" : "Vuoi davvero azzerare tutti i campi di questa scheda?")) {
        state = getFreshBlankState();
        saveToLocalStorage();
        renderForm();
        updateStaticCalculator();
        renderDiagnostics();
        updateActiveProfileBadge();
        setStatusBadge(I18N.t("statusReady"));
      }
    });
  }
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

// ===================== CLIENT-ONLY PROFILE & MULTI-BIKE UI =====================
function updateActiveProfileBadge() {
  if (typeof ProfileManager === "undefined") return;
  const active = ProfileManager.getActiveProfile();
  const el = document.getElementById("activeProfileBadge");
  if (el && active) {
    el.textContent = active.name || active.bikeModel || "Bici";
    el.title = `${active.name} (${active.bikeModel || "N/D"})`;
  }
}

function renderProfileDropdown() {
  if (typeof ProfileManager === "undefined") return;
  const container = document.getElementById("profileItemsList");
  if (!container) return;
  container.innerHTML = "";

  const profiles = ProfileManager.listProfiles();
  const active = ProfileManager.getActiveProfile();

  profiles.forEach(p => {
    const isActive = p.id === active.id;
    const item = document.createElement("div");
    item.className = "profile-item" + (isActive ? " is-active" : "");
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");

    const meta = document.createElement("div");
    meta.className = "profile-item-meta";

    const nameEl = document.createElement("div");
    nameEl.className = "profile-item-name";
    
    const bullet = document.createElement("span");
    bullet.style.marginRight = "6px";
    if (isActive) {
      bullet.style.color = "var(--cyan)";
      bullet.textContent = "●";
    } else {
      bullet.style.color = "var(--muted)";
      bullet.style.opacity = "0.5";
      bullet.textContent = "○";
    }
    nameEl.appendChild(bullet);

    const nameText = document.createTextNode(p.name);
    nameEl.appendChild(nameText);
    meta.appendChild(nameEl);

    if (p.bikeModel && p.bikeModel !== p.name) {
      const subEl = document.createElement("div");
      subEl.className = "profile-item-sub";
      subEl.textContent = p.bikeModel;
      meta.appendChild(subEl);
    }
    item.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "profile-item-actions";

    // Rename button
    const btnRename = document.createElement("button");
    btnRename.className = "profile-action-btn";
    btnRename.title = I18N.t("promptRenameProfile");
    btnRename.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    btnRename.addEventListener("click", (e) => {
      e.stopPropagation();
      const newName = prompt(I18N.t("promptRenameProfile"), p.name);
      if (newName && newName.trim()) {
        ProfileManager.renameProfile(p.id, newName.trim());
        updateActiveProfileBadge();
        renderProfileDropdown();
      }
    });
    actions.appendChild(btnRename);

    // Delete button (if more than 1 profile)
    if (profiles.length > 1) {
      const btnDel = document.createElement("button");
      btnDel.className = "profile-action-btn delete";
      btnDel.title = I18N.t("confirmDeleteProfile");
      btnDel.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
      btnDel.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(I18N.t("confirmDeleteProfile"))) {
          const res = ProfileManager.deleteProfile(p.id);
          if (res.success) {
            if (isActive) {
              const loaded = ProfileManager.loadActiveState();
              state = Object.assign(getFreshBlankState(), loaded);
              refreshUiAfterProfileChange();
            } else {
              updateActiveProfileBadge();
              renderProfileDropdown();
            }
            setStatusBadge(I18N.t("statusProfileDeleted"));
          }
        }
      });
      actions.appendChild(btnDel);
    }

    item.appendChild(actions);

    // Switch to profile on click
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      if (p.id === active.id) {
        closeProfileDropdown();
        return;
      }
      saveToLocalStorage();
      ProfileManager.switchProfile(p.id);
      const loaded = ProfileManager.loadActiveState();
      state = Object.assign(getFreshBlankState(), loaded);

      refreshUiAfterProfileChange();
      closeProfileDropdown();
      setStatusBadge(I18N.t("statusProfileSwitched"));
    });

    container.appendChild(item);
  });
}

function refreshUiAfterProfileChange() {
  renderForm();
  if (typeof renderDiagnostics === "function") {
    try { renderDiagnostics(); } catch (e) { console.error(e); }
  }
  if (typeof updateStaticCalculator === "function") {
    try { updateStaticCalculator(); } catch (e) { console.error(e); }
  }
  if (typeof updateCockpitSimulation === "function") {
    try { updateCockpitSimulation(); } catch (e) { console.error(e); }
  }
  updateActiveProfileBadge();
  renderProfileDropdown();
}

function openProfileDropdown() {
  const panel = document.getElementById("profileDropdownPanel");
  const btn = document.getElementById("btnToggleProfile");
  if (!panel || !btn) return;
  document.getElementById("menuDropdownPanel")?.setAttribute("hidden", "");
  document.getElementById("btnToggleMenu")?.setAttribute("aria-expanded", "false");

  renderProfileDropdown();
  panel.removeAttribute("hidden");
  btn.setAttribute("aria-expanded", "true");
}

function closeProfileDropdown() {
  const panel = document.getElementById("profileDropdownPanel");
  const btn = document.getElementById("btnToggleProfile");
  if (!panel || !btn) return;
  panel.setAttribute("hidden", "");
  btn.setAttribute("aria-expanded", "false");
}

function initProfileManagerModule() {
  if (typeof ProfileManager === "undefined") return;
  ProfileManager.init();
  updateActiveProfileBadge();

  const toggleBtn = document.getElementById("btnToggleProfile");

  toggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeProfileDropdown();
    } else {
      openProfileDropdown();
    }
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("profileDropdownWrap")?.contains(e.target)) {
      closeProfileDropdown();
    }
  });

  // + Nuova Scheda / Bici
  document.getElementById("btnNewProfile")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const defaultName = `Bici ${ProfileManager.listProfiles().length + 1}`;
    const name = prompt(I18N.t("promptNewProfile"), defaultName);
    if (name === null) return;

    saveToLocalStorage();
    ProfileManager.createProfile(name);
    state = Object.assign(getFreshBlankState(), ProfileManager.loadActiveState());

    refreshUiAfterProfileChange();
    closeProfileDropdown();
    setStatusBadge(I18N.t("statusProfileCreated"));
  });

  // Duplica Scheda Attuale
  document.getElementById("btnDuplicateProfile")?.addEventListener("click", (e) => {
    e.stopPropagation();
    saveToLocalStorage();
    const active = ProfileManager.getActiveProfile();
    ProfileManager.duplicateActiveProfile(`${active.name} (Copia)`);
    state = Object.assign(getFreshBlankState(), ProfileManager.loadActiveState());

    refreshUiAfterProfileChange();
    closeProfileDropdown();
    setStatusBadge(I18N.t("statusProfileDuplicated"));
  });
}

// ===================== TAB ROUTER =====================
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      panes.forEach(p => p.classList.toggle("active", p.id === targetId));

      if (targetId === "tab-video" && poseEngine) {
        poseEngine.render();
      }
      if (targetId === "tab-calculator") {
        updateStaticCalculator();
        updateCockpitSimulation();
      }
      if (targetId === "tab-diagnostics") {
        renderDiagnostics();
      }
    });
  });
}

// ===================== GLOSSARY =====================
function renderGlossary() {
  const root = document.getElementById("glossaryContainer");
  if (!root) return;
  root.innerHTML = "";
  const isEn = I18N.currentLang === "en";

  const items = isEn ? [
    ["Stem (pipetta)", `<p>The component connecting the handlebar to the fork steerer tube. Labeled with length (mm) and angle (°).</p>` + (D.attacco || "")],
    ["Saddle Rails (carrelli)", `<p>The two parallel metal rails underneath the saddle, clamped by the seatpost.</p>` + (D.carrelli || "")],
    ["Bottom Bracket (movimento centrale)", `<p>The central axle inside the frame around which the cranks rotate.</p>`],
    ["Seat Tube & Seatpost", `<p>The seat tube is the frame tube; the seatpost slides inside it to hold the saddle.</p>` + (D.bici || "")],
    ["Frame Stack & Reach", `<p>Stack = vertical height from bottom bracket to top of head tube. Reach = horizontal distance.</p>`],
    ["Sit Bones (Ischial Tuberosities)", `<p>The two bony protrusions at the base of the pelvis that bear body weight.</p>` + (D.ischi || "")],
    ["Bottom Dead Center (BDC - 6 o'clock)", `<p>The lowest point of the pedal stroke. Essential frame for measuring knee extension angle (target 140°-145°).</p>`]
  ] : [
    ["Attacco (pipetta, stem)", `<p>Il pezzo che collega il manubrio al cannotto della forcella.</p>` + (D.attacco || "")],
    ["Carrelli (rails)", `<p>Le due barrette metalliche parallele sotto la sella, strette dal morsetto del reggisella.</p>` + (D.carrelli || "")],
    ["Movimento centrale", `<p>L'asse su cui girano le pedivelle, dentro la scatola del telaio.</p>`],
    ["Piantone e reggisella", `<p>Il piantone è il tubo del telaio; il reggisella è il tubo che porta la sella.</p>` + (D.bici || "")],
    ["Stack e reach del telaio", `<p>Stack = altezza verticale da mov centrale a tubo sterzo. Reach = distanza orizzontale.</p>`],
    ["Ossa ischiatiche", `<p>Le due sporgenze ossee alla base del bacino su cui scaricare il peso.</p>` + (D.ischi || "")],
    ["Punto morto inferiore (BDC)", `<p>Il punto più basso della pedalata. È l'istante fondamentale in cui si misura l'estensione del ginocchio (target 140°-145°).</p>`]
  ];

  items.forEach(([t, html]) => {
    const d = document.createElement("details"); d.className = "gl";
    const sm = document.createElement("summary"); sm.textContent = t;
    const bd = document.createElement("div"); bd.className = "gl-body"; bd.innerHTML = html;
    d.appendChild(sm); d.appendChild(bd); root.appendChild(d);
  });
}

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", async () => {
  I18N.init();
  THEME_MANAGER.init();
  if (typeof WasmBikeFit !== 'undefined') {
    await WasmBikeFit.init();
  }
  initProfileManagerModule();
  loadState();
  initTabs();
  applyLanguage();
  drawTicks();
  window.addEventListener("resize", drawTicks);

  document.getElementById("langIT")?.addEventListener("click", () => {
    I18N.setLanguage("it");
    applyLanguage();
  });
  document.getElementById("langEN")?.addEventListener("click", () => {
    I18N.setLanguage("en");
    applyLanguage();
  });

  document.getElementById("mRapido")?.addEventListener("click", () => { state.mode = "rapido"; applyMode(); queueSave(); });
  document.getElementById("mCompleta")?.addEventListener("click", () => { state.mode = "completa"; applyMode(); queueSave(); });

  document.getElementById("expandAll")?.addEventListener("click", (e) => {
    const btns = [...document.querySelectorAll(".helpbtn")];
    const anyClosed = btns.some(b => b.getAttribute("aria-expanded") === "false");
    btns.forEach(b => { if ((b.getAttribute("aria-expanded") === "false") === anyClosed) b.click(); });
    document.querySelectorAll("details.gl").forEach(dd => dd.open = anyClosed);
    e.target.textContent = anyClosed ? I18N.t("btnCloseAll") : I18N.t("btnExpandAll");
  });

  initVideoModule();
  initCalculatorModule();
  initDualVideoModule();
  initDiagnosticsModule();
  initImportExport();
  initDeviceOrientation();
  initPhotoWizardEvents();
  initBikePhotoWizardEvents();
  initSitBoneWizardEvents();
  initFootFlareWizardEvents();
  initCameraPermissionGuide();

  setTimeout(() => {
    if (poseEngine) {
      poseEngine.setKinematicModel(90);
      poseEngine.render();
    }
  }, 100);
});
