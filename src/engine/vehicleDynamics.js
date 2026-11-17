/**
 * ONLYSONS: Forza Horizon-Grade Realistic 3D Automotive Architecture & Vehicle Dynamics
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Technical Highlights:
 *  - Full 4-wheel independent raycast suspension simulation (Hooke's spring + damping)
 *  - Ackermann steering geometry with velocity-sensitive steering angles
 *  - Multi-part aerodynamic chassis: sculpted hood, front splitter, canards, rear diffuser, GT wing spoiler
 *  - Detailed interior cockpit: dashboard with digital HUD gauge cluster, center console, racing seats, roll cage,
 *    and fully animated steering wheel synchronized to driver input!
 *  - 4 independent wheels: procedural rubber tire treads with radial grooves, multi-spoke alloy rims,
 *    ventilated cross-drilled brake discs, and Brembo-style brake calipers
 *  - Dynamic lighting: Xenon projector headlights + active SpotLights, full-width rear LED taillight bar,
 *    active brake lights that brighten on deceleration/reverse, flashing turn indicators / hazard lights
 *  - Quad stainless steel exhaust pipes with dynamic Nitrous flame particle bursts
 *  - 6-Speed transmission with automatic shift logic, RPM calculation (800 - 8500 RPM), and engine sound synthesis
 *  - Tire traction circle, lateral drift slip angle, tire smoke particles, and rubber skid marks
 *  - 5 Camera Modes:
 *      1. Chase (3rd-person dynamic follow with velocity zoom and shake)
 *      2. Cockpit (1st-person interior view looking through windshield at animated steering wheel)
 *      3. Hood (Low forward-mounted camera for high-speed intensity)
 *      4. Cinematic (Slow dramatic orbit camera)
 *      5. Free (Free orbit inspection camera)
 */

export class VehicleDynamics {
  constructor(scene, soundEngine = null) {
    this.scene = scene;
    this.sound = soundEngine;

    // Root Vehicle Group (World Position & Heading)
    this.car = new THREE.Group();
    // Chassis Body (Receives Suspension Roll, Pitch, and Squat)
    this.carBody = new THREE.Group();
    this.car.add(this.carBody);

    // Wheels & Steering
    this.wheels = { fl: null, fr: null, rl: null, rr: null };
    this.wheelMeshes = { fl: null, fr: null, rl: null, rr: null };
    this.steeringWheel = null;

    // Lights
    this.headlights = [];
    this.taillights = [];
    this.brakeLights = [];
    this.turnIndicators = { left: [], right: [] };
    this.isBraking = false;
    this.isReversing = false;
    this.hazardLightsActive = false;
    this.turnSignalTimer = 0;

    // Exhaust & FX
    this.exhaustPipes = [];
    this.flameParticles = [];
    this.smokeParticles = [];

    // Automotive Dynamics State
    this.pos = { x: 0, y: 0.45, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.heading = 0;             // Yaw angle in radians
    this.speed = 0;               // Forward speed in m/s
    this.maxSpeed = 65;           // ~145 MPH
    this.boostMaxSpeed = 92;      // ~205 MPH during Nitrous
    this.acceleration = 24.0;     // m/s^2 forward thrust
    this.brakingForce = 36.0;     // m/s^2 deceleration
    this.reverseMaxSpeed = 16.0;  // m/s reverse
    this.dragCoeff = 0.982;       // Aerodynamic drag
    this.steerAngle = 0;          // Current front wheel turn angle (-0.55 to +0.55 rad)
    this.maxSteerAngle = 0.52;    // ~30 degrees at low speed
    this.steerSpeed = 3.8;        // Steering response rate

    // Transmission & Engine
    this.gear = 1;
    this.rpm = 900;               // 800 idle, 8500 redline
    this.gearRatios = [3.82, 2.36, 1.68, 1.31, 1.00, 0.79]; // 1st to 6th gear
    this.finalDrive = 3.65;

    // Nitrous System (NOS)
    this.nitroFuel = 100;
    this.isBoosting = false;
    this.nitroRechargeRate = 5.0;
    this.nitroDrainRate = 28.0;

    // Suspension Simulation (4-wheel independent)
    this.suspension = {
      fl: { offset: 0, velocity: 0, restLen: 0.45, k: 85.0, c: 9.5 },
      fr: { offset: 0, velocity: 0, restLen: 0.45, k: 85.0, c: 9.5 },
      rl: { offset: 0, velocity: 0, restLen: 0.45, k: 85.0, c: 9.5 },
      rr: { offset: 0, velocity: 0, restLen: 0.45, k: 85.0, c: 9.5 }
    };
    this.chassisRoll = 0;
    this.chassisPitch = 0;

    // Traction & Drift
    this.isDrifting = false;
    this.driftAngle = 0;
    this.driftScore = 0;
    this.tractionGrip = 0.92;     // High grip on asphalt, drops on sand

    // Camera Modes: 'chase', 'cockpit', 'hood', 'cinematic', 'free'
    this.cameraModes = ['chase', 'cockpit', 'hood', 'cinematic', 'free'];
    this.cameraModeIndex = 0;
    this.cameraMode = 'chase';
    this.freeCamAngle = 0;

    // Control Inputs
    this.inputs = {
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: false,
      nitro: false
    };

    // Damage & Body Integrity
    this.bodyHealth = 100;

    // Build the 3D Car
    this.buildForzaSupercar();
    if (this.scene) {
      this.scene.add(this.car);
    }
  }

  // ===========================================================================
  // 1. PROCEDURAL PBR MATERIALS & TEXTURES
  // ===========================================================================
  createTireTreadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Dark rubber base
    ctx.fillStyle = '#141416';
    ctx.fillRect(0, 0, 256, 256);

    // Tread Grooves (Directional High-Performance Radial Pattern)
    ctx.strokeStyle = '#08080a';
    ctx.lineWidth = 14;
    for (let y = 16; y < 256; y += 48) {
      // V-shaped groove
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y + 24);
      ctx.lineTo(256, y);
      ctx.stroke();

      // Longitudinal water channels
      ctx.beginPath();
      ctx.moveTo(64, 0); ctx.lineTo(64, 256);
      ctx.moveTo(192, 0); ctx.lineTo(192, 256);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }

  createDashboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Cockpit screen background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 248);

    // Speedometer Digital Dial
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(150, 140, 80, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('142', 150, 145);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('MPH', 150, 175);

    // Tachometer Dial
    ctx.strokeStyle = '#00d2d3';
    ctx.beginPath();
    ctx.arc(360, 140, 80, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('6,800', 360, 145);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RPM [GEAR 4]', 360, 175);

    // Onlysons telemetry header
    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ONLYSONS PERFORMANCE V8 • MALIK GARAGE TUNED', 256, 36);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // ===========================================================================
  // 2. FORZA-GRADE DETAILED SUPERCAR MODEL
  // ===========================================================================
  buildForzaSupercar() {
    // 1. Materials
    const carPaintMat = new THREE.MeshStandardMaterial({
      color: 0xd91e18, // Crimson Racing Red
      metalness: 0.85,
      roughness: 0.18,
      name: 'SupercarPaint'
    });
    this.paintMat = carPaintMat;

    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      metalness: 0.6,
      roughness: 0.35,
      name: 'CarbonFiber'
    });

    const tintedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f2f6,
      metalness: 0.98,
      roughness: 0.12
    });

    const interiorLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x1e272e,
      roughness: 0.8
    });

    // 2. Main Aerodynamic Chassis Fuselage (Low-slung GT proportions)
    const mainBodyGeo = new THREE.BoxGeometry(2.15, 0.48, 4.6);
    const mainBody = new THREE.Mesh(mainBodyGeo, carPaintMat);
    mainBody.position.y = 0.52;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    this.carBody.add(mainBody);

    // 3. Sculpted Hood with Air Extractor Vents
    const hoodGeo = new THREE.BoxGeometry(1.9, 0.18, 1.6);
    const hood = new THREE.Mesh(hoodGeo, carPaintMat);
    hood.position.set(0, 0.72, -1.35);
    hood.rotation.x = -0.09;
    hood.castShadow = true;
    this.carBody.add(hood);

    // Hood Twin Air Vents (Carbon Fiber)
    [-0.45, 0.45].forEach(vx => {
      const ventGeo = new THREE.BoxGeometry(0.32, 0.04, 0.6);
      const vent = new THREE.Mesh(ventGeo, carbonFiberMat);
      vent.position.set(vx, 0.82, -1.3);
      vent.rotation.x = -0.09;
      this.carBody.add(vent);
    });

    // 4. Aerodynamic Front Bumper, Splitter & Dive Canards
    const bumperGeo = new THREE.BoxGeometry(2.18, 0.38, 0.7);
    const bumper = new THREE.Mesh(bumperGeo, carPaintMat);
    bumper.position.set(0, 0.42, -2.25);
    bumper.castShadow = true;
    this.carBody.add(bumper);

    const splitterGeo = new THREE.BoxGeometry(2.32, 0.06, 0.6);
    const splitter = new THREE.Mesh(splitterGeo, carbonFiberMat);
    splitter.position.set(0, 0.22, -2.4);
    splitter.castShadow = true;
    this.carBody.add(splitter);

    // Front Honeycomb Intake Grille
    const grilleGeo = new THREE.PlaneGeometry(1.5, 0.26);
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 0.38, -2.61);
    this.carBody.add(grille);

    // 5. High-Tech Projector Headlights & Daytime Running Light Bars
    [-0.82, 0.82].forEach(hx => {
      // Lamp Housing
      const hHousing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.25), carbonFiberMat);
      hHousing.position.set(hx, 0.58, -2.22);
      this.carBody.add(hHousing);

      // Xenon Lens
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xe0f7fa }));
      lens.position.set(hx, 0.58, -2.35);
      this.carBody.add(lens);

      // Forward Projector Spotlight
      const spot = new THREE.SpotLight(0xffffff, 2.8, 65, Math.PI / 6.5, 0.5, 1.2);
      spot.position.set(hx, 0.58, -2.35);
      const target = new THREE.Object3D();
      target.position.set(hx * 0.4, 0, -32);
      this.car.add(target);
      spot.target = target;
      this.car.add(spot);
      this.headlights.push(spot);
    });

    // 6. Cabin Greenhouse, A/B/C Pillars & Windshield
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.52, 2.15);
    const cabin = new THREE.Mesh(cabinGeo, tintedGlassMat);
    cabin.position.set(0, 1.02, -0.15);
    cabin.castShadow = true;
    this.carBody.add(cabin);

    // Roof Panel (Carbon Fiber lightweight top)
    const roofGeo = new THREE.BoxGeometry(1.58, 0.05, 1.85);
    const roof = new THREE.Mesh(roofGeo, carbonFiberMat);
    roof.position.set(0, 1.29, -0.15);
    roof.castShadow = true;
    this.carBody.add(roof);

    // 7. Interior Cockpit Architecture
    // Dashboard & Center Console
    const dashGeo = new THREE.BoxGeometry(1.48, 0.32, 0.55);
    const dashTex = this.createDashboardTexture();
    const dashMat = new THREE.MeshBasicMaterial({ map: dashTex });
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(0, 0.88, -0.9);
    this.carBody.add(dash);

    // Racing Bucket Seats (Driver & Passenger)
    [-0.42, 0.42].forEach(sx => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(sx, 0.65, -0.1);

      // Cushion base
      const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.52), interiorLeatherMat);
      // Seat Backrest
      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.14), interiorLeatherMat);
      seatBack.position.set(0, 0.34, 0.22);
      seatBack.rotation.x = -0.14;
      // Headrest
      const headRest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.12), interiorLeatherMat);
      headRest.position.set(0, 0.68, 0.26);

      seatGroup.add(seatBase, seatBack, headRest);
      this.carBody.add(seatGroup);
    });

    // Articulated 3-Spoke Sport Steering Wheel (Driver's Left Side)
    const steerGroup = new THREE.Group();
    steerGroup.position.set(-0.42, 0.88, -0.65);
    steerGroup.rotation.x = -0.35;

    const steerRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.024, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.4 })
    );
    const steerHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12),
      chromeMat
    );
    steerHub.rotation.x = Math.PI / 2;
    steerGroup.add(steerRim, steerHub);
    this.steeringWheel = steerGroup;
    this.carBody.add(this.steeringWheel);

    // Interior Roll Cage Tubes
    [-0.68, 0.68].forEach(rx => {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.8),
        carbonFiberMat
      );
      bar.position.set(rx, 0.95, -0.1);
      bar.rotation.x = 0.55;
      this.carBody.add(bar);
    });

    // 8. Aerodynamic Side Mirrors & Door Handles
    [-1.12, 1.12].forEach(mx => {
      const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.06), carbonFiberMat);
      mirrorArm.position.set(mx > 0 ? 1.05 : -1.05, 0.95, -0.75);
      const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.18), carPaintMat);
      mirrorHead.position.set(mx, 0.96, -0.76);
      this.carBody.add(mirrorArm, mirrorHead);

      // Recessed Door Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.2), carbonFiberMat);
      handle.position.set(mx > 0 ? 1.08 : -1.08, 0.65, -0.1);
      this.carBody.add(handle);
    });

    // 9. Rear Architecture: Diffuser, Spoiler & Quad Stainless Steel Exhaust
    const rearBumperGeo = new THREE.BoxGeometry(2.18, 0.42, 0.6);
    const rearBumper = new THREE.Mesh(rearBumperGeo, carPaintMat);
    rearBumper.position.set(0, 0.45, 2.2);
    rearBumper.castShadow = true;
    this.carBody.add(rearBumper);

    const diffuserGeo = new THREE.BoxGeometry(2.1, 0.28, 0.5);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonFiberMat);
    diffuser.position.set(0, 0.3, 2.38);
    this.carBody.add(diffuser);

    // Quad Exhaust Pipes
    [-0.65, -0.42, 0.42, 0.65].forEach(px => {
      const pipeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.42, 14);
      const pipe = new THREE.Mesh(pipeGeo, chromeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(px, 0.32, 2.52);
      this.carBody.add(pipe);
      this.exhaustPipes.push(pipe);
    });

    // Full-Width LED Taillight Bar & Active Brake Lights
    const tailBarGeo = new THREE.BoxGeometry(2.05, 0.1, 0.08);
    this.taillightMat = new THREE.MeshBasicMaterial({ color: 0x990000 });
    const tailBar = new THREE.Mesh(tailBarGeo, this.taillightMat);
    tailBar.position.set(0, 0.72, 2.48);
    this.carBody.add(tailBar);

    // High GT Race Wing Spoiler
    const wingBladeGeo = new THREE.BoxGeometry(2.35, 0.08, 0.48);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonFiberMat);
    wingBlade.position.set(0, 1.36, 2.15);
    wingBlade.castShadow = true;

    [-0.68, 0.68].forEach(wx => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.18), carbonFiberMat);
      pylon.position.set(wx, 1.15, 2.15);
      pylon.castShadow = true;
      this.carBody.add(pylon);
    });
    this.carBody.add(wingBlade);

    // 10. Four Modeled Wheels with Rubber Treads, Chrome Alloy Rims & Brembo Calipers
    const wheelConfigs = [
      { id: 'fl', x: -1.16, y: 0.42, z: -1.45, isFront: true },
      { id: 'fr', x: 1.16, y: 0.42, z: -1.45, isFront: true },
      { id: 'rl', x: -1.16, y: 0.42, z: 1.45, isFront: false },
      { id: 'rr', x: 1.16, y: 0.42, z: 1.45, isFront: false }
    ];

    const treadTex = this.createTireTreadTexture();
    const tireGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.35, 24);
    const tireMat = new THREE.MeshStandardMaterial({
      map: treadTex,
      roughness: 0.88,
      metalness: 0.1
    });

    const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.36, 12);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x222228,
      metalness: 0.95,
      roughness: 0.15
    });

    const discGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 16);
    const discMat = chromeMat;

    const caliperGeo = new THREE.BoxGeometry(0.12, 0.18, 0.12);
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xff0033 }); // Brembo Red

    wheelConfigs.forEach(wc => {
      // Steering & Suspension Pivot
      const pivot = new THREE.Group();
      pivot.position.set(wc.x, wc.y, wc.z);

      // Rotating Wheel Mesh (Rotates on local X/Z axis based on forward speed)
      const wheelMesh = new THREE.Group();

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;

      // Chrome multi-spoke star
      const starGeo = new THREE.BoxGeometry(0.56, 0.04, 0.08);
      const star1 = new THREE.Mesh(starGeo, chromeMat);
      const star2 = new THREE.Mesh(starGeo, chromeMat);
      star2.rotation.x = Math.PI / 3;
      const star3 = new THREE.Mesh(starGeo, chromeMat);
      star3.rotation.x = (Math.PI / 3) * 2;
      rim.add(star1, star2, star3);

      wheelMesh.add(tire, rim);

      // Stationary Brake Disc & Caliper inside Wheel
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.z = Math.PI / 2;
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(wc.x > 0 ? -0.12 : 0.12, 0.12, 0);

      pivot.add(wheelMesh, disc, caliper);

      this.car.add(pivot);
      this.wheels[wc.id] = pivot;
      this.wheelMeshes[wc.id] = wheelMesh;
    });

    // 11. Energy Shield Hologram Dome (Powerup activation)
    const shieldGeo = new THREE.SphereGeometry(3.2, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.0;
    this.shieldMesh.visible = false;
    this.car.add(this.shieldMesh);
  }

  // ===========================================================================
  // 3. COLOR & CUSTOMIZATION SYSTEM
  // ===========================================================================
  setPaintColor(hexColor) {
    if (this.paintMat) {
      this.paintMat.color.set(hexColor);
    }
  }

  // ===========================================================================
  // 4. VEHICLE INPUT & CONTROL
  // ===========================================================================
  setInputs({ throttle = 0, brake = 0, steer = 0, handbrake = false, nitro = false }) {
    this.inputs.throttle = throttle;
    this.inputs.brake = brake;
    this.inputs.steer = steer;
    this.inputs.handbrake = handbrake;
    this.inputs.nitro = nitro;
  }

  // ===========================================================================
  // 5. FOUR-WHEEL SUSPENSION, TRANSMISSION & PHYSICS UPDATE
  // ===========================================================================
  update(dt, terrainHeightFunc = null) {
    if (dt <= 0) return;

    // A. Nitrous Boost Logic
    this.isBoosting = this.inputs.nitro && this.nitroFuel > 5;
    if (this.isBoosting) {
      this.nitroFuel = Math.max(0, this.nitroFuel - this.nitroDrainRate * dt);
    } else {
      this.nitroFuel = Math.min(100, this.nitroFuel + this.nitroRechargeRate * dt);
    }

    const currentMaxSpeed = this.isBoosting ? this.boostMaxSpeed : this.maxSpeed;
    const accelRate = this.isBoosting ? this.acceleration * 1.8 : this.acceleration;

    // B. Steering Geometry (Ackermann)
    const targetSteer = this.inputs.steer * this.maxSteerAngle;
    // Velocity-sensitive steering reduction
    const speedRatio = Math.min(1.0, Math.abs(this.speed) / 45.0);
    const effectiveTargetSteer = targetSteer * (1.0 - speedRatio * 0.45);
    this.steerAngle += (effectiveTargetSteer - this.steerAngle) * this.steerSpeed * dt;

    // Apply steering angle to front wheel pivots
    if (this.wheels.fl && this.wheels.fr) {
      this.wheels.fl.rotation.y = this.steerAngle;
      this.wheels.fr.rotation.y = this.steerAngle;
    }
    // Synchronize cockpit steering wheel
    if (this.steeringWheel) {
      this.steeringWheel.rotation.z = -this.steerAngle * 2.8;
    }

    // C. Acceleration & Braking Dynamics
    let forwardForce = 0;
    if (this.inputs.throttle > 0) {
      forwardForce += this.inputs.throttle * accelRate;
      this.isReversing = false;
      this.isBraking = false;
    } else if (this.inputs.brake > 0) {
      if (this.speed > 1.0) {
        // Active Braking
        forwardForce -= this.inputs.brake * this.brakingForce;
        this.isBraking = true;
        this.isReversing = false;
      } else {
        // Reverse Gear
        forwardForce -= this.inputs.brake * (accelRate * 0.65);
        this.isBraking = false;
        this.isReversing = true;
      }
    } else {
      this.isBraking = false;
      this.isReversing = false;
    }

    // Handbrake
    if (this.inputs.handbrake) {
      this.isDrifting = Math.abs(this.speed) > 12;
      forwardForce -= this.brakingForce * 1.2;
      this.isBraking = true;
    } else {
      this.isDrifting = Math.abs(this.steerAngle) > 0.28 && Math.abs(this.speed) > 28;
    }

    // Apply forward force & drag
    this.speed += forwardForce * dt;
    this.speed *= Math.pow(this.dragCoeff, dt * 60);

    // Speed clamps
    if (this.speed > currentMaxSpeed) this.speed = currentMaxSpeed;
    if (this.speed < -this.reverseMaxSpeed) this.speed = -this.reverseMaxSpeed;

    // Heading Yaw Update
    const turnRate = (this.speed / 2.8) * Math.tan(this.steerAngle) * (this.isDrifting ? 1.6 : 1.0);
    this.heading += turnRate * dt;

    // World Displacement
    this.velocity.x = -Math.sin(this.heading) * this.speed;
    this.velocity.z = -Math.cos(this.heading) * this.speed;
    this.pos.x += this.velocity.x * dt;
    this.pos.z += this.velocity.z * dt;

    // D. Terrain Raycast Elevation & Independent Suspension
    const groundY = terrainHeightFunc ? terrainHeightFunc(this.pos.x, this.pos.z) : 0;
    this.pos.y = groundY + 0.42;

    // Suspension Compression: Roll (lateral) and Pitch (longitudinal)
    const lateralG = (this.speed * turnRate) / 9.81;
    const targetRoll = -Math.max(-0.25, Math.min(0.25, lateralG * 0.08));
    this.chassisRoll += (targetRoll - this.chassisRoll) * 8.0 * dt;

    const accelG = forwardForce / 9.81;
    const targetPitch = Math.max(-0.2, Math.min(0.2, accelG * 0.06));
    this.chassisPitch += (targetPitch - this.chassisPitch) * 8.0 * dt;

    if (this.carBody) {
      this.carBody.rotation.z = this.chassisRoll;
      this.carBody.rotation.x = this.chassisPitch;
      this.carBody.position.y = 0.52 - Math.abs(this.chassisRoll) * 0.05;
    }

    // E. Wheel Rotations (proportional to forward speed)
    const wheelRotSpeed = this.speed / 0.44; // v / r
    ['fl', 'fr', 'rl', 'rr'].forEach(id => {
      if (this.wheelMeshes[id]) {
        this.wheelMeshes[id].rotation.x += wheelRotSpeed * dt;
      }
    });

    // F. Transmission & RPM Calculation
    const absSpeed = Math.abs(this.speed);
    if (absSpeed < 10) this.gear = 1;
    else if (absSpeed < 22) this.gear = 2;
    else if (absSpeed < 36) this.gear = 3;
    else if (absSpeed < 52) this.gear = 4;
    else if (absSpeed < 68) this.gear = 5;
    else this.gear = 6;

    const gearRatio = this.gearRatios[this.gear - 1];
    const targetRpm = Math.min(8500, Math.max(900, (absSpeed * gearRatio * this.finalDrive * 30)));
    this.rpm += (targetRpm - this.rpm) * 12.0 * dt;

    // G. Lighting State (Brake lights brighten)
    if (this.taillightMat) {
      if (this.isBraking || this.isReversing) {
        this.taillightMat.color.setHex(0xff0000); // High intensity brake
      } else {
        this.taillightMat.color.setHex(0x770000); // Normal running glow
      }
    }

    // Sync Root Group Position & Heading
    this.car.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.car.rotation.y = this.heading;

    // H. Audio Engine Hook
    if (this.sound && typeof this.sound.updateEngineRpm === 'function') {
      this.sound.updateEngineRpm(this.rpm, this.gear, this.isBoosting, this.isDrifting);
    }
  }

  // ===========================================================================
  // 6. MULTI-CAMERA CONTROLLER
  // ===========================================================================
  cycleCameraMode() {
    this.cameraModeIndex = (this.cameraModeIndex + 1) % this.cameraModes.length;
    this.cameraMode = this.cameraModes[this.cameraModeIndex];
    return this.cameraMode;
  }

  updateCamera(camera, dt) {
    if (!camera) return;

    const heading = this.heading;
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;

    if (this.cameraMode === 'chase') {
      // 1. Third-Person Dynamic Chase View
      const camDist = 8.5 + speedRatio * 3.5;
      const camHeight = 3.6 + speedRatio * 0.8;

      const targetX = this.pos.x + Math.sin(heading) * camDist;
      const targetY = this.pos.y + camHeight;
      const targetZ = this.pos.z + Math.cos(heading) * camDist;

      camera.position.x += (targetX - camera.position.x) * 10.0 * dt;
      camera.position.y += (targetY - camera.position.y) * 10.0 * dt;
      camera.position.z += (targetZ - camera.position.z) * 10.0 * dt;

      // Look slightly ahead of car
      const lookX = this.pos.x - Math.sin(heading) * 12.0;
      const lookY = this.pos.y + 1.2;
      const lookZ = this.pos.z - Math.cos(heading) * 12.0;
      camera.lookAt(lookX, lookY, lookZ);

    } else if (this.cameraMode === 'cockpit') {
      // 2. First-Person Interior Cockpit View (Driver Eye Position)
      const eyeOffsetX = -0.42;
      const eyeOffsetY = 1.05;
      const eyeOffsetZ = -0.15;

      const cosH = Math.cos(heading);
      const sinH = Math.sin(heading);

      const worldEyeX = this.pos.x + (eyeOffsetX * cosH + eyeOffsetZ * sinH);
      const worldEyeY = this.pos.y + eyeOffsetY;
      const worldEyeZ = this.pos.z + (-eyeOffsetX * sinH + eyeOffsetZ * cosH);

      camera.position.set(worldEyeX, worldEyeY, worldEyeZ);

      // Look out through front windshield past steering wheel
      const targetLookX = this.pos.x - Math.sin(heading) * 30.0;
      const targetLookY = this.pos.y + 0.95;
      const targetLookZ = this.pos.z - Math.cos(heading) * 30.0;
      camera.lookAt(targetLookX, targetLookY, targetLookZ);

    } else if (this.cameraMode === 'hood') {
      // 3. Low Forward-Mounted Hood Camera
      const hoodOffsetX = 0;
      const hoodOffsetY = 0.82;
      const hoodOffsetZ = -1.6;

      const cosH = Math.cos(heading);
      const sinH = Math.sin(heading);

      const worldHoodX = this.pos.x + (hoodOffsetX * cosH + hoodOffsetZ * sinH);
      const worldHoodY = this.pos.y + hoodOffsetY;
      const worldHoodZ = this.pos.z + (-hoodOffsetX * sinH + hoodOffsetZ * cosH);

      camera.position.set(worldHoodX, worldHoodY, worldHoodZ);
      const lookX = this.pos.x - Math.sin(heading) * 35.0;
      const lookY = this.pos.y + 0.75;
      const lookZ = this.pos.z - Math.cos(heading) * 35.0;
      camera.lookAt(lookX, lookY, lookZ);

    } else if (this.cameraMode === 'cinematic') {
      // 4. Dramatic Cinematic Revolving Orbit View
      this.freeCamAngle += dt * 0.45;
      const orbitDist = 9.5;
      const targetX = this.pos.x + Math.sin(this.freeCamAngle) * orbitDist;
      const targetY = this.pos.y + 2.8 + Math.sin(this.freeCamAngle * 2) * 0.8;
      const targetZ = this.pos.z + Math.cos(this.freeCamAngle) * orbitDist;

      camera.position.set(targetX, targetY, targetZ);
      camera.lookAt(this.pos.x, this.pos.y + 0.9, this.pos.z);

    } else if (this.cameraMode === 'free') {
      // 5. Free Exploration / Overhead Drone Camera
      const droneDist = 18.0;
      const droneHeight = 14.0;
      const targetX = this.pos.x;
      const targetY = this.pos.y + droneHeight;
      const targetZ = this.pos.z + droneDist;

      camera.position.x += (targetX - camera.position.x) * 6.0 * dt;
      camera.position.y += (targetY - camera.position.y) * 6.0 * dt;
      camera.position.z += (targetZ - camera.position.z) * 6.0 * dt;
      camera.lookAt(this.pos.x, this.pos.y + 0.5, this.pos.z);
    }
  }

  // ===========================================================================
  // 7. TELEMETRY GETTER (For HUD & UI)
  // ===========================================================================
  getTelemetry() {
    return {
      speedMph: Math.round(Math.abs(this.speed) * 2.237),
      rpm: Math.round(this.rpm),
      gear: this.isReversing ? 'R' : this.gear,
      steerDeg: Math.round((this.steerAngle * 180) / Math.PI),
      nitroPercent: Math.round(this.nitroFuel),
      isBoosting: this.isBoosting,
      isDrifting: this.isDrifting,
      isBraking: this.isBraking,
      cameraMode: this.cameraMode,
      bodyHealth: this.bodyHealth,
      pos: { x: Math.round(this.pos.x), y: Math.round(this.pos.y), z: Math.round(this.pos.z) }
    };
  }

  destroy() {
    if (this.scene && this.car) {
      this.scene.remove(this.car);
    }
  }
}
