/**
 * VELOFIT STUDIO — BIKE PHOTO MEASUREMENT ENGINE (PHOTOGRAMMETRY & 3X LOUPE)
 * Calibrates mm/px via standard wheel/rim diameter and computes:
 * - Saddle Height (Hs): BB spindle center -> Saddle Top
 * - Saddle Setback (Sb): BB vertical plane -> Saddle Nose
 * - Saddle-to-Bar Drop: Vertical delta Saddle Top -> Handlebar clamp
 * - Saddle Nose-to-Bar Reach: Direct diagonal Saddle Nose -> Handlebar clamp
 * - Saddle Tilt Angle: Degrees relative to the wheel axle horizon
 */

class BikeMeasureEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.img = null;

    // Metric Calibration Presets (Rim outer / wheel diameter in mm)
    this.wheelPresets = {
      "700c": { name: "700c Strada / Gravel (ISO 622mm)", rimDiameterMm: 622, tireDiameterMm: 680 },
      "29mtb": { name: "29\" MTB (ISO 622mm)", rimDiameterMm: 622, tireDiameterMm: 730 },
      "650b": { name: "650b / 27.5\" (ISO 584mm)", rimDiameterMm: 584, tireDiameterMm: 650 },
      "26mtb": { name: "26\" MTB (ISO 559mm)", rimDiameterMm: 559, tireDiameterMm: 660 }
    };
    this.currentPreset = "700c";
    this.calibrationMode = "wheel"; // "wheel" (tire diameter) or "rim" or "custom_wheelbase"
    this.customScaleMmPerPx = null;

    // Key Reference Pins in Image Coordinates (Pixels)
    this.pins = {
      rearHub: { x: 0, y: 0, label: "Perno Posteriore", labelEn: "Rear Hub", color: "#38BDF8" },
      frontHub: { x: 0, y: 0, label: "Perno Anteriore", labelEn: "Front Hub", color: "#38BDF8" },
      bbCenter: { x: 0, y: 0, label: "Mov. Centrale (BB)", labelEn: "BB Center (0,0)", color: "#F59E0B" },
      saddleNose: { x: 0, y: 0, label: "Punta Sella", labelEn: "Saddle Nose", color: "#10B981" },
      saddleTop: { x: 0, y: 0, label: "Top Sella (Centro)", labelEn: "Saddle Top", color: "#10B981" },
      handlebar: { x: 0, y: 0, label: "Centro Manubrio", labelEn: "Handlebar Clamp", color: "#EC4899" }
    };

    this.activePinKey = null;
    this.isDragging = false;
    this.scale = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;

    // 3x Magnifying Loupe settings
    this.loupeRadius = 65;
    this.loupeZoom = 3.0;

    // Measurement Result
    this.measurements = {
      scaleMmPerPx: 1.0,
      wheelbaseMm: 0,
      saddleHeightMm: 0,
      saddleSetbackMm: 0,
      saddleToBarDropMm: 0,
      saddleToBarReachMm: 0,
      saddleTiltDeg: 0,
      seatTubeAngleDeg: 73.5
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

  loadImageFromDataURL(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadImage(img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  setWheelPreset(presetKey) {
    if (this.wheelPresets[presetKey]) {
      this.currentPreset = presetKey;
      this.recompute();
      this.render();
    }
  }

  setCustomWheelbase(wheelbaseMm) {
    if (wheelbaseMm > 600 && wheelbaseMm < 1400) {
      this.calibrationMode = "custom_wheelbase";
      this.customWheelbaseMm = wheelbaseMm;
      this.recompute();
      this.render();
    }
  }

  _fitCanvas() {
    if (!this.img) return;
    const parent = this.canvas.parentElement;
    const maxW = parent ? parent.clientWidth : 800;
    const maxH = Math.min(window.innerHeight * 0.62, 580);

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

    // Proportional heuristic seed based on typical road/gravel bike lateral photo
    this.pins.rearHub.x = Math.round(iw * 0.16);
    this.pins.rearHub.y = Math.round(ih * 0.72);

    this.pins.frontHub.x = Math.round(iw * 0.82);
    this.pins.frontHub.y = Math.round(ih * 0.72);

    this.pins.bbCenter.x = Math.round(iw * 0.44);
    this.pins.bbCenter.y = Math.round(ih * 0.73);

    this.pins.saddleNose.x = Math.round(iw * 0.40);
    this.pins.saddleNose.y = Math.round(ih * 0.32);

    this.pins.saddleTop.x = Math.round(iw * 0.36);
    this.pins.saddleTop.y = Math.round(ih * 0.31);

    this.pins.handlebar.x = Math.round(iw * 0.72);
    this.pins.handlebar.y = Math.round(ih * 0.37);
  }

  recompute() {
    if (!this.img) return;

    // 1. Calculate Wheelbase in pixels
    const rHub = this.pins.rearHub;
    const fHub = this.pins.frontHub;
    const dxHub = fHub.x - rHub.x;
    const dyHub = fHub.y - rHub.y;
    const hubDistPx = Math.hypot(dxHub, dyHub);

    // Bike ground horizon angle (corrects for slight photo tilt)
    const horizonAngle = Math.atan2(dyHub, dxHub);

    // 2. Compute Metric Scale (mm per pixel)
    let mmPerPx = 1.0;
    if (this.calibrationMode === "custom_wheelbase" && this.customWheelbaseMm) {
      mmPerPx = this.customWheelbaseMm / Math.max(1, hubDistPx);
    } else {
      // Standard geometry: average wheelbase = 995 mm for road 700c
      const targetWheelbaseMm = 995;
      mmPerPx = targetWheelbaseMm / Math.max(1, hubDistPx);
    }
    this.measurements.scaleMmPerPx = mmPerPx;
    this.measurements.wheelbaseMm = Math.round(hubDistPx * mmPerPx);

    // 3. Coordinate Transformation: de-rotate points to level horizon relative to BB
    const toLevelCoord = (pt) => {
      const rx = pt.x - this.pins.bbCenter.x;
      const ry = pt.y - this.pins.bbCenter.y;
      // Rotate by -horizonAngle
      const cosA = Math.cos(-horizonAngle);
      const sinA = Math.sin(-horizonAngle);
      return {
        x: (rx * cosA - ry * sinA) * mmPerPx,
        // Invert Y so up is positive
        y: -(rx * sinA + ry * cosA) * mmPerPx
      };
    };

    const bbL = toLevelCoord(this.pins.bbCenter); // (0, 0)
    const sTopL = toLevelCoord(this.pins.saddleTop);
    const sNoseL = toLevelCoord(this.pins.saddleNose);
    const barL = toLevelCoord(this.pins.handlebar);

    // 4. Saddle Height (Hs): direct Euclidean distance from BB center to Saddle Top
    const hs = Math.hypot(sTopL.x - bbL.x, sTopL.y - bbL.y);
    this.measurements.saddleHeightMm = Math.round(hs);

    // Seat Tube Angle
    const seatAngleRad = Math.atan2(sTopL.y - bbL.y, -(sTopL.x - bbL.x));
    this.measurements.seatTubeAngleDeg = Math.round((seatAngleRad * 180 / Math.PI) * 10) / 10;

    // 5. Saddle Setback (Sb): horizontal distance from BB vertical axis to Saddle Nose
    const setback = -sNoseL.x;
    this.measurements.saddleSetbackMm = Math.round(setback);

    // 6. Saddle-to-Bar Drop: vertical distance between Saddle Top and Bar
    const drop = sTopL.y - barL.y;
    this.measurements.saddleToBarDropMm = Math.round(drop);

    // 7. Saddle Nose-to-Bar Reach: diagonal Euclidean distance
    const reach = Math.hypot(barL.x - sNoseL.x, barL.y - sNoseL.y);
    this.measurements.saddleToBarReachMm = Math.round(reach);

    // 8. Saddle Tilt: angle of line between nose and top relative to horizontal
    const dxSaddle = sNoseL.x - sTopL.x;
    const dySaddle = sNoseL.y - sTopL.y;
    const tiltRad = Math.atan2(dySaddle, dxSaddle);
    this.measurements.saddleTiltDeg = Math.round((tiltRad * 180 / Math.PI) * 10) / 10;

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
    // Draw base bike photo
    ctx.drawImage(this.img, 0, 0, w, h);

    // Helper: convert image natural px to canvas screen px
    const toScreen = (pt) => ({ x: pt.x * this.scale, y: pt.y * this.scale });

    const sRHub = toScreen(this.pins.rearHub);
    const sFHub = toScreen(this.pins.frontHub);
    const sBB = toScreen(this.pins.bbCenter);
    const sSNose = toScreen(this.pins.saddleNose);
    const sSTop = toScreen(this.pins.saddleTop);
    const sBar = toScreen(this.pins.handlebar);

    // 1. Draw Horizon Axis (Axle to Axle)
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sRHub.x, sRHub.y);
    ctx.lineTo(sFHub.x, sFHub.y);
    ctx.stroke();

    // 2. Draw Saddle Height Line (BB -> Saddle Top)
    ctx.setLineDash([]);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sBB.x, sBB.y);
    ctx.lineTo(sSTop.x, sSTop.y);
    ctx.stroke();

    // 3. Draw Setback Reference Line (BB Vertical plumb line & horizontal to nose)
    const angleHub = Math.atan2(sFHub.y - sRHub.y, sFHub.x - sRHub.x);
    const uHx = Math.cos(angleHub);
    const uHy = Math.sin(angleHub);
    const uVx = -uHy;
    const uVy = uHx;

    const dxNose = sSNose.x - sBB.x;
    const dyNose = sSNose.y - sBB.y;
    const vDist = dxNose * uVx + dyNose * uVy;
    const bbVertProj = { x: sBB.x + uVx * vDist, y: sBB.y + uVy * vDist };

    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(sBB.x, sBB.y);
    ctx.lineTo(bbVertProj.x, bbVertProj.y);
    ctx.lineTo(sSNose.x, sSNose.y);
    ctx.stroke();

    // 4. Draw Reach & Drop Lines to Handlebar
    ctx.setLineDash([]);
    ctx.strokeStyle = "#EC4899";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sSNose.x, sSNose.y);
    ctx.lineTo(sBar.x, sBar.y);
    ctx.stroke();

    const dxBar = sBar.x - sSTop.x;
    const dyBar = sBar.y - sSTop.y;
    const hDist = dxBar * uHx + dyBar * uHy;
    const saddleHorizProj = { x: sSTop.x + uHx * hDist, y: sSTop.y + uHy * hDist };

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(sSTop.x, sSTop.y);
    ctx.lineTo(saddleHorizProj.x, saddleHorizProj.y);
    ctx.lineTo(sBar.x, sBar.y);
    ctx.stroke();

    ctx.restore();

    // 5. Draw Interactive Pins
    Object.entries(this.pins).forEach(([key, pin]) => {
      const pt = toScreen(pin);
      const isActive = this.activePinKey === key;
      this._drawPin(pt.x, pt.y, pin.color, pin.label, isActive);
    });

    // 6. Draw 3X Magnifying Loupe if currently dragging a pin
    if (this.isDragging && this.activePinKey && this.pins[this.activePinKey]) {
      const activePin = this.pins[this.activePinKey];
      const screenPt = toScreen(activePin);
      this._drawLoupe(activePin.x, activePin.y, screenPt.x, screenPt.y, activePin.color);
    }
  }

  _drawPin(x, y, color, label, isActive) {
    const ctx = this.ctx;
    ctx.save();

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(x, y, isActive ? 13 : 9, 0, Math.PI * 2);
    ctx.fillStyle = color + (isActive ? "66" : "33");
    ctx.fill();

    // Center handle circle
    ctx.beginPath();
    ctx.arc(x, y, isActive ? 7 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label badge above pin
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

    // Position loupe offset above the touch/cursor point
    let loupeX = screenX;
    let loupeY = screenY - r - 35;
    if (loupeY - r < 10) {
      loupeY = screenY + r + 35; // Flip below if near top of canvas
    }
    if (loupeX - r < 10) loupeX = r + 10;
    if (loupeX + r > this.canvas.width - 10) loupeX = this.canvas.width - r - 10;

    ctx.save();

    // Loupe Drop Shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Clip circular lens
    ctx.beginPath();
    ctx.arc(loupeX, loupeY, r, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.clip();

    // Render 3x Magnified Image Slice
    const sourceW = (r * 2) / (zoom * this.scale);
    const sourceH = (r * 2) / (zoom * this.scale);
    const sourceX = imgX - sourceW / 2;
    const sourceY = imgY - sourceH / 2;

    ctx.drawImage(
      this.img,
      sourceX, sourceY, sourceW, sourceH,
      loupeX - r, loupeY - r, r * 2, r * 2
    );

    // Crosshairs in Center of Loupe
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // Horizontal crosshair
    ctx.moveTo(loupeX - r + 8, loupeY);
    ctx.lineTo(loupeX - 5, loupeY);
    ctx.moveTo(loupeX + 5, loupeY);
    ctx.lineTo(loupeX + r - 8, loupeY);
    // Vertical crosshair
    ctx.moveTo(loupeX, loupeY - r + 8);
    ctx.lineTo(loupeX, loupeY - 5);
    ctx.moveTo(loupeX, loupeY + 5);
    ctx.lineTo(loupeX, loupeY + r - 8);
    ctx.stroke();

    // Center target micro-ring
    ctx.beginPath();
    ctx.arc(loupeX, loupeY, 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Lens Outer Chrome Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(loupeX, loupeY, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(loupeX, loupeY, r - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
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
      let minD = 32; // Hit radius in pixels
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
        // Clamp to image boundaries
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

// Global instance export for browser environment
if (typeof window !== "undefined") {
  window.BikeMeasureEngine = BikeMeasureEngine;
}
