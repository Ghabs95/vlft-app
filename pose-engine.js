/**
 * BikeFit Pose Detection & Biomechanical Biomechanics Engine
 * Features:
 * 1. AI Video Pose Estimation & Landmark Mapping
 * 2. Automated Pedal Stroke & Cadence (RPM) Tracker with Auto-BDC detection
 * 3. Frontal Knee Tracking (Lateral Knee Wander / Q-Factor / Valgus-Varus)
 * 4. High-Resolution Canvas Overlay with Angle Badges & Draggable Joint Handles
 */

class BikeFitPoseEngine {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.video = videoElement;
    
    this.isMediaPipeReady = false;
    this.poseDetector = null;
    this.isRunning = false;
    this.animationFrameId = null;

    // View Mode: 'lateral' | 'frontal'
    this.viewMode = 'lateral';

    // Tracking state
    this.landmarks = null;
    this.manualLandmarks = null;
    this.selectedJoint = null;
    this.isDragging = false;
    
    // Side tracking: 'auto' | 'left' | 'right'
    this.trackedSide = 'auto';
    this.detectedSide = 'right';

    // Current computed angles
    this.angles = {
      knee: 0,
      torso: 0,
      shoulder: 0,
      elbow: 0,
      wrist: 0,
      hipTDC: 0,
      ankle: 0,
      // Frontal specific
      leftKneeDeviation: 0,
      rightKneeDeviation: 0,
      frontalValgusVarus: "Neutro"
    };

    // Cycle & Cadence (RPM) Tracker
    this.pedalCycle = {
      history: [], // [ { t, y, kneeAngle } ]
      strokes: [], // [ { bdcTime, bdcKnee, tdcTime, tdcKnee, rpm } ]
      currentCadence: 0,
      lastBdcTime: 0,
      medianBdcKnee: 0,
      minBdcKnee: 180,
      maxBdcKnee: 0
    };

    // Min / Max Angle Tracking across pedaling cycles
    this.stats = {
      kneeMax: 0, // BDC
      kneeMin: 180, // TDC
      torsoAvg: 0,
      torsoSamples: [],
      elbowAvg: 0,
      elbowSamples: []
    };

    // Label banner text
    this.bannerText = "LIVE FIT";

    // Frontal Knee Trajectory Path History
    this.kneePathHistory = [];

    // Setup canvas interactions
    this._initCanvasInteraction();
  }

  /**
   * Initialize MediaPipe Pose
   */
  async initPose() {
    try {
      if (typeof window !== 'undefined' && typeof window.Pose !== 'undefined') {
        this.poseDetector = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        });

        this.poseDetector.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        this.poseDetector.onResults((results) => this._onPoseResults(results));
        this.isMediaPipeReady = true;
        console.log("MediaPipe Pose initialized successfully.");
        return true;
      } else {
        console.warn("MediaPipe Pose library not loaded on window, running in kinematic fallback mode.");
        return false;
      }
    } catch (e) {
      console.warn("Failed to initialize MediaPipe Pose:", e);
      return false;
    }
  }

  setViewMode(mode) {
    this.viewMode = mode === 'frontal' ? 'frontal' : 'lateral';
    this.kneePathHistory = [];
  }

  setSide(side) {
    this.trackedSide = side;
  }

  setBannerText(text) {
    this.bannerText = text || "";
  }

  resetStats() {
    this.stats = {
      kneeMax: 0,
      kneeMin: 180,
      torsoAvg: 0,
      torsoSamples: [],
      elbowAvg: 0,
      elbowSamples: []
    };
    this.pedalCycle = {
      history: [],
      strokes: [],
      currentCadence: 0,
      lastBdcTime: 0,
      medianBdcKnee: 0,
      minBdcKnee: 180,
      maxBdcKnee: 0
    };
    this.kneePathHistory = [];
  }

  /**
   * MediaPipe Pose results callback
   */
  _onPoseResults(results) {
    if (!results || !results.poseLandmarks) {
      this.landmarks = null;
      return;
    }

    this.landmarks = results.poseLandmarks;
    if (this.viewMode === 'frontal') {
      this._updateFrontalJoints();
    } else {
      this._updateLateralJoints();
    }
    this.render();
  }

  /**
   * Extract Lateral joints & calculate lateral angles
   */
  _updateLateralJoints() {
    if (!this.landmarks) return;

    const leftScore = (this.landmarks[11].visibility || 0) + (this.landmarks[23].visibility || 0) + (this.landmarks[25].visibility || 0);
    const rightScore = (this.landmarks[12].visibility || 0) + (this.landmarks[24].visibility || 0) + (this.landmarks[26].visibility || 0);

    let side = 'right';
    if (this.trackedSide === 'auto') {
      side = rightScore >= leftScore ? 'right' : 'left';
    } else {
      side = this.trackedSide;
    }
    this.detectedSide = side;

    const isR = side === 'right';
    const sIdx = isR ? 12 : 11;
    const eIdx = isR ? 14 : 13;
    const wIdx = isR ? 16 : 15;
    const hIdx = isR ? 24 : 23;
    const kIdx = isR ? 26 : 25;
    const aIdx = isR ? 28 : 27;
    const tIdx = isR ? 32 : 31;
    const earIdx = isR ? 8 : 7;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.manualLandmarks = {
      shoulder: { x: this.landmarks[sIdx].x * w, y: this.landmarks[sIdx].y * h, vis: this.landmarks[sIdx].visibility },
      elbow:    { x: this.landmarks[eIdx].x * w, y: this.landmarks[eIdx].y * h, vis: this.landmarks[eIdx].visibility },
      wrist:    { x: this.landmarks[wIdx].x * w, y: this.landmarks[wIdx].y * h, vis: this.landmarks[wIdx].visibility },
      hip:      { x: this.landmarks[hIdx].x * w, y: this.landmarks[hIdx].y * h, vis: this.landmarks[hIdx].visibility },
      knee:     { x: this.landmarks[kIdx].x * w, y: this.landmarks[kIdx].y * h, vis: this.landmarks[kIdx].visibility },
      ankle:    { x: this.landmarks[aIdx].x * w, y: this.landmarks[aIdx].y * h, vis: this.landmarks[aIdx].visibility },
      toe:      { x: this.landmarks[tIdx].x * w, y: this.landmarks[tIdx].y * h, vis: this.landmarks[tIdx].visibility },
      ear:      { x: this.landmarks[earIdx].x * w, y: this.landmarks[earIdx].y * h, vis: this.landmarks[earIdx].visibility }
    };

    this._calculateLateralAngles();
    this._trackPedalStroke();
  }

  /**
   * Extract Frontal joints & calculate lateral knee wander
   */
  _updateFrontalJoints() {
    if (!this.landmarks) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const lHip = { x: this.landmarks[23].x * w, y: this.landmarks[23].y * h };
    const rHip = { x: this.landmarks[24].x * w, y: this.landmarks[24].y * h };
    const lKnee = { x: this.landmarks[25].x * w, y: this.landmarks[25].y * h };
    const rKnee = { x: this.landmarks[26].x * w, y: this.landmarks[26].y * h };
    const lAnkle = { x: this.landmarks[27].x * w, y: this.landmarks[27].y * h };
    const rAnkle = { x: this.landmarks[28].x * w, y: this.landmarks[28].y * h };
    const lShoulder = { x: this.landmarks[11].x * w, y: this.landmarks[11].y * h };
    const rShoulder = { x: this.landmarks[12].x * w, y: this.landmarks[12].y * h };

    this.manualLandmarks = {
      lShoulder, rShoulder,
      lHip, rHip,
      lKnee, rKnee,
      lAnkle, rAnkle,
      // For compatibility
      hip: rHip, knee: rKnee, ankle: rAnkle, shoulder: rShoulder
    };

    // Calculate Knee Lateral Wander (deviation in px/mm from Hip-Ankle axis)
    // Left leg
    const lAxisX = (lHip.x + lAnkle.x) / 2;
    const lDev = lKnee.x - lAxisX; // positive = outward (varus), negative = inward (valgus)
    this.angles.leftKneeDeviation = Math.round(lDev * 10) / 10;

    // Right leg
    const rAxisX = (rHip.x + rAnkle.x) / 2;
    const rDev = rKnee.x - rAxisX;
    this.angles.rightKneeDeviation = Math.round(rDev * 10) / 10;

    // Qualitative assessment
    const avgDev = Math.abs(rDev);
    if (avgDev < 8) {
      this.angles.frontalValgusVarus = "Neutro (Ottimale)";
    } else if (rDev < -8) {
      this.angles.frontalValgusVarus = "Ginocchio Valgo (Cede all'interno)";
    } else {
      this.angles.frontalValgusVarus = "Ginocchio Varo (Apre all'esterno)";
    }

    // Save history for trajectory loop
    this.kneePathHistory.push({ x: rKnee.x, y: rKnee.y });
    if (this.kneePathHistory.length > 45) this.kneePathHistory.shift();
  }

  /**
   * Lateral Angles Calculation
   */
  _calculateLateralAngles() {
    const lm = this.manualLandmarks;
    if (!lm || !lm.hip || !lm.knee || !lm.ankle) return;

    // Knee Angle
    this.angles.knee = this._angle3Points(lm.hip, lm.knee, lm.ankle);

    // Torso Angle
    const dx = Math.abs(lm.shoulder.x - lm.hip.x);
    const dy = lm.hip.y - lm.shoulder.y;
    this.angles.torso = Math.round(Math.abs(Math.atan2(dy, dx) * 180 / Math.PI) * 10) / 10;

    // Shoulder Angle
    if (lm.elbow) {
      this.angles.shoulder = this._angle3Points(lm.hip, lm.shoulder, lm.elbow);
    }

    // Elbow Angle
    if (lm.elbow && lm.wrist) {
      this.angles.elbow = this._angle3Points(lm.shoulder, lm.elbow, lm.wrist);
    }

    // Wrist Angle
    if (lm.elbow && lm.wrist) {
      const wdx = Math.abs(lm.wrist.x - lm.elbow.x);
      const wdy = lm.wrist.y - lm.elbow.y;
      this.angles.wrist = Math.round(Math.abs(Math.atan2(wdy, wdx) * 180 / Math.PI) * 10) / 10;
    }

    // Hip Closed Angle at TDC
    if (lm.shoulder && lm.knee) {
      this.angles.hipTDC = this._angle3Points(lm.shoulder, lm.hip, lm.knee);
    }

    // Ankle Angle
    if (lm.toe) {
      this.angles.ankle = this._angle3Points(lm.knee, lm.ankle, lm.toe);
    }

    // Stats updates
    if (this.angles.knee > 0 && this.angles.knee < 180) {
      if (this.angles.knee > this.stats.kneeMax) this.stats.kneeMax = this.angles.knee;
      if (this.angles.knee < this.stats.kneeMin) this.stats.kneeMin = this.angles.knee;
    }
  }

  /**
   * Automated Pedal Stroke & Cadence Tracker (Peak / Trough Detector on Ankle Y)
   */
  _trackPedalStroke() {
    const lm = this.manualLandmarks;
    if (!lm || !lm.ankle) return;

    const t = this.video && this.video.currentTime ? this.video.currentTime : performance.now() / 1000;
    const y = lm.ankle.y;
    const kneeAng = this.angles.knee;

    const hist = this.pedalCycle.history;
    hist.push({ t, y, kneeAng });
    if (hist.length > 90) hist.shift();

    if (hist.length < 15) return;

    // Look for local maximum in Y (lowest foot position in canvas = BDC)
    const midIdx = hist.length - 8;
    const mid = hist[midIdx];
    let isMaxY = true;
    for (let i = midIdx - 6; i <= midIdx + 6; i++) {
      if (i !== midIdx && hist[i] && hist[i].y >= mid.y) {
        isMaxY = false;
        break;
      }
    }

    if (isMaxY && (!this.pedalCycle.lastBdcTime || (mid.t - this.pedalCycle.lastBdcTime) > 0.45)) {
      const dt = mid.t - this.pedalCycle.lastBdcTime;
      const rpm = dt > 0 && dt < 2.5 ? Math.round(60 / dt) : 0;
      this.pedalCycle.lastBdcTime = mid.t;

      if (rpm >= 40 && rpm <= 140) {
        this.pedalCycle.currentCadence = rpm;
      }

      this.pedalCycle.strokes.push({
        bdcTime: mid.t,
        bdcKnee: mid.kneeAng,
        rpm: this.pedalCycle.currentCadence
      });

      if (this.pedalCycle.strokes.length > 30) this.pedalCycle.strokes.shift();

      // Compute median knee extension at BDC
      const bdcAngles = this.pedalCycle.strokes.map(s => s.bdcKnee).sort((a, b) => a - b);
      const median = bdcAngles[Math.floor(bdcAngles.length / 2)];
      this.pedalCycle.medianBdcKnee = Math.round(median * 10) / 10;
      this.pedalCycle.minBdcKnee = bdcAngles[0];
      this.pedalCycle.maxBdcKnee = bdcAngles[bdcAngles.length - 1];
    }
  }

  _angle3Points(A, B, C) {
    if (!A || !B || !C) return 0;
    const v1 = { x: A.x - B.x, y: A.y - B.y };
    const v2 = { x: C.x - B.x, y: C.y - B.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (mag1 === 0 || mag2 === 0) return 0;
    let cosTheta = dot / (mag1 * mag2);
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
    return Math.round(Math.acos(cosTheta) * 180 / Math.PI * 10) / 10;
  }

  async processFrame() {
    if (!this.video || this.video.paused || this.video.ended) return;
    if (this.isMediaPipeReady && this.poseDetector) {
      try {
        await this.poseDetector.send({ image: this.video });
      } catch (e) {
        this.render();
      }
    } else {
      this.render();
    }
  }

  startLoop() {
    this.isRunning = true;
    const loop = async () => {
      if (!this.isRunning) return;
      if (this.video && !this.video.paused && !this.video.ended) {
        if (this.video.videoWidth && this.canvas.width !== this.video.videoWidth) {
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
        }
        await this.processFrame();
      } else {
        this.render();
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopLoop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main Render Entrypoint (Lateral vs Frontal)
   */
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Video Frame if ready
    if (this.video && this.video.readyState >= 2) {
      ctx.drawImage(this.video, 0, 0, w, h);
    } else {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#64748B";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Carica un video o avvia la fotocamera", w / 2, h / 2);
    }

    const lm = this.manualLandmarks;
    if (!lm) return;

    if (this.viewMode === 'frontal') {
      this._renderFrontalView(ctx, w, h, lm);
    } else {
      this._renderLateralView(ctx, w, h, lm);
    }

    // Top Header Banner (e.g. "BEFORE", "LIVE FIT")
    if (this.bannerText) {
      this._drawHeaderBanner(ctx, w, this.bannerText);
    }
  }

  /**
   * Lateral Canvas Render (Angles, Skeleton, Floating Badges)
   */
  _renderLateralView(ctx, w, h, lm) {
    if (!lm.hip || !lm.knee || !lm.ankle) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Connecting bones
    const bones = [
      [lm.shoulder, lm.elbow],
      [lm.elbow, lm.wrist],
      [lm.shoulder, lm.hip],
      [lm.hip, lm.knee],
      [lm.knee, lm.ankle]
    ];
    if (lm.toe) bones.push([lm.ankle, lm.toe]);
    if (lm.ear) bones.push([lm.shoulder, lm.ear]);

    // Outer glow for bones
    ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
    ctx.lineWidth = 6;
    bones.forEach(([p1, p2]) => {
      if (!p1 || !p2) return;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Inner bright bone line
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 3;
    bones.forEach(([p1, p2]) => {
      if (!p1 || !p2) return;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Angle Arcs
    this._drawAngleArc(ctx, lm.hip, lm.knee, lm.ankle, 38, "rgba(56, 189, 248, 0.28)");
    if (lm.elbow && lm.wrist) {
      this._drawAngleArc(ctx, lm.shoulder, lm.elbow, lm.wrist, 32, "rgba(56, 189, 248, 0.28)");
    }
    if (lm.elbow && lm.shoulder && lm.hip) {
      this._drawAngleArc(ctx, lm.hip, lm.shoulder, lm.elbow, 32, "rgba(56, 189, 248, 0.28)");
    }

    // Angle Badges
    if (this.angles.knee > 0) {
      const kPos = this._getBadgePosition(lm.knee, lm.hip, lm.ankle, 48);
      this._drawAngleBadge(ctx, kPos.x, kPos.y, `${this.angles.knee}°`, "#0284C7");
    }

    if (this.angles.torso > 0 && lm.shoulder) {
      const midTorso = { x: (lm.hip.x + lm.shoulder.x) / 2, y: (lm.hip.y + lm.shoulder.y) / 2 };
      this._drawAngleBadge(ctx, midTorso.x + 40, midTorso.y - 10, `${this.angles.torso}°`, "#2563EB");
    }

    if (this.angles.shoulder > 0 && lm.shoulder) {
      this._drawAngleBadge(ctx, lm.shoulder.x - 45, lm.shoulder.y - 30, `${this.angles.shoulder}°`, "#0284C7");
    }

    if (this.angles.elbow > 0 && lm.elbow) {
      this._drawAngleBadge(ctx, lm.elbow.x + 45, lm.elbow.y - 20, `${this.angles.elbow}°`, "#0284C7");
    }

    // Joint Dots with Target Circles
    const joints = [
      { name: "shoulder", p: lm.shoulder },
      { name: "elbow", p: lm.elbow },
      { name: "wrist", p: lm.wrist },
      { name: "hip", p: lm.hip },
      { name: "knee", p: lm.knee },
      { name: "ankle", p: lm.ankle },
      { name: "toe", p: lm.toe }
    ];

    joints.forEach(({ name, p }) => {
      if (!p) return;
      const isSelected = this.selectedJoint === name;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 12 : 9, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? "#F59E0B" : "#00D4FF";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    });

    // Cadence & BDC live HUD badge on bottom left
    if (this.pedalCycle.currentCadence > 0 || this.pedalCycle.medianBdcKnee > 0) {
      this._drawCadenceHUD(ctx, 20, h - 70);
    }

    ctx.restore();
  }

  /**
   * Frontal Canvas Render (Knee Plumb Alignment & Trajectory)
   */
  _renderFrontalView(ctx, w, h, lm) {
    if (!lm.lHip || !lm.rHip || !lm.lKnee || !lm.rKnee) return;

    ctx.save();

    // 1. Draw Vertical Tracking Corridors from Hip through Ankle
    [
      { hip: lm.lHip, knee: lm.lKnee, ankle: lm.lAnkle, col: "#38BDF8" },
      { hip: lm.rHip, knee: lm.rKnee, ankle: lm.rAnkle, col: "#38BDF8" }
    ].forEach(({ hip, knee, ankle, col }) => {
      if (!hip || !knee || !ankle) return;

      // Vertical Plumbline
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(hip.x, ankle.y + 30);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Leg Segments
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(knee.x, knee.y);
      ctx.lineTo(ankle.x, ankle.y);
      ctx.strokeStyle = col;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Knee Joint Indicator
      ctx.beginPath();
      ctx.arc(knee.x, knee.y, 9, 0, 2 * Math.PI);
      ctx.fillStyle = "#0284C7";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });

    // 2. Draw Trajectory Path of Knee Loop
    if (this.kneePathHistory.length > 2) {
      ctx.beginPath();
      ctx.moveTo(this.kneePathHistory[0].x, this.kneePathHistory[0].y);
      for (let i = 1; i < this.kneePathHistory.length; i++) {
        ctx.lineTo(this.kneePathHistory[i].x, this.kneePathHistory[i].y);
      }
      ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 3. Draw Frontal Assessment Card
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(20, h - 85, 320, 68, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("ALLINEAMENTO FRONTALE GINOCCHIO", 32, h - 65);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`Status: ${this.angles.frontalValgusVarus}`, 32, h - 45);

    ctx.fillStyle = "#38BDF8";
    ctx.font = "11px monospace";
    ctx.fillText(`Deviazione: ${this.angles.rightKneeDeviation > 0 ? '+' : ''}${this.angles.rightKneeDeviation} px`, 32, h - 28);

    ctx.restore();
  }

  _drawCadenceHUD(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(x, y, 220, 52, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "10px monospace";
    ctx.fillText("CADENZA (RPM)", x + 12, y + 18);
    ctx.fillText("MEDIANA BDC", x + 120, y + 18);

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`${this.pedalCycle.currentCadence || '--'}`, x + 12, y + 42);

    ctx.fillStyle = "#F59E0B";
    ctx.fillText(`${this.pedalCycle.medianBdcKnee ? this.pedalCycle.medianBdcKnee + '°' : '--'}`, x + 120, y + 42);

    ctx.restore();
  }

  _drawAngleBadge(ctx, x, y, text, color = "#0284C7") {
    ctx.save();
    ctx.font = "bold 15px ui-monospace, 'SF Mono', Menlo, monospace";
    const textMetrics = ctx.measureText(text);
    const padX = 10;
    const padY = 5;
    const badgeW = textMetrics.width + padX * 2;
    const badgeH = 26;

    const rx = Math.max(10, Math.min(this.canvas.width - badgeW - 10, x - badgeW / 2));
    const ry = Math.max(10, Math.min(this.canvas.height - badgeH - 10, y - badgeH / 2));

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(rx, ry, badgeW, badgeH, 5);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rx + badgeW / 2, ry + badgeH / 2);
    ctx.restore();
  }

  _drawAngleArc(ctx, A, B, C, radius, fillStyle) {
    if (!A || !B || !C) return;
    const angle1 = Math.atan2(A.y - B.y, A.x - B.x);
    const angle2 = Math.atan2(C.y - B.y, C.x - B.x);
    let diff = angle2 - angle1;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(B.x, B.y);
    ctx.arc(B.x, B.y, radius, angle1, angle1 + diff, diff < 0);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 212, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  _getBadgePosition(vertex, p1, p2, distance) {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y) || 1;
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y) || 1;
    const bx = v1.x / mag1 + v2.x / mag2;
    const by = v1.y / mag1 + v2.y / mag2;
    const bMag = Math.sqrt(bx * bx + by * by) || 1;
    return {
      x: vertex.x + (bx / bMag) * distance + 15,
      y: vertex.y + (by / bMag) * distance
    };
  }

  _drawHeaderBanner(ctx, w, text) {
    ctx.save();
    ctx.font = "bold 13px ui-monospace, 'SF Mono', sans-serif";
    const tw = ctx.measureText(text).width;
    const bw = tw + 28;
    const bh = 26;
    const bx = (w - bw) / 2;
    const by = 20;

    ctx.fillStyle = "rgba(2, 132, 199, 0.85)";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, by + bh / 2 + 1);
    ctx.restore();
  }

  _initCanvasInteraction() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const findNearestJoint = (pos) => {
      if (!this.manualLandmarks) return null;
      let minD = 30;
      let found = null;
      for (const [name, p] of Object.entries(this.manualLandmarks)) {
        if (!p) continue;
        const d = Math.hypot(p.x - pos.x, p.y - pos.y);
        if (d < minD) {
          minD = d;
          found = name;
        }
      }
      return found;
    };

    const onDown = (e) => {
      const pos = getPos(e);
      const joint = findNearestJoint(pos);
      if (joint) {
        this.selectedJoint = joint;
        this.isDragging = true;
        this.render();
      }
    };

    const onMove = (e) => {
      if (!this.isDragging || !this.selectedJoint || !this.manualLandmarks) return;
      const pos = getPos(e);
      this.manualLandmarks[this.selectedJoint].x = pos.x;
      this.manualLandmarks[this.selectedJoint].y = pos.y;
      if (this.viewMode === 'lateral') {
        this._calculateLateralAngles();
      }
      this.render();
    };

    const onUp = () => {
      this.isDragging = false;
    };

    if (this.canvas && this.canvas.addEventListener) {
      this.canvas.addEventListener('mousedown', onDown);
      this.canvas.addEventListener('touchstart', onDown, { passive: true });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onUp);
    }
  }

  setKinematicModel(crankAngleDeg = 90) {
    const w = this.canvas.width || 800;
    const h = this.canvas.height || 600;

    const bbX = w * 0.45;
    const bbY = h * 0.72;
    const crankLen = h * 0.12;

    const rad = (crankAngleDeg - 90) * Math.PI / 180;
    const pedalX = bbX + crankLen * Math.cos(rad);
    const pedalY = bbY + crankLen * Math.sin(rad);

    const hipX = bbX - w * 0.14;
    const hipY = bbY - h * 0.38;

    const handX = bbX + w * 0.28;
    const handY = bbY - h * 0.34;

    const shoulderX = hipX + w * 0.24;
    const shoulderY = hipY - h * 0.14;

    const elbowX = shoulderX + w * 0.08;
    const elbowY = shoulderY + h * 0.10;

    const ankleX = pedalX;
    const ankleY = pedalY - h * 0.04;

    const thigh = h * 0.25;
    const shin = h * 0.24;
    const dHa = Math.hypot(ankleX - hipX, ankleY - hipY);
    const clampedD = Math.min(dHa, thigh + shin - 2);

    const alpha = Math.acos(Math.max(-1, Math.min(1, (thigh * thigh + clampedD * clampedD - shin * shin) / (2 * thigh * clampedD))));
    const baseAngle = Math.atan2(ankleY - hipY, ankleX - hipX);
    const kneeAngle = baseAngle - alpha;

    const kneeX = hipX + thigh * Math.cos(kneeAngle);
    const kneeY = hipY + thigh * Math.sin(kneeAngle);

    this.manualLandmarks = {
      shoulder: { x: shoulderX, y: shoulderY, vis: 0.99 },
      elbow:    { x: elbowX, y: elbowY, vis: 0.99 },
      wrist:    { x: handX, y: handY, vis: 0.99 },
      hip:      { x: hipX, y: hipY, vis: 0.99 },
      knee:     { x: kneeX, y: kneeY, vis: 0.99 },
      ankle:    { x: ankleX, y: ankleY, vis: 0.99 },
      toe:      { x: pedalX + w * 0.04, y: pedalY + h * 0.02, vis: 0.99 },
      ear:      { x: shoulderX + w * 0.02, y: shoulderY - h * 0.08, vis: 0.99 }
    };

    this._calculateLateralAngles();
    this._trackPedalStroke();
  }

  captureSnapshotPNG() {
    return this.canvas.toDataURL("image/png");
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BikeFitPoseEngine };
}
