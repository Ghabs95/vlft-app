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

    // Camera Pre-Flight Positioning & Assistant
    this.cameraMode = 'rider'; // 'rider' | 'bike'
    this.isLiveCameraActive = false;
    this.deviceOrientation = { beta: 90, gamma: 0, hasSensor: false };
    this.cameraDiagnostics = {
      levelOk: true,
      angleOk: true,
      framingOk: true,
      warningKey: "camStatusReadyToRecord",
      warningText: ""
    };
    this.onDiagnosticsChange = null;

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
    if (lm) {
      if (this.viewMode === 'frontal') {
        this._renderFrontalView(ctx, w, h, lm);
      } else {
        this._renderLateralView(ctx, w, h, lm);
      }
    }

    // Top Header Banner (e.g. "BEFORE", "LIVE FIT")
    if (this.bannerText) {
      this._drawHeaderBanner(ctx, w, this.bannerText);
    }

    // Pre-Flight Camera Positioning & Diagnostic HUD
    if (this.isLiveCameraActive) {
      this.evaluateCameraPosition();
      this._renderPreFlightHUD(ctx, w, h);
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

  // ===================== CAMERA POSITIONING & PRE-FLIGHT GUIDANCE =====================

  setCameraMode(mode) {
    if (mode === 'bike' || mode === 'rider') {
      this.cameraMode = mode;
      this.render();
    }
  }

  setLiveCameraActive(active) {
    this.isLiveCameraActive = !!active;
    this.render();
  }

  updateDeviceOrientation(beta, gamma, alpha) {
    this.deviceOrientation = {
      beta: typeof beta === 'number' ? beta : 90,
      gamma: typeof gamma === 'number' ? gamma : 0,
      alpha: typeof alpha === 'number' ? alpha : 0,
      hasSensor: true
    };
    if (this.isLiveCameraActive) {
      this.render();
    }
  }

  evaluateCameraPosition() {
    const isEn = typeof I18N !== 'undefined' && I18N.currentLang === "en";
    const diag = {
      levelOk: true,
      angleOk: true,
      framingOk: true,
      warningKey: "camStatusReadyToRecord",
      warningText: ""
    };

    // 1. Tilt & Roll Spirit Level Check
    if (this.deviceOrientation && this.deviceOrientation.hasSensor) {
      const gamma = this.deviceOrientation.gamma; // Roll: left/right tilt
      const beta = this.deviceOrientation.beta;   // Pitch: forward/backward tilt (90° is vertical)

      if (Math.abs(gamma) > 4.5) {
        diag.levelOk = false;
        diag.warningKey = "camWarnRoll";
      } else if (beta > 98) {
        diag.levelOk = false;
        diag.warningKey = "camWarnTiltForward";
      } else if (beta < 82) {
        diag.levelOk = false;
        diag.warningKey = "camWarnTiltBack";
      }
    }

    if (this.cameraMode === 'bike') {
      // Empty Bike Setup Mode
      if (diag.levelOk) {
        diag.warningKey = "camWarnBikeAlign";
      }
    } else {
      // Rider on Bike Mode
      const lm = this.landmarks;
      if (!lm || lm.length < 33) {
        diag.framingOk = false;
        if (diag.levelOk) diag.warningKey = "camWarnNoRider";
      } else {
        // Extremities: Check Pedals / Ankle at bottom
        const leftAnk = lm[27], rightAnk = lm[28];
        const leftToe = lm[31], rightToe = lm[32];
        const maxFootY = Math.max(
          leftAnk?.y || 0, rightAnk?.y || 0,
          leftToe?.y || 0, rightToe?.y || 0
        );

        // Extremities: Check Head / Shoulders at top
        const noseY = lm[0]?.y || 0.5;
        const leftShY = lm[11]?.y || 0.5, rightShY = lm[12]?.y || 0.5;
        const minTopY = Math.min(noseY, leftShY, rightShY);

        // Bounding Box Width
        const validX = lm.map(p => p.x).filter(x => typeof x === 'number' && x > 0 && x < 1);
        const minX = validX.length ? Math.min(...validX) : 0;
        const maxX = validX.length ? Math.max(...validX) : 1;
        const riderWidth = maxX - minX;

        if (maxFootY > 0.89) {
          diag.framingOk = false;
          diag.warningKey = "camWarnPedalsCut";
        } else if (minTopY < 0.08) {
          diag.framingOk = false;
          diag.warningKey = "camWarnHeadCut";
        } else if (riderWidth < 0.22) {
          diag.framingOk = false;
          diag.warningKey = "camWarnTooFar";
        } else if (riderWidth > 0.88) {
          diag.framingOk = false;
          diag.warningKey = "camWarnTooClose";
        }

        // Perpendicularity (Parallax / Yaw angle check):
        // In true lateral sagittal view, shoulders (11, 12) align in depth.
        // Horizontal distance between left and right joints relative to torso height:
        const dxShoulders = Math.abs((lm[11].x - lm[12].x));
        const dyTorso = Math.abs((lm[11].y - lm[23].y)) || 0.3;
        const shoulderSpreadRatio = dxShoulders / dyTorso;

        // If camera is at 30°-45° diagonal angle, shoulder spread ratio jumps > 0.28
        if (shoulderSpreadRatio > 0.28) {
          diag.angleOk = false;
          if (diag.levelOk && diag.framingOk) {
            diag.warningKey = "camWarnDiagonal";
          }
        }
      }
    }

    if (typeof I18N !== 'undefined') {
      diag.warningText = I18N.t(diag.warningKey);
    }
    this.cameraDiagnostics = diag;

    if (typeof this.onDiagnosticsChange === 'function') {
      this.onDiagnosticsChange(diag);
    }
    return diag;
  }

  _renderPreFlightHUD(ctx, w, h) {
    ctx.save();

    // 1. Spirit Level (Bolla di livello) in top-right corner
    this._drawSpiritLevel(ctx, w - 50, 50, 24);

    // 2. Mode-specific guides
    if (this.cameraMode === 'bike') {
      this._drawGhostBikeOverlay(ctx, w, h);
    } else {
      this._drawRiderFramingGuides(ctx, w, h);
    }

    // 3. Status Badges & Warning Chip
    this._drawDiagnosticBadges(ctx, w, h);

    ctx.restore();
  }

  _drawSpiritLevel(ctx, cx, cy, r) {
    const hasSensor = this.deviceOrientation && this.deviceOrientation.hasSensor;
    const gamma = hasSensor ? this.deviceOrientation.gamma : 0;
    const beta = hasSensor ? this.deviceOrientation.beta : 90;
    const pitchOffset = beta - 90;

    const dx = Math.max(-r + 6, Math.min(r - 6, gamma * 1.6));
    const dy = Math.max(-r + 6, Math.min(r - 6, pitchOffset * 1.6));
    const dist = Math.hypot(dx, dy);
    const isLevel = hasSensor ? dist < 5.5 : true;

    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fill();
    ctx.strokeStyle = isLevel ? "#10B981" : "#EF4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - r + 4, cy); ctx.lineTo(cx + r - 4, cy);
    ctx.moveTo(cx, cy - r + 4); ctx.lineTo(cx, cy + r - 4);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner target zone
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = isLevel ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";
    ctx.stroke();

    // Moving Bubble
    const bx = cx + dx;
    const by = cy + dy;
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fillStyle = isLevel ? "#10B981" : "#EF4444";
    ctx.shadowColor = isLevel ? "#10B981" : "#EF4444";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = isLevel ? "#A7F3D0" : "#FECACA";
    ctx.textAlign = "center";
    ctx.fillText(hasSensor ? (isLevel ? "LEVEL" : "TILT") : "LEVEL", cx, cy + r + 13);
  }

  _drawGhostBikeOverlay(ctx, w, h) {
    ctx.save();

    // Level Horizon Ground Line
    const groundY = h * 0.72;
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, groundY);
    ctx.lineTo(w * 0.9, groundY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector Ghost Bike Coordinates
    const hubRY = groundY - h * 0.18;
    const hubRX = w * 0.28;
    const hubFX = w * 0.72;
    const hubFY = groundY - h * 0.18;
    const bbX = w * 0.48;
    const bbY = hubRY;
    const saddleX = w * 0.43;
    const saddleY = groundY - h * 0.46;
    const headX = w * 0.65;
    const headY = groundY - h * 0.44;
    const barX = w * 0.70;
    const barY = groundY - h * 0.46;
    const wheelR = h * 0.16;

    // Rear Wheel / Direct-Drive Trainer
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hubRX, hubRY, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Front Wheel
    ctx.beginPath();
    ctx.arc(hubFX, hubFY, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Trainer triangular legs
    ctx.beginPath();
    ctx.moveTo(hubRX, hubRY);
    ctx.lineTo(hubRX - w * 0.08, groundY);
    ctx.lineTo(hubRX + w * 0.08, groundY);
    ctx.closePath();
    ctx.fillStyle = "rgba(30, 41, 59, 0.4)";
    ctx.fill();
    ctx.stroke();

    // Frame tubes (Cyan outline)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Chainstay
    ctx.moveTo(hubRX, hubRY); ctx.lineTo(bbX, bbY);
    // Seatstay
    ctx.moveTo(hubRX, hubRY); ctx.lineTo(saddleX, saddleY + 30);
    // Seat tube
    ctx.moveTo(bbX, bbY); ctx.lineTo(saddleX, saddleY);
    // Down tube
    ctx.moveTo(bbX, bbY); ctx.lineTo(headX, headY + 30);
    // Top tube
    ctx.moveTo(saddleX, saddleY + 30); ctx.lineTo(headX, headY);
    // Head tube
    ctx.moveTo(headX, headY); ctx.lineTo(headX + 4, headY + 32);
    // Fork
    ctx.moveTo(headX + 4, headY + 32); ctx.lineTo(hubFX, hubFY);
    // Stem & Bar
    ctx.moveTo(headX, headY); ctx.lineTo(barX, barY);
    ctx.lineTo(barX + 12, barY + 18);
    // Saddle
    ctx.moveTo(saddleX - 25, saddleY); ctx.lineTo(saddleX + 25, saddleY);
    ctx.stroke();

    // Guide Text Banner
    const isEn = typeof I18N !== 'undefined' && I18N.currentLang === "en";
    const guideText = isEn
      ? "🚲 BIKE SETUP: ALIGN FRAME & WHEEL AXLES HORIZONTALLY"
      : "🚲 SETUP BICI: ALLINEA IL TELAIO E L'ASSE RUOTE IN ORIZZONTALE";

    ctx.font = "bold 12px monospace";
    const tw = ctx.measureText(guideText).width;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w / 2 - tw / 2 - 14, groundY + 16, tw + 28, 26, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#38BDF8";
    ctx.textAlign = "center";
    ctx.fillText(guideText, w / 2, groundY + 33);

    ctx.restore();
  }

  _drawRiderFramingGuides(ctx, w, h) {
    ctx.save();
    const diag = this.cameraDiagnostics;

    // Safe Bounding Zone (Dashed rectangle)
    const sx = w * 0.08, sy = h * 0.08;
    const sw = w * 0.84, sh = h * 0.82;

    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = diag.framingOk ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.5)";
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.setLineDash([]);

    // Cut-off Warning highlights on borders
    if (diag.warningKey === "camWarnPedalsCut") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
      ctx.fillRect(0, h * 0.88, w, h * 0.12);
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.88); ctx.lineTo(w, h * 0.88);
      ctx.stroke();
    } else if (diag.warningKey === "camWarnHeadCut") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
      ctx.fillRect(0, 0, w, h * 0.12);
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.12); ctx.lineTo(w, h * 0.12);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawDiagnosticBadges(ctx, w, h) {
    const diag = this.cameraDiagnostics;
    const isEn = typeof I18N !== 'undefined' && I18N.currentLang === "en";

    // Draw Live Status Badges under the Header Banner
    let bx = 16;
    const by = 48;
    const bHeight = 22;

    const badges = [
      {
        lbl: isEn ? "LEVEL" : "LIVELLA",
        ok: diag.levelOk,
        text: diag.levelOk ? (isEn ? "OK" : "IN BOLLA") : (isEn ? "TILT" : "INCLINATA")
      },
      {
        lbl: isEn ? "90° SAGITTAL" : "90° SAGITTALE",
        ok: diag.angleOk,
        text: diag.angleOk ? "OK" : (isEn ? "DIAGONAL" : "DIAGONALE")
      },
      {
        lbl: isEn ? "FRAMING" : "INQUADRATURA",
        ok: diag.framingOk,
        text: diag.framingOk ? "OK" : (isEn ? "CHECK" : "VERIFICA")
      }
    ];

    badges.forEach(b => {
      ctx.font = "bold 10px monospace";
      const fullText = `${b.lbl}: ${b.text}`;
      const tw = ctx.measureText(fullText).width;
      const bw = tw + 16;

      ctx.fillStyle = b.ok ? "rgba(6, 78, 59, 0.85)" : "rgba(127, 29, 29, 0.85)";
      ctx.strokeStyle = b.ok ? "#10B981" : "#EF4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bHeight, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = b.ok ? "#A7F3D0" : "#FECACA";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fullText, bx + bw / 2, by + bHeight / 2);

      bx += bw + 8;
    });

    // Warning Banner Chip (bottom center)
    if (diag.warningText && diag.warningKey !== "camStatusReadyToRecord") {
      ctx.font = "bold 12px monospace";
      const tw = ctx.measureText(diag.warningText).width;
      const pw = tw + 24;
      const px = (w - pw) / 2;
      const py = h - 42;

      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FDE68A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(diag.warningText, w / 2, py + 14);
    }
  }

  // ===================== PHOTO ANTHROPOMETRY ESTIMATION =====================

  async analyzePhotoMeasurements(imageElement, knownHeightCm) {
    if (!this.poseDetector) {
      const ok = await this.initPose();
      if (!ok) throw new Error("MediaPipe Pose detector could not be initialized.");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout during photo pose detection."));
      }, 12000);

      const oneTimeHandler = (results) => {
        clearTimeout(timeout);
        // Restore standard listener
        this.poseDetector.onResults((res) => this._onPoseResults(res));

        if (!results || !results.poseLandmarks || results.poseLandmarks.length < 33) {
          reject(new Error("photoErrorNoPerson"));
          return;
        }

        const lm = results.poseLandmarks;
        const w = imageElement.naturalWidth || imageElement.width || 800;
        const h = imageElement.naturalHeight || imageElement.height || 1000;

        // Landmark mapping:
        // 0: nose, 11: l_sh, 12: r_sh, 13: l_elb, 14: r_elb, 15: l_wri, 16: r_wri
        // 23: l_hip, 24: r_hip, 25: l_knee, 26: r_knee, 27: l_ank, 28: r_ank, 29: l_heel, 30: r_heel

        // 1. Head apex: above nose based on eye-to-nose span
        const noseY = lm[0].y;
        const eyeY = (lm[2].y + lm[5].y) / 2 || (noseY - 0.03);
        const eyeNoseDist = Math.max(0.02, noseY - eyeY);
        const headTopY = Math.max(0.01, noseY - eyeNoseDist * 2.2);

        // 2. Ground level (heels/ankles/toes)
        const groundY = Math.min(0.99, Math.max(
          lm[27].y, lm[28].y, lm[29].y, lm[30].y, lm[31].y, lm[32].y
        ));

        const pixelHeight = (groundY - headTopY) * h;
        if (pixelHeight < 80) {
          reject(new Error("photoErrorNoPerson"));
          return;
        }

        const scaleMmPerPx = (knownHeightCm * 10) / pixelHeight;

        // Helper for absolute pixel coordinates
        const pt = (idx) => ({ x: lm[idx].x * w, y: lm[idx].y * h });
        const dist2d = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

        const lSh = pt(11), rSh = pt(12);
        const midSh = { x: (lSh.x + rSh.x) / 2, y: (lSh.y + rSh.y) / 2 };

        const lHip = pt(23), rHip = pt(24);
        const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };

        const lKnee = pt(25), rKnee = pt(26);
        const midKnee = { x: (lKnee.x + rKnee.x) / 2, y: (lKnee.y + rKnee.y) / 2 };

        const lAnk = pt(27), rAnk = pt(28);
        const midAnk = { x: (lAnk.x + rAnk.x) / 2, y: (lAnk.y + rAnk.y) / 2 };

        const groundPxY = groundY * h;

        // Crotch apex: in human anthropometry (A-pose), perineum is ~13% of thigh length below femoral heads
        const crotchApexY = midHip.y + (midKnee.y - midHip.y) * 0.13;
        const crotchPt = { x: midHip.x, y: crotchApexY };

        // Segments:
        // Cavallo (Inseam): distance from crotch apex straight to ground
        const cavalloMm = Math.round((groundPxY - crotchApexY) * scaleMmPerPx);

        // Femur (Thigh): hip to knee
        const femoreMm = Math.round(((dist2d(lHip, lKnee) + dist2d(rHip, rKnee)) / 2) * scaleMmPerPx);

        // Tibia: knee to ankle
        const tibiaMm = Math.round(((dist2d(lKnee, lAnk) + dist2d(rKnee, rAnk)) / 2) * scaleMmPerPx);

        // Torso: mid-shoulder to mid-hip
        const bustoMm = Math.round(dist2d(midSh, midHip) * scaleMmPerPx);

        // Arm: shoulder to elbow + elbow to wrist
        const lElb = pt(13), rElb = pt(14);
        const lWri = pt(15), rWri = pt(16);
        const lArm = dist2d(lSh, lElb) + dist2d(lElb, lWri);
        const rArm = dist2d(rSh, rElb) + dist2d(rElb, rWri);
        const braccioMm = Math.round(((lArm + rArm) / 2) * scaleMmPerPx);

        // Biacromial Shoulder Width (Larghezza Spalle): acromion-to-acromion
        const spalleMm = Math.round(dist2d(lSh, rSh) * scaleMmPerPx);
        let recManubrioMm = 420;
        if (spalleMm < 390) recManubrioMm = 380;
        else if (spalleMm < 410) recManubrioMm = 400;
        else if (spalleMm < 430) recManubrioMm = 420;
        else recManubrioMm = 440;

        resolve({
          ok: true,
          scaleMmPerPx,
          measurements: {
            altezza: Math.round(knownHeightCm),
            cavallo: cavalloMm,
            femore: femoreMm,
            tibia: tibiaMm,
            busto: bustoMm,
            braccio: braccioMm,
            spalle: spalleMm,
            manubrioConsigliato: recManubrioMm
          },
          points: {
            headTop: { x: midSh.x, y: headTopY * h },
            ground: { x: midAnk.x, y: groundPxY },
            midSh, lSh, rSh,
            midHip, lHip, rHip,
            crotch: crotchPt,
            lKnee, rKnee,
            lAnk, rAnk,
            lElb, rElb,
            lWri, rWri
          }
        });
      };

      this.poseDetector.onResults(oneTimeHandler);
      this.poseDetector.send({ image: imageElement }).catch((err) => {
        clearTimeout(timeout);
        this.poseDetector.onResults((res) => this._onPoseResults(res));
        reject(err);
      });
    });
  }

  renderPhotoAnalysis(targetCanvas, imageElement, res) {
    if (!targetCanvas || !imageElement || !res || !res.points) return;
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0B1120";
    ctx.fillRect(0, 0, w, h);

    const imgW = imageElement.naturalWidth || imageElement.width;
    const imgH = imageElement.naturalHeight || imageElement.height;
    const scale = Math.min(w / imgW, h / imgH);
    const ox = (w - imgW * scale) / 2;
    const oy = (h - imgH * scale) / 2;

    ctx.drawImage(imageElement, ox, oy, imgW * scale, imgH * scale);

    const mapPt = (p) => ({ x: ox + p.x * scale, y: oy + p.y * scale });
    const pts = res.points;
    const m = res.measurements;

    const drawSegment = (p1, p2, color, labelText) => {
      const sp1 = mapPt(p1);
      const sp2 = mapPt(p2);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.stroke();

      [sp1, sp2].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      if (labelText) {
        const mx = (sp1.x + sp2.x) / 2;
        const my = (sp1.y + sp2.y) / 2;
        ctx.font = "bold 11px monospace";
        const tw = ctx.measureText(labelText).width;
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(mx - tw / 2 - 8, my - 10, tw + 16, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, mx, my);
      }
      ctx.restore();
    };

    // 1. Inseam (Cavallo) - Green
    drawSegment(pts.ground, pts.crotch, "#10B981", `Cavallo: ${m.cavallo} mm`);

    // 2. Femur (Thigh) - Cyan
    drawSegment(pts.rHip, pts.rKnee, "#06B6D4", `Femore: ${m.femore} mm`);

    // 3. Tibia - Blue
    drawSegment(pts.rKnee, pts.rAnk, "#3B82F6", `Tibia: ${m.tibia} mm`);

    // 4. Torso - Amber
    drawSegment(pts.midHip, pts.midSh, "#F59E0B", `Busto: ${m.busto} mm`);

    // 5. Arm - Magenta
    drawSegment(pts.rSh, pts.rElb, "#EC4899", "");
    drawSegment(pts.rElb, pts.rWri, "#EC4899", `Braccio: ${m.braccio} mm`);

    // 6. Shoulders (Larghezza Spalle) - Purple
    if (pts.lSh && pts.rSh && m.spalle) {
      drawSegment(pts.lSh, pts.rSh, "#8B5CF6", `Spalle: ${m.spalle} mm (Manubrio: ${m.manubrioConsigliato} mm)`);
    }
  }

  captureSnapshotPNG() {
    return this.canvas.toDataURL("image/png");
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BikeFitPoseEngine };
}
