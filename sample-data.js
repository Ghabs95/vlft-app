/**
 * Pre-extracted sample dataset from 'Bike Position Sheet.md'
 * Argon 18 Gallium Road Bike Fit Session
 */
const SAMPLE_ARGON18_DATA = {
  mode: "rapido",
  v: {
    // 01. Profilo
    "data": "05/08/2026",
    "disciplina": "Strada",
    "tipo_manubrio": "Piega da strada",
    "uso": "Allenamento e gare",
    "obiettivo": "Potenza ed efficienza",
    "obiettivo_txt": "Risolvere perdita sensibilità testicoli e intorpidimento mani",
    "ore": "10",
    "durata": "2h30'",
    "indoor": "Solo outdoor",

    // 02. La bici
    "marca": "Argon 18 Gallium",
    "taglia": "M",

    // 03. Componenti
    "sella_mod": "Prologo Kappa Space",
    "sella_larg": "145",
    "attacco_lun": "120",
    "attacco_ang": "6°",
    "spessori": "3 spessori, 23 mm",
    "manubrio_larg": "41",
    "manubrio_std": "Esterno-esterno (e-e)",
    "pedivelle": "170",
    "fondello": "Pissei, 6 anni",

    // 04. Regolazioni attuali
    "h_sella": "750",
    "arretramento": "20",
    "incl_sella": "-1",
    "reach_sm": "520",
    "drop_sm": "40",

    // 05. Misure corporee
    "altezza": "173",
    "cavallo": "770",

    // 06. Ossa ischiatiche
    "ischi_mm": "140",
    "ischi_foto": "No",

    // 07. Mobilità
    "basculamento": "Ruoto bene in avanti, la schiena bassa si inarca",

    // 08. Fastidi e sintomi (campi testo)
    "storia_inizio": "Ai piedi da sempre, alle mani e ai genitali recentemente dopo modifiche alla sella.",
    "meglio_peggio": "Per i piedi migliora con acqua o allentando/rimuovendo le scarpe. Per mani e genitali alzarsi sui pedali.",
    "persistenza": "No, passa subito",
    "cambi": "Sella alzata e avanzata.",

    // 09. Foto e video
    "supporto": "Nessuno dei due, non ho ancora registrato"
  },
  chk: {
    "v1": false,
    "v2": false,
    "v3": false,
    "v4": false,
    "v5": false,
    "v6": false,
    "v7": false,
    "f1": false,
    "f2": false,
    "f3": false,
    "f4": false,
    "f5": false,
    "f6": false
  },
  sx: {
    "mani": { p: "Lieve", q: "1h 30'", l: "Sinistra", n: "" },
    "sella": { p: "Marcato", q: "1h", l: "Entrambi", n: "" },
    "piedi": { p: "Marcato", q: "1h", l: "Entrambi", n: "" }
  },
  log: [
    ["05/08/2026", "Avanzamento sella e inclinazione -1°", "Arretramento 25mm, 0°", "Arretramento 20mm, -1°", "In test"]
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_ARGON18_DATA };
}
