/**
 * VELOFIT STUDIO - INTERNATIONALIZATION (i18n) ENGINE
 * Complete Italian (IT) and English (EN) translations dictionary
 */

const I18N = {
  currentLang: "it",

  init() {
    try {
      const saved = localStorage.getItem("bikefit:lang");
      if (saved && (saved === "it" || saved === "en")) {
        this.currentLang = saved;
      } else {
        const navLang = navigator.language || navigator.userLanguage || "it";
        this.currentLang = navLang.startsWith("it") ? "it" : "en";
      }
    } catch (e) {
      this.currentLang = "it";
    }
  },

  setLanguage(lang) {
    if (lang !== "it" && lang !== "en") return;
    this.currentLang = lang;
    try {
      localStorage.setItem("bikefit:lang", lang);
    } catch (e) {}
  },

  t(key, fallback) {
    const d = this.DICTIONARY[this.currentLang];
    if (d && d[key] !== undefined) return d[key];
    const def = this.DICTIONARY["it"];
    if (def && def[key] !== undefined) return def[key];
    return fallback || key;
  },

  DICTIONARY: {
    it: {
      // Header & Navigation
      kicker: "Studio Biomeccanico & Posizionamento Bici",
      brandTitle: "VELOFIT STUDIO",
      menuActions: "Azioni / File",
      menuSecData: "Dati & Esempio",
      menuItemSample: "Carica Esempio Argon 18",
      menuItemImport: "Importa File (.md / .json)",
      menuSecExport: "Esportazione & Condivisione",
      menuItemExportMd: "Esporta Dossier Markdown (.md)",
      menuItemExportJson: "Esporta Dati JSON (.json)",
      menuItemCopy: "Copia Markdown negli Appunti",
      menuItemReset: "Azzera Scheda Dati",
      btnLoadSample: "⚡ Carica Esempio",
      btnImport: "📂 Importa",
      btnExportMd: "💾 Esporta .md",
      btnExportJson: "💾 JSON",
      btnCopy: "📋 Copia",
      btnReset: "Azzera scheda",
      themeSystem: "Tema di sistema",
      themeLight: "Tema chiaro",
      themeDark: "Tema scuro",
      tabForm: "Scheda Dati",
      tabVideo: "Video & Angoli",
      tabDiagnostics: "Diagnosi & Proposte",
      tabCalculator: "Calcolatori & Cockpit",
      tabComparison: "Confronto Video",
      tabGlossary: "Glossario",

      // Sticky bar
      modeRapid: "Rapida (40m)",
      modeComplete: "Completa (Fine)",
      btnExpandAll: "Apri spiegazioni",
      btnCloseAll: "Chiudi spiegazioni",
      statusReady: "Pronto",
      statusSaved: "Salvato in locale",
      statusSaveError: "Errore salvataggio",
      statusLastSave: "Ultimo salvataggio",
      tapeCompiled: "compilati",

      // Video Analyzer
      btnUploadVideo: "Carica Video",
      btnToggleCamOn: "Avvia Fotocamera",
      btnToggleCamOff: "Ferma Fotocamera",
      btnPlayDemo: "Demo Ciclista",
      lblViewMode: "Inquadratura:",
      optLateral: "Laterale (Angoli & Cadenza)",
      optFrontal: "Frontale (Traiettoria Ginocchio)",
      lblSide: "Lato:",
      optSideAuto: "Auto Detect",
      optSideRight: "Lato Destro",
      optSideLeft: "Lato Sinistro",
      lblBanner: "Banner:",
      btnPlay: "Play",
      btnPause: "Pausa",
      btnStepBack: "-1 fr",
      btnStepFwd: "+1 fr",
      btnSeekBDC: "Vai al BDC",
      btnSnapshot: "Cattura Frame con Angoli",
      btnSaveAngles: "Salva Angoli nella Scheda",
      videoTip: "Suggerimento: Il tracker rileva automaticamente la cadenza (RPM) e calcola la mediana dell'angolo al BDC.",

      // Metrics
      metricKneeBDC: "Ginocchio al BDC (Mediana)",
      metricKneeTarget: "Target: 140° - 145° (al punto morto inf.)",
      metricCadence: "Cadenza di Pedalata",
      metricCadenceSub: "Rilevata da oscillazione caviglia",
      metricTorso: "Inclinazione Busto (Torso)",
      metricTorsoTarget: "Target: 40° - 50° (Endurance) / 35°-42° (Race)",
      metricShoulder: "Angolo Spalla",
      metricShoulderTarget: "Target: 80° - 90° (appoggio neutro)",
      metricElbow: "Angolo Gomito",
      metricElbowTarget: "Target: 150° - 165° (braccia morbide)",
      metricHipTDC: "Anca Chiusa (TDC)",
      metricHipTarget: "Target: > 45° (evita impingement)",
      metricFrontalAlign: "Allineamento Ginocchio",
      metricFrontalTarget: "Tracciamento asse anca-caviglia",
      metricFrontalDev: "Deviazione Laterale",
      metricFrontalDevSub: "Indicatore Q-Factor / Tacchette",

      // Statuses
      stOptimal: "Ottimale",
      stLowSaddle: "Sella Bassa",
      stHighSaddle: "Sella Alta",
      stTracking: "In pedalata",
      stDetecting: "Rilevamento...",
      stNeutral: "Neutro",

      // Diagnostics Tab
      diagTitle: "Indice di Idoneità Posizione",
      diagAnalyzing: "Analisi delle anomalie biomeccaniche in corso...",
      diagCritical: "Critici",
      diagModerate: "Moderati",
      btnCopyPlan: "Copia Piano",
      btnApplyToLog: "Inserisci nel Registro",
      diagSectionIssues: "Cause Biomeccaniche & Anomalie Rilevate",
      diagSectionPlan: "Piano di Intervento Ordinato (Action Plan)",
      diagPlanNote: "Una modifica per volta",
      diagNoIssues: "Nessuna anomalia biomeccanica o sintomo critico riscontrato. Posizione bilanciata!",
      diagCurrent: "Prima:",
      diagTarget: "Target:",
      diagAction: "Intervento consigliato:",

      // Calculator & Cockpit
      calcSection1: "Calcolatore Teorico Altezza Sella (LeMond & Hamley)",
      calcSec1Note: "Punto di partenza statico",
      calcInseamLbl: "Cavallo (mm):",
      calcHeightLbl: "Altezza Ciclista (cm):",
      calcCrankLbl: "Lunghezza Pedivella (mm):",
      calcSaddleLbl: "Sella Attuale (mm):",
      calcMethodCol: "Metodo di Calcolo",
      calcFormulaCol: "Formula Applicata",
      calcValCol: "Valore Calcolato",
      calcCompCol: "Confronto con Misura Attuale",
      calcLemondName: "Metodo Greg LeMond",
      calcHamleyName: "Metodo Hamley 109%",
      calcRangeName: "Range Consigliato",
      calcHolmesName: "Metodo Holmes (Dinamico)",
      btnApplySaddle: "Applica alla Scheda",

      calcSection2: "Simulatore Geometrico Cockpit (Attacco & Spessori)",
      calcSec2Note: "Variazione vettoriale Reach & Stack",
      calcSec2Intro: "Simula graficamente l'impatto di cambiare lunghezza o inclinazione dell'attacco manubrio e l'altezza degli spessori prima di smontare la bici.",
      simHeadAngle: "Angolo Tubo Sterzo (°):",
      simCurrentSetup: "Assetto Attuale (Grigio)",
      simProposedSetup: "Nuovo Assetto Proposto (Ciano)",
      simSpacers: "Spessori sotto l'attacco (mm):",
      simStemLen: "Lunghezza Attacco (mm):",
      simStemAngle: "Inclinazione Attacco (°):",
      simBarReach: "Reach Manubrio (mm):",
      simBarDrop: "Drop Manubrio (mm):",
      simDeltaReachLbl: "Variazione Reach:",
      simDeltaStackLbl: "Variazione Altezza/Stack:",

      // Synchronized Player
      dualTitle: "Player Video Sincronizzato (Prima vs Dopo)",
      dualNote: "Pedalata in lockstep al BDC",
      dualVideo1Lbl: "🔴 Video Assetto PRIMA",
      dualVideo2Lbl: "🟢 Video Assetto DOPO",
      btnDualPlay: "▶ Play Sincronizzato",
      btnDualPause: "⏸ Pausa Entrambi",
      btnDualSync: "🔗 Sincronizza Fase al BDC",

      // Import Dialog
      importTitle: "Importa Scheda / Dati Bike Fit",
      importDropText: "Trascina qui il tuo file .md (Markdown) o .json",
      importDropSub: "oppure clicca per selezionarlo dal computer",
      importPasteLbl: "Oppure incolla qui il testo Markdown o JSON:",
      btnProcessImport: "Importa Dati",

      // Camera Positioning & Warnings
      camModeLabel: "Modalità Camera:",
      camModeBikeOnly: "Setup Bici (Vuota)",
      camModeRiderOnBike: "Ciclista in Sella",
      camLevelOk: "In bolla",
      camWarnTiltForward: "Camera inclinata in avanti! Raddrizza lo smartphone.",
      camWarnTiltBack: "Camera inclinata indietro! Raddrizza lo smartphone.",
      camWarnRoll: "Camera storta lateralmente! Allinea la livella.",
      camAngleOk: "90° Sagittale OK",
      camWarnDiagonal: "Camera diagonale! Spostati a 90° di lato alla bici.",
      camFramingOk: "Inquadratura OK",
      camWarnPedalsCut: "Pedali tagliati in basso! Allontana o abbassa la camera.",
      camWarnHeadCut: "Testa o spalle tagliate in alto! Allontana la camera.",
      camWarnTooClose: "Troppo vicino! Inquadra l'intera bici e il ciclista.",
      camWarnTooFar: "Troppo lontano! Avvicina la camera per maggiore precisione.",
      camWarnNoRider: "Nessun ciclista rilevato in sella.",
      camWarnBikeAlign: "Allinea la sagoma della bici con l'orizzonte e l'asse ruote.",
      camStatusReadyToRecord: "Inquadratura calibrata! Pronto a registrare.",

      // In-App Video Recording
      btnRecordVideo: "Registra Video (20s)",
      btnStopRecording: "Ferma Registrazione",
      recTimerLabel: "REC",
      countdownGetReady: "PREPARATI A PEDALARE!",
      btnDownloadRecordedVideo: "Scarica Clip",
      videoRecordingSaved: "Clip registrata con successo e caricata nell'analizzatore!",

      // Photo Anthropometry Wizard
      photoWizardBtn: "Rileva Misure da Foto (AI)",
      photoWizardTitle: "Rilevamento Misure Corporee da Foto (AI)",
      photoWizardSub: "Estrae automaticamente cavallo, femore, tibia, busto e braccia",
      photoStep1: "1. Altezza Reale & Istruzioni",
      photoStep2: "2. Scatto o Caricamento",
      photoStep3: "3. Verifica Misure & Applicazione",
      photoHeightPrompt: "Tua altezza reale (cm):",
      photoHeightHelp: "Necessaria come riferimento metrico per convertire i pixel in millimetri reali.",
      photoInstructionsTitle: "Come posizionarsi per una misurazione accurata:",
      photoInstruction1: "Posa ad A: in piedi, schiena dritta, gambe leggermente divaricate (~20 cm), braccia staccate dal corpo (~30°).",
      photoInstruction2: "Abbigliamento: completo da ciclismo aderente (salopette + maglia/intimo tecnico) o intimo, a tua preferenza.",
      photoInstruction3: "Fotocamera: posizionata ad altezza ombelico/bacino (~90-100 cm da terra), a 2.5 - 3 metri di distanza, inquadratura dalla testa ai piedi.",
      photoPrivacyNote: "🔒 Privacy garantita: l'elaborazione avviene 100% in locale nel tuo browser. Nessuna foto viene mai inviata a server esterni.",
      btnUploadPhoto: "📁 Carica Foto",
      btnStartPhotoCam: "📷 Scatta con Timer (5s)",
      photoProcessing: "Analisi MediaPipe dei punti corporei in corso...",
      photoDetectedTitle: "Misure Rilevate:",
      photoInseamLbl: "Cavallo (Inseam):",
      photoFemurLbl: "Femore (Thigh):",
      photoTibiaLbl: "Tibia (Lower leg):",
      photoTorsoLbl: "Busto (Torso):",
      photoArmLbl: "Braccio (Arm):",
      photoSitBonesNote: "Nota: La larghezza delle ossa ischiatiche non è visibile da foto e va rilevata tramite l'impronta su cartone.",
      btnApplyPhotoMeasurements: "✅ Applica alla Scheda Dati",
      photoAppliedToast: "Misure corporee applicate con successo alla scheda dati!",
      photoErrorNoPerson: "Nessuna figura umana intera rilevata. Assicurati che testa e piedi siano ben visibili nella foto.",

      // Badges
      badgeEssential: "essenziale",
      badgeDetail: "dettaglio"
    },

    en: {
      // Header & Navigation
      kicker: "Biomechanics & Bike Fitting Studio",
      brandTitle: "VELOFIT STUDIO",
      menuActions: "Actions / File",
      menuSecData: "Data & Samples",
      menuItemSample: "Load Sample (Argon 18)",
      menuItemImport: "Import File (.md / .json)",
      menuSecExport: "Export & Sharing",
      menuItemExportMd: "Export Markdown Dossier (.md)",
      menuItemExportJson: "Export JSON Data (.json)",
      menuItemCopy: "Copy Markdown to Clipboard",
      menuItemReset: "Reset All Data",
      btnLoadSample: "⚡ Load Sample",
      btnImport: "📂 Import",
      btnExportMd: "💾 Export .md",
      btnExportJson: "💾 JSON",
      btnCopy: "📋 Copy",
      btnReset: "Reset form",
      themeSystem: "System theme",
      themeLight: "Light theme",
      themeDark: "Dark theme",
      tabForm: "Fit Sheet",
      tabVideo: "Video & Angles",
      tabDiagnostics: "Diagnostics & Plan",
      tabCalculator: "Calculators & Cockpit",
      tabComparison: "Dual Comparison",
      tabGlossary: "Glossary",

      // Sticky bar
      modeRapid: "Quick (40m)",
      modeComplete: "Detailed (Full)",
      btnExpandAll: "Open explanations",
      btnCloseAll: "Close explanations",
      statusReady: "Ready",
      statusSaved: "Saved locally",
      statusSaveError: "Save error",
      statusLastSave: "Last saved",
      tapeCompiled: "completed",

      // Video Analyzer
      btnUploadVideo: "Upload Video",
      btnToggleCamOn: "Start Camera",
      btnToggleCamOff: "Stop Camera",
      btnPlayDemo: "Demo Rider",
      lblViewMode: "Camera View:",
      optLateral: "Side View (Angles & Cadence)",
      optFrontal: "Front View (Knee Tracking)",
      lblSide: "Side:",
      optSideAuto: "Auto Detect",
      optSideRight: "Right Side",
      optSideLeft: "Left Side",
      lblBanner: "Banner:",
      btnPlay: "Play",
      btnPause: "Pause",
      btnStepBack: "-1 fr",
      btnStepFwd: "+1 fr",
      btnSeekBDC: "Seek BDC",
      btnSnapshot: "Capture Frame with Angles",
      btnSaveAngles: "Save Angles to Sheet",
      videoTip: "Tip: The tracker automatically detects pedaling cadence (RPM) and calculates median knee extension at BDC.",

      // Metrics
      metricKneeBDC: "Knee at BDC (Median)",
      metricKneeTarget: "Target: 140° - 145° (at bottom dead center)",
      metricCadence: "Pedaling Cadence",
      metricCadenceSub: "Tracked via ankle oscillation",
      metricTorso: "Torso Angle (Back)",
      metricTorsoTarget: "Target: 40° - 50° (Endurance) / 35°-42° (Race)",
      metricShoulder: "Shoulder Angle",
      metricShoulderTarget: "Target: 80° - 90° (neutral reach)",
      metricElbow: "Elbow Angle",
      metricElbowTarget: "Target: 150° - 165° (soft flexed arms)",
      metricHipTDC: "Hip Closed Angle (TDC)",
      metricHipTarget: "Target: > 45° (avoids impingement)",
      metricFrontalAlign: "Knee Alignment",
      metricFrontalTarget: "Tracking hip-to-ankle axis",
      metricFrontalDev: "Lateral Deviation",
      metricFrontalDevSub: "Q-Factor & Cleats indicator",

      // Statuses
      stOptimal: "Optimal",
      stLowSaddle: "Low Saddle",
      stHighSaddle: "High Saddle",
      stTracking: "Pedaling",
      stDetecting: "Detecting...",
      stNeutral: "Neutral",

      // Diagnostics Tab
      diagTitle: "Position Fitness Index",
      diagAnalyzing: "Analyzing biomechanical anomalies...",
      diagCritical: "Critical",
      diagModerate: "Moderate",
      btnCopyPlan: "Copy Plan",
      btnApplyToLog: "Insert into Log",
      diagSectionIssues: "Biomechanical Causes & Detected Anomalies",
      diagSectionPlan: "Ranked 1-2-3 Action Plan",
      diagPlanNote: "One adjustment at a time across 3 rides",
      diagNoIssues: "No critical biomechanical anomalies or severe symptoms found. Fit is well balanced!",
      diagCurrent: "Current:",
      diagTarget: "Target:",
      diagAction: "Recommended fix:",

      // Calculator & Cockpit
      calcSection1: "Static Saddle Height Calculator (LeMond & Hamley)",
      calcSec1Note: "Static starting baseline",
      calcInseamLbl: "Inseam (mm):",
      calcHeightLbl: "Rider Height (cm):",
      calcCrankLbl: "Crank Length (mm):",
      calcSaddleLbl: "Current Saddle (mm):",
      calcMethodCol: "Calculation Method",
      calcFormulaCol: "Applied Formula",
      calcValCol: "Calculated Value",
      calcCompCol: "Comparison with Current Fit",
      calcLemondName: "Greg LeMond Method",
      calcHamleyName: "Hamley 109% Method",
      calcRangeName: "Recommended Range",
      calcHolmesName: "Holmes Dynamic Method",
      btnApplySaddle: "Apply to Sheet",

      calcSection2: "Interactive Cockpit Geometry Simulator (Stem & Spacers)",
      calcSec2Note: "Vector Reach & Stack delta solver",
      calcSec2Intro: "Graphically simulate the impact of changing stem length, stem angle, and headset spacer height before touching bike bolts.",
      simHeadAngle: "Head Tube Angle (°):",
      simCurrentSetup: "Current Setup (Grey)",
      simProposedSetup: "Proposed Setup (Cyan)",
      simSpacers: "Spacers under stem (mm):",
      simStemLen: "Stem Length (mm):",
      simStemAngle: "Stem Angle (°):",
      simBarReach: "Handlebar Reach (mm):",
      simBarDrop: "Handlebar Drop (mm):",
      simDeltaReachLbl: "Reach Delta:",
      simDeltaStackLbl: "Stack / Height Delta:",

      // Synchronized Player
      dualTitle: "Synchronized Dual Video Player (Before vs After)",
      dualNote: "Lockstep pedaling synchronized at BDC",
      dualVideo1Lbl: "🔴 BEFORE Setup Video",
      dualVideo2Lbl: "🟢 AFTER Setup Video",
      btnDualPlay: "▶ Synchronized Play",
      btnDualPause: "⏸ Pause Both",
      btnDualSync: "🔗 Lock Phase at BDC",

      // Import Dialog
      importTitle: "Import Bike Fit Data Sheet",
      importDropText: "Drag & drop your .md (Markdown) or .json file here",
      importDropSub: "or click to select from your computer",
      importPasteLbl: "Or paste Markdown or JSON text here:",
      btnProcessImport: "Import Data",

      // Camera Positioning & Warnings
      camModeLabel: "Camera Mode:",
      camModeBikeOnly: "Bike Setup (Empty)",
      camModeRiderOnBike: "Rider on Bike",
      camLevelOk: "Level OK",
      camWarnTiltForward: "Camera tilted forward! Straighten your phone.",
      camWarnTiltBack: "Camera tilted back! Straighten your phone.",
      camWarnRoll: "Camera tilted sideways! Align the spirit level.",
      camAngleOk: "90° Sagittal OK",
      camWarnDiagonal: "Diagonal camera angle! Move directly to the side (90°) of the bike.",
      camFramingOk: "Framing OK",
      camWarnPedalsCut: "Pedals cut off at bottom! Move camera back or lower it.",
      camWarnHeadCut: "Head or shoulders cut off at top! Move camera back.",
      camWarnTooClose: "Too close! Fit the entire bike and rider in frame.",
      camWarnTooFar: "Too far! Move camera closer for higher accuracy.",
      camWarnNoRider: "No rider detected on bike.",
      camWarnBikeAlign: "Align the bike outline with the horizon and wheel axles.",
      camStatusReadyToRecord: "Framing calibrated! Ready to record.",

      // In-App Video Recording
      btnRecordVideo: "Record Video (20s)",
      btnStopRecording: "Stop Recording",
      recTimerLabel: "REC",
      countdownGetReady: "GET READY TO PEDAL!",
      btnDownloadRecordedVideo: "Download Clip",
      videoRecordingSaved: "Video clip recorded successfully and loaded into analyzer!",

      // Photo Anthropometry Wizard
      photoWizardBtn: "Measure from Photo (AI)",
      photoWizardTitle: "AI Body Anthropometry from Photo",
      photoWizardSub: "Automatically extracts inseam, femur, tibia, torso, and arm length",
      photoStep1: "1. Known Height & Guidelines",
      photoStep2: "2. Capture or Upload",
      photoStep3: "3. Review Measurements & Apply",
      photoHeightPrompt: "Your known height (cm):",
      photoHeightHelp: "Required as a metric scale anchor to convert pixels into exact millimeters.",
      photoInstructionsTitle: "How to pose for an accurate measurement:",
      photoInstruction1: "A-Pose: stand straight, feet shoulder-width (~20 cm apart), arms slightly away from sides (~30°).",
      photoInstruction2: "Attire: tight cycling kit (bib shorts + snug base layer) or underwear, according to your preference.",
      photoInstruction3: "Camera: placed at belly/hip height (~90-100 cm off ground), 2.5 - 3 meters away, full head-to-toe frame.",
      photoPrivacyNote: "🔒 Privacy guaranteed: processing runs 100% locally in your browser. No photos are ever sent to any server.",
      btnUploadPhoto: "📁 Upload Photo",
      btnStartPhotoCam: "📷 Take Photo with Timer (5s)",
      photoProcessing: "MediaPipe landmark analysis in progress...",
      photoDetectedTitle: "Extracted Body Measurements:",
      photoInseamLbl: "Inseam (Cavallo):",
      photoFemurLbl: "Thigh / Femur:",
      photoTibiaLbl: "Lower Leg / Tibia:",
      photoTorsoLbl: "Torso Length:",
      photoArmLbl: "Arm Length:",
      photoSitBonesNote: "Note: Sit bone width cannot be measured visually and should be taken with the cardboard impression test.",
      btnApplyPhotoMeasurements: "✅ Apply to Fit Sheet",
      photoAppliedToast: "Body measurements applied successfully to fit sheet!",
      photoErrorNoPerson: "No complete human figure detected. Ensure head and feet are fully visible in the photo.",

      // Badges
      badgeEssential: "essential",
      badgeDetail: "detail"
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N };
}
