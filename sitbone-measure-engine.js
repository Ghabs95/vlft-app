/**
 * VELOFIT STUDIO — SIT-BONE CARDBOARD IMPRESSION ANALYZER (3X LOUPE & CREDIT-CARD SCALE)
 * Measures distance between ischial tuberosity impressions on cardboard using a standard
 * ISO/IEC 7810 ID-1 card (Credit Card / ID / Driver's License: 85.60 mm wide) for metric scale.
 * Recommends optimal saddle width for Road, Gravel/Endurance, and MTB.
 */

class SitBoneMeasureEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.img = null;

    // ISO/IEC 7810 ID-1 standard width = 85.60 mm
    this.CARD_WIDTH_MM = 85.60;

    // 4 Draggable Reference Pins
    this.pins = {
      cardLeft: { x: 0, y: 0, label: "Carta: Lato Sx", color: "#F59E0B" },
      cardRight: { x: 0, y: 0, label: "Carta: Lato Dx", color: "#F59E0B" },
      boneLeft: { x: 0, y: 0, label: "Centro Ischio Sx", color: "#10B981" },
      boneRight: { x: 0, y: 0, label: "Centro Ischio Dx", color: "#10B981" }
    };

    this.activePinKey = null;
    this.isDragging = false;
    this.scale = 1.0;

    // 3x Magnifying Loupe
    this.loupeRadius = 65;
    this.loupeZoom = 3.0;

    this.measurements = {
      scaleMmPerPx: 1.0,
      sitBoneDistMm: 0,
      recSaddleRoadMm: 0,
      recSaddleEnduranceMm: 0,
      recSaddleMtbMm: 0
    };

    this.onMeasurementsChanged = null;
    this._bindEvents();
  }

  loadImage(imgElement) {
    this.img = imgElement;
    this._fitCanvas();
    this._initializeDefaultPins();
    this.recompute();
    this.render();
  }

  _fitCanvas() {
    if (!this.img) return;
    const parent = this.canvas.parentElement;
    const maxW = parent ? parent.clientWidth : 750;
    const maxH = Math.min(window.innerHeight * 0.60, 520);

    const ratio = this.img.naturalWidth / this.img.naturalHeight;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    this.canvas.width = Math.round(w);
    this.canvas.height = Math.round(h);
    this.scale = this.canvas.width / this.img.naturalWidth;
  }

  _initializeDefaultPins() {
    if (!this.img) return;
    const iw = this.img.naturalWidth;
    const ih = this.img.naturalHeight;

    // Default card pin positions (lower center)
    this.pins.cardLeft.x = Math.round(iw * 0.35);
    this.pins.cardLeft.y = Math.round(ih * 0.75);
    this.pins.cardRight.x = Math.round(iw * 0.65);
    this.pins.cardRight.y = Math.round(ih * 0.75);

    // Default sit-bone depression positions (upper-middle)
    this.pins.boneLeft.x = Math.round(iw * 0.38);
    this.pins.boneLeft.y = Math.round(ih * 0.40);
    this.pins.boneRight.x = Math.round(iw * 0.62);
    this.pins.boneRight.y = Math.round(ih * 0.40);
  }

  recompute() {
    if (!this.img) return;

    // 1. Metric calibration from credit card reference
    const dxCard = this.pins.cardRight.x - this.pins.cardLeft.x;
    const dyCard = this.pins.cardRight.y - this.pins.cardLeft.y;
    const cardPx = Math.hypot(dxCard, dyCard);

    const mmPerPx = this.CARD_WIDTH_MM / Math.max(1, cardPx);
    this.measurements.scaleMmPerPx = mmPerPx;

    // 2. Sit-bone distance in pixels & mm
    const dxBone = this.pins.boneRight.x - this.pins.boneLeft.x;
    const dyBone = this.pins.boneRight.y - this.pins.boneLeft.y;
    const bonePx = Math.hypot(dxBone, dyBone);
    const distMm = Math.round(bonePx * mmPerPx);

    this.measurements.sitBoneDistMm = distMm;

    // 3. Recommended saddle widths
    this.measurements.recSaddleRoadMm = distMm + 20;
    this.measurements.recSaddleEnduranceMm = distMm + 25;
    this.measurements.recSaddleMtbMm = distMm + 30;

    if (this.onMeasurementsChanged) {
      this.onMeasurementsChanged(this.measurements);
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!ctx || !this.img) return;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.img, 0, 0, w, h);

    const toScreen = (pt) => ({ x: pt.x * this.scale, y: pt.y * this.scale });

    const sCardL = toScreen(this.pins.cardLeft);
    const sCardR = toScreen(this.pins.cardRight);
    const sBoneL = toScreen(this.pins.boneLeft);
    const sBoneR = toScreen(this.pins.boneRight);

    ctx.save();

    // 1. Draw Card Calibration Bar (Amber)
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sCardL.x, sCardL.y);
    ctx.lineTo(sCardR.x, sCardR.y);
    ctx.stroke();

    // 2. Draw Sit-Bone Span Bar (Emerald Green)
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "#10B981";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(sBoneL.x, sBoneL.y);
    ctx.lineTo(sBoneR.x, sBoneR.y);
    ctx.stroke();

    // Center badge with distance
    const mx = (sBoneL.x + sBoneR.x) / 2;
    const my = (sBoneL.y + sBoneR.y) / 2;
    const lblText = `${this.measurements.sitBoneDistMm} mm`;
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    const tw = ctx.measureText(lblText).width;
    ctx.fillStyle = "rgba(11, 16, 26, 0.9)";
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(mx - tw / 2 - 10, my - 13, tw + 20, 26, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(lblText, mx, my);

    ctx.restore();

    // 3. Draw Pins
    Object.entries(this.pins).forEach(([key, pin]) => {
      const pt = toScreen(pin);
      const isActive = this.activePinKey === key;
      this._drawPin(pt.x, pt.y, pin.color, pin.label, isActive);
    });

    // 4. Draw Loupe if dragging
    if (this.isDragging && this.activePinKey && this.pins[this.activePinKey]) {
      const activePin = this.pins[this.activePinKey];
      const screenPt = toScreen(activePin);
      this._drawLoupe(activePin.x, activePin.y, screenPt.x, screenPt.y, activePin.color);
    }
  }

  _drawPin(x, y, color, label, isActive) {
    const ctx = this.ctx;
    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, isActive ? 13 : 9, 0, Math.PI * 2);
    ctx.fillStyle = color + (isActive ? "66" : "33");
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, isActive ? 7 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    const tw = ctx.measureText(label).width;
    const badgeW = tw + 10;
    const badgeH = 18;
    const badgeX = x - badgeW / 2;
    const badgeY = y - (isActive ? 24 : 20);

    ctx.fillStyle = "rgba(11, 16, 26, 0.88)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, badgeY + badgeH / 2);

    ctx.restore();
  }

  _drawLoupe(imgX, imgY, screenX, screenY, color) {
    const ctx = this.ctx;
    const r = this.loupeRadius;
    const zoom = this.loupeZoom;

    let loupeX = screenX;
    let loupeY = screenY - r - 35;
    if (loupeY - r < 10) loupeY = screenY + r + 35;
    if (loupeX - r < 10) loupeX = r + 10;
    if (loupeX + r > this.canvas.width - 10) loupeX = this.canvas.width - r - 10;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    ctx.arc(loupeX, loupeY, r, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.clip();

    const sourceW = (r * 2) / (zoom * this.scale);
    const sourceH = (r * 2) / (zoom * this.scale);
    const sourceX = imgX - sourceW / 2;
    const sourceY = imgY - sourceH / 2;

    ctx.drawImage(
      this.img,
      sourceX, sourceY, sourceW, sourceH,
      loupeX - r, loupeY - r, r * 2, r * 2
    );

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(loupeX - r + 8, loupeY);
    ctx.lineTo(loupeX - 5, loupeY);
    ctx.moveTo(loupeX + 5, loupeY);
    ctx.lineTo(loupeX + r - 8, loupeY);
    ctx.moveTo(loupeX, loupeY - r + 8);
    ctx.lineTo(loupeX, loupeY - 5);
    ctx.moveTo(loupeX, loupeY + 5);
    ctx.lineTo(loupeX, loupeY + r - 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(loupeX, loupeY, 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(loupeX, loupeY, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }

  _bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        screenX: clientX - rect.left,
        screenY: clientY - rect.top,
        imgX: (clientX - rect.left) / this.scale,
        imgY: (clientY - rect.top) / this.scale
      };
    };

    const findClosestPin = (screenX, screenY) => {
      let closest = null;
      let minD = 32;
      Object.entries(this.pins).forEach(([key, pin]) => {
        const sx = pin.x * this.scale;
        const sy = pin.y * this.scale;
        const d = Math.hypot(sx - screenX, sy - screenY);
        if (d < minD) {
          minD = d;
          closest = key;
        }
      });
      return closest;
    };

    const onDown = (e) => {
      if (!this.img) return;
      const pos = getPos(e);
      const pinKey = findClosestPin(pos.screenX, pos.screenY);
      if (pinKey) {
        this.activePinKey = pinKey;
        this.isDragging = true;
        this.render();
        if (e.cancelable) e.preventDefault();
      }
    };

    const onMove = (e) => {
      if (!this.img) return;
      const pos = getPos(e);
      if (this.isDragging && this.activePinKey) {
        const clampedX = Math.max(0, Math.min(this.img.naturalWidth, pos.imgX));
        const clampedY = Math.max(0, Math.min(this.img.naturalHeight, pos.imgY));
        this.pins[this.activePinKey].x = Math.round(clampedX);
        this.pins[this.activePinKey].y = Math.round(clampedY);
        this.recompute();
        this.render();
        if (e.cancelable) e.preventDefault();
      } else {
        const hoverPin = findClosestPin(pos.screenX, pos.screenY);
        this.canvas.style.cursor = hoverPin ? "grab" : "default";
      }
    };

    const onUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.render();
      }
    };

    this.canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    this.canvas.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }
}

if (typeof window !== "undefined") {
  window.SitBoneMeasureEngine = SitBoneMeasureEngine;
}
