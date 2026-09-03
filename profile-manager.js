/**
 * VELOFIT STUDIO — PROFILE & MULTI-BIKE MANAGER (CLIENT-ONLY)
 * Manages multiple rider and bike profiles in localStorage without any cloud or server dependencies.
 */

const ProfileManager = {
  INDEX_KEY: "bikefit:profiles:meta",
  PROFILE_KEY_PREFIX: "bikefit:profile:",
  LEGACY_KEY: "bikefit:pro:v3",

  _cache: null,

  init() {
    try {
      const raw = localStorage.getItem(this.INDEX_KEY);
      if (raw) {
        this._cache = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("ProfileManager index read error:", e);
    }

    if (!this._cache || !Array.isArray(this._cache.profiles) || this._cache.profiles.length === 0) {
      let initialData = null;
      try {
        const legacyRaw = localStorage.getItem(this.LEGACY_KEY);
        if (legacyRaw) initialData = JSON.parse(legacyRaw);
      } catch (e) {}

      const defaultId = "prof_" + Date.now();
      const bikeName = (initialData && initialData.v && (initialData.v.bici_modello || initialData.v.ciclista_nome)) 
        ? (initialData.v.bici_modello || initialData.v.ciclista_nome) 
        : "Bici Principale";

      this._cache = {
        activeId: defaultId,
        profiles: [
          {
            id: defaultId,
            name: bikeName,
            bikeModel: (initialData && initialData.v && initialData.v.bici_modello) || "",
            riderName: (initialData && initialData.v && initialData.v.ciclista_nome) || "",
            updatedAt: Date.now()
          }
        ]
      };

      this._saveIndex();
      if (initialData) {
        this._saveProfileData(defaultId, initialData);
      }
    }
  },

  _saveIndex() {
    try {
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(this._cache));
    } catch (e) {
      console.error("ProfileManager index write error:", e);
    }
  },

  _saveProfileData(id, data) {
    try {
      localStorage.setItem(this.PROFILE_KEY_PREFIX + id, JSON.stringify(data));
      // Keep legacy key updated for backwards compatibility
      if (id === this._cache.activeId) {
        localStorage.setItem(this.LEGACY_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.error("ProfileManager data write error:", e);
    }
  },

  getActiveProfile() {
    if (!this._cache) this.init();
    const active = this._cache.profiles.find(p => p.id === this._cache.activeId);
    return active || this._cache.profiles[0];
  },

  listProfiles() {
    if (!this._cache) this.init();
    return this._cache.profiles;
  },

  createProfile(name, initialData = null) {
    if (!this._cache) this.init();
    const id = "prof_" + Date.now();
    const cleanName = (name && name.trim()) ? name.trim() : `Bici ${this._cache.profiles.length + 1}`;

    const data = initialData || {
      version: 3,
      mode: "rapido",
      v: { bici_modello: cleanName },
      chk: {},
      sx: {},
      log: [["", "", "", "", ""]],
      videoAngles: null
    };

    const newMeta = {
      id,
      name: cleanName,
      bikeModel: (data.v && data.v.bici_modello) || cleanName,
      riderName: (data.v && data.v.ciclista_nome) || "",
      updatedAt: Date.now()
    };

    this._cache.profiles.push(newMeta);
    this._cache.activeId = id;
    this._saveIndex();
    this._saveProfileData(id, data);
    return newMeta;
  },

  duplicateActiveProfile(customName = null) {
    if (!this._cache) this.init();
    const active = this.getActiveProfile();
    const activeData = this.loadActiveState() || {};
    const name = customName || `${active.name} (Copia)`;

    const clonedData = JSON.parse(JSON.stringify(activeData));
    if (!clonedData.v) clonedData.v = {};
    if (clonedData.v.bici_modello) {
      clonedData.v.bici_modello = `${clonedData.v.bici_modello} (Copia)`;
    }

    return this.createProfile(name, clonedData);
  },

  switchProfile(id) {
    if (!this._cache) this.init();
    const target = this._cache.profiles.find(p => p.id === id);
    if (!target) return false;
    this._cache.activeId = id;
    this._saveIndex();
    return true;
  },

  renameProfile(id, newName) {
    if (!this._cache) this.init();
    const p = this._cache.profiles.find(x => x.id === id);
    if (!p) return false;
    p.name = newName.trim();
    p.updatedAt = Date.now();
    this._saveIndex();
    return true;
  },

  updateActiveMetaFromState(stateObj) {
    if (!this._cache || !stateObj || !stateObj.v) return;
    const active = this.getActiveProfile();
    if (!active) return;

    let changed = false;
    const bike = stateObj.v.bici_modello;
    const rider = stateObj.v.ciclista_nome;

    if (bike && bike !== active.bikeModel) {
      active.bikeModel = bike;
      if (active.name.startsWith("Bici ") || active.name === "Bici Principale") {
        active.name = bike;
      }
      changed = true;
    }
    if (rider && rider !== active.riderName) {
      active.riderName = rider;
      changed = true;
    }

    if (changed) {
      active.updatedAt = Date.now();
      this._saveIndex();
    }
  },

  deleteProfile(id) {
    if (!this._cache) this.init();
    if (this._cache.profiles.length <= 1) {
      return { success: false, reason: "CANNOT_DELETE_LAST" };
    }

    const idx = this._cache.profiles.findIndex(p => p.id === id);
    if (idx === -1) return { success: false, reason: "NOT_FOUND" };

    this._cache.profiles.splice(idx, 1);
    try {
      localStorage.removeItem(this.PROFILE_KEY_PREFIX + id);
    } catch (e) {}

    if (this._cache.activeId === id) {
      this._cache.activeId = this._cache.profiles[0].id;
    }

    this._saveIndex();
    return { success: true, newActiveId: this._cache.activeId };
  },

  saveActiveState(stateObj) {
    if (!this._cache) this.init();
    const activeId = this._cache.activeId;
    this._saveProfileData(activeId, stateObj);

    const active = this.getActiveProfile();
    if (active) {
      active.updatedAt = Date.now();
      if (stateObj.v && stateObj.v.bici_modello) {
        active.bikeModel = stateObj.v.bici_modello;
      }
      this._saveIndex();
    }
  },

  loadActiveState() {
    if (!this._cache) this.init();
    const activeId = this._cache.activeId;
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY_PREFIX + activeId);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("ProfileManager load error:", e);
    }
    try {
      const legacy = localStorage.getItem(this.LEGACY_KEY);
      if (legacy) return JSON.parse(legacy);
    } catch (e) {}

    return null;
  }
};

if (typeof window !== "undefined") {
  window.ProfileManager = ProfileManager;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ProfileManager };
}
