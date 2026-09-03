/**
 * VELOFIT STUDIO — FOOT ROTATION & CLEAT FLOAT ANALYZER (3X LOUPE)
 * Analyzes natural foot flare / tibial torsion from a dangling-feet photo (no floor contact).
 * Computes individual left and right abduction angles and recommends optimal cleat float and rotation.
 */

class FootMeasureEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.img = null;

    // 4 Draggable Reference Pins (Heel & 2nd Toe axis)
    this.pins = {
      lHeel: { x: 0, y: 0, label: "Tallone Sx", color: "#38BDF8" },
      lToe: { x: 0, y: 0, label: "2° Dito Sx", color: "#38BDF8" },
      rHeel: { x: 0, y: 0, label: "Tallone Dx", color: "#EC4899" },
      rToe: { x: 0, y: 0, label: "2° Dito Dx", color: "#EC4899" }
    };

    this.activePinKey = null;
    this.isDragging = false;
    this.scale = 1.0;

    // 3x Loupe
    this.loupeRadius = 65;
    this.loupeZoom = 3.0;

    this.measurements = {
      leftAngleDeg: 0,
      rightAngleDeg: 0,
      asymmetryDeg: 0,
      recFloatType: "Standard (4.5° - 6°)",
      recFloatShimano: "Gialle (6° float)",
      recFloatLook: "Grigie (4.5° float)"
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

    // Left foot axis
    this.pins.lHeel.x = Math.round(iw * 0.35);
    this.pins.lHeel.y = Math.round(ih * 0.78);
    this.pins.lToe.x = Math.round(iw * 0.31);
    this.pins.lToe.y = Math.round(ih * 0.25);

    // Right foot axis
    this.pins.rHeel.x = Math.round(iw * 0.65);
    this.pins.rHeel.y = Math.round(ih * 0.78);
    this.pins.rToe.x = Math.round(iw * 0.69);
    this.pins.rToe.y = Math.round(ih * 0.25);
  }

  recompute() {
    if (!this.img) return;

    // Longitudinal axis angles relative to vertical (sagittal axis, pointing up)
    // Up in canvas is -Y
    const calcAngle = (heel, toe, isLeft) => {
      const dx = toe.x - heel.x;
      const dy = -(toe.y - heel.y); // upward is positive
      // Angle with vertical (0, 1):
      // External rotation: toe points outward (dx < 0 for left foot, dx > 0 for right foot)
      const rad = Math.atan2(dx, dy);
      const deg = rad * (180 / Math.PI);
      return isLeft ? -deg : deg; // positive means external flare
    };

    const lAngle = Math.round(calcAngle(this.pins.lHeel, this.pins.lToe, true) * 10) / 10;
    const rAngle = Math.round(calcAngle(this.pins.rHeel, this.pins.rToe, false) * 10) / 10;
    const asym = Math.round(Math.abs(lAngle - rAngle) * 10) / 10;

    this.measurements.leftAngleDeg = lAngle;
    this.measurements.rightAngleDeg = rAngle;
    this.measurements.asymmetryDeg = asym;

    // Float recommendation
    const maxAngle = Math.max(Math.abs(lAngle), Math.abs(rAngle));
    if (asym >= 4.0 || maxAngle >= 8.5) {
      this.measurements.recFloatType = "Ampio Float (6° - 9°)";
      this.measurements.recFloatShimano = "Gialle (6° float libero)";
      this.measurements.recFloatLook = "Rosse (9° float)";
    } else if (asym <= 1.5 && maxAngle <= 3.5) {
      this.measurements.recFloatType = "Float Ridotto (2° - 4.5°)";
      this.measurements.recFloatShimano = "Blu (2° float pivot)";
      this.measurements.recFloatLook = "Grigie (4.5° float)";
    } else {
      this.measurements.recFloatType = "Float Medio Standard (4.5° - 6°)";
      this.measurements.recFloatShimano = "Gialle (6° float standard)";
      this.measurements.recFloatLook = "Grigie (4.5° float standard)";
    }

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

    const sLH = toScreen(this.pins.lHeel);
    const sLT = toScreen(this.pins.lToe);
    const sRH = toScreen(this.pins.rHeel);
    const sRT = toScreen(this.pins.rToe);

    ctx.save();

    // 1. Vertical Sagittal Reference plumb lines (dashed white)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(sLH.x, sLH.y);
    ctx.lineTo(sLH.x, sLT.y - 30);
    ctx.moveTo(sRH.x, sRH.y);
    ctx.lineTo(sRH.x, sRT.y - 30);
    ctx.stroke();

    // 2. Left Foot Axis (Cyan)
    ctx.setLineDash([]);
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#38BDF8";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(sLH.x, sLH.y);
    ctx.lineTo(sLT.x, sLT.y);
    ctx.stroke();

    // 3. Right Foot Axis (Pink)
    ctx.strokeStyle = "#EC4899";
    ctx.shadowColor = "#EC4899";
    ctx.beginPath();
    ctx.moveTo(sRH.x, sRH.y);
    ctx.lineTo(sRT.x, sRT.y);
    ctx.stroke();

    ctx.restore();

    // 4. Draw Pins
    Object.entries(this.pins).forEach(([key, pin]) => {
      const pt = toScreen(pin);
      const isActive = this.activePinKey === key;
      this._drawPin(pt.x, pt.y, pin.color, pin.label, isActive);
    });

    // 5. Draw Loupe if dragging
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
  window.FootMeasureEngine = FootMeasureEngine;
}
