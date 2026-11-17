/**
 * ONLYSONS 3D: Realistic GTA-Grade 3D City Highway & Vehicle Physics Engine
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * Features:
 *  - Photorealistic procedural PBR textures (Asphalt, Sidewalk, Skyscrapers, Billboards)
 *  - Full 6-DOF Vehicle Dynamics: Gears 1-6, RPM, Drag, Suspension Roll & Pitch
 *  - Real Drift Mechanics with Tire Smoke, Rubber Skid Marks & Web Audio Screech
 *  - Nitrous Oxide (NOS) Supercharge with exhaust flame particles & camera warp
 *  - Ballistic 3D Stunt Jump Ramps with airborne trajectory & landing compression
 *  - Procedural AI Traffic (Yellow Cabs, Executive SUVs, Police Cruisers with Strobes)
 *  - Dynamic GTA Follow Camera (Chase, Bumper, Aerial views)
 *  - 100 Progressive Story Levels, Boss Milestones, and Upvote Collectibles
 */

export class KarmaSurfers3D {
  constructor(canvasContainerId, onScoreUpdate, onGameOver, onLevelComplete, soundEngine = null) {
    this.container = document.getElementById(canvasContainerId);
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;
    this.onLevelComplete = onLevelComplete;
    this.sound = soundEngine;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;

    // Textures Cache
    this.asphaltTex = null;
    this.sidewalkTex = null;
    this.buildingTexCache = [];
    this.billboardTexCache = [];

    // Player Vehicle & Physics
    this.car = null;
    this.carBody = null;
    this.wheels = { fl: null, fr: null, rl: null, rr: null };
    this.headlights = [];
    this.taillights = [];
    this.exhaustPipes = [];

    // Vehicle Physics State
    this.speed = 0;           // World units per second (0 to ~90)
    this.maxSpeed = 75;       // Base top speed (MPH equivalent)
    this.boostSpeed = 115;    // Top speed during Nitrous
    this.acceleration = 36;   // Forward acceleration force
    this.braking = 52;        // Braking deceleration
    this.drag = 0.985;        // Air resistance drag
    this.gear = 1;            // Current transmission gear (1 to 6)
    this.rpm = 900;           // 800 - 8200 RPM
    this.steerAngle = 0;      // Front wheel steering angle (radians)
    this.carHeading = 0;      // Yaw rotation
    this.posX = 0;            // Lateral road position (-9 to +9)
    this.roadWidth = 18;      // 4-lane wide highway

    // Drift & Traction
    this.isDrifting = false;
    this.driftAngle = 0;
    this.driftScore = 0;
    this.driftMultiplier = 1.0;

    // Nitrous Boost (NOS)
    this.isBoosting = false;
    this.nitroFuel = 100;     // 0 to 100%
    this.nitroRechargeRate = 4.5;
    this.nitroDrainRate = 26;

    // Airborne Stunt Jump Physics
    this.isAirborne = false;
    this.verticalVelocity = 0;
    this.carAltitude = 0;
    this.gravity = 38.0;      // m/s^2
    this.pitchAngle = 0;
    this.rollAngle = 0;

    // Suspension
    this.suspensionOffset = 0;
    this.suspensionVelocity = 0;

    // Game Progression
    this.isRunning = false;
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.level = 1;
    this.targetDistance = 300;
    this.hasShield = false;
    this.shieldMesh = null;
    this.multiplierTimer = 0;
    this.scoreMultiplier = 1;
    this.magnetTimer = 0;

    // Camera Modes: 'chase', 'bumper', 'aerial'
    this.cameraMode = 'chase';
    this.cameraShake = 0;
    this.targetFov = 65;

    // World Entities
    this.trackSegments = [];
    this.trafficCars = [];
    this.obstacles = [];
    this.collectibles = [];
    this.skidMarks = [];
    this.smokeParticles = [];
    this.sparkParticles = [];
    this.exhaustFlameParticles = [];

    // Controller Input State
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      handbrake: false,
      nitro: false
    };

    // Performance timer
    this.lastTime = performance.now();
  }

  // ===========================================================================
  // 1. PROCEDURAL PHOTOREALISTIC TEXTURE GENERATORS (0 external image assets)
  // ===========================================================================
  generateProceduralTextures() {
    // A. Realistic Asphalt Texture (1024x1024)
    const aspCanvas = document.createElement('canvas');
    aspCanvas.width = 1024;
    aspCanvas.height = 1024;
    const ctxA = aspCanvas.getContext('2d');

    // Base dark asphalt
    ctxA.fillStyle = '#1c1e22';
    ctxA.fillRect(0, 0, 1024, 1024);

    // Grain & Aggregate Noise
    const imgData = ctxA.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 36;
      data[i] = Math.max(18, Math.min(60, data[i] + noise));
      data[i + 1] = Math.max(18, Math.min(60, data[i + 1] + noise));
      data[i + 2] = Math.max(22, Math.min(65, data[i + 2] + noise));
    }
    ctxA.putImageData(imgData, 0, 0);

    // Center Double Yellow Line
    ctxA.lineWidth = 10;
    ctxA.strokeStyle = '#f5b000';
    ctxA.beginPath();
    ctxA.moveTo(506, 0); ctxA.lineTo(506, 1024);
    ctxA.moveTo(518, 0); ctxA.lineTo(518, 1024);
    ctxA.stroke();

    // White Dashed Lane Dividers (Left and Right Lanes)
    ctxA.lineWidth = 8;
    ctxA.strokeStyle = 'rgba(240, 244, 248, 0.9)';
    ctxA.setLineDash([48, 48]);
    ctxA.beginPath();
    ctxA.moveTo(256, 0); ctxA.lineTo(256, 1024);
    ctxA.moveTo(768, 0); ctxA.lineTo(768, 1024);
    ctxA.stroke();

    // Outer Shoulder Solid White Lines
    ctxA.setLineDash([]);
    ctxA.lineWidth = 12;
    ctxA.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctxA.beginPath();
    ctxA.moveTo(32, 0); ctxA.lineTo(32, 1024);
    ctxA.moveTo(992, 0); ctxA.lineTo(992, 1024);
    ctxA.stroke();

    // Subtle Road Tar Patches and Tire Wear
    ctxA.fillStyle = 'rgba(10, 12, 14, 0.22)';
    ctxA.fillRect(190, 0, 130, 1024);
    ctxA.fillRect(440, 0, 140, 1024);
    ctxA.fillRect(700, 0, 130, 1024);

    this.asphaltTex = new THREE.CanvasTexture(aspCanvas);
    this.asphaltTex.wrapS = THREE.RepeatWrapping;
    this.asphaltTex.wrapT = THREE.RepeatWrapping;
    this.asphaltTex.repeat.set(1, 4);

    // B. Concrete Sidewalk Texture (512x512)
    const swCanvas = document.createElement('canvas');
    swCanvas.width = 512;
    swCanvas.height = 512;
    const ctxS = swCanvas.getContext('2d');
    ctxS.fillStyle = '#636e72';
    ctxS.fillRect(0, 0, 512, 512);

    // Tile grid expansion lines
    ctxS.strokeStyle = '#2d3436';
    ctxS.lineWidth = 4;
    for (let y = 0; y <= 512; y += 128) {
      ctxS.beginPath();
      ctxS.moveTo(0, y); ctxS.lineTo(512, y);
      ctxS.stroke();
    }
    // Curb highlight bevel
    const curbGrad = ctxS.createLinearGradient(0, 0, 64, 0);
    curbGrad.addColorStop(0, '#b2bec3');
    curbGrad.addColorStop(1, '#636e72');
    ctxS.fillStyle = curbGrad;
    ctxS.fillRect(0, 0, 64, 512);

    this.sidewalkTex = new THREE.CanvasTexture(swCanvas);
    this.sidewalkTex.wrapS = THREE.RepeatWrapping;
    this.sidewalkTex.wrapT = THREE.RepeatWrapping;
    this.sidewalkTex.repeat.set(1, 6);

    // C. 3 High-Rise Skyscraper Glass Window Facades
    const bThemes = [
      { bg: '#0b1320', lit1: '#f1c40f', lit2: '#3498db', sign: 'ONLYSONS CORP' },
      { bg: '#151515', lit1: '#00d2d3', lit2: '#ff9f43', sign: 'REDDIT DEV TOWER' },
      { bg: '#1a0b1e', lit1: '#e056fd', lit2: '#ff7675', sign: 'WSB CAPITAL' }
    ];

    bThemes.forEach((theme) => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 512;
      bCanvas.height = 1024;
      const ctxB = bCanvas.getContext('2d');

      // Architectural facade base
      ctxB.fillStyle = theme.bg;
      ctxB.fillRect(0, 0, 512, 1024);

      // Windows Grid
      const rows = 32;
      const cols = 8;
      const wWidth = 44;
      const wHeight = 18;
      const padX = 20;
      const padY = 14;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * (wWidth + padX) + 12;
          const y = r * (wHeight + padY) + 70;
          const roll = Math.random();

          if (roll < 0.35) {
            ctxB.fillStyle = theme.lit1; // Warm interior light
          } else if (roll < 0.6) {
            ctxB.fillStyle = theme.lit2; // Cyan office light
          } else {
            ctxB.fillStyle = 'rgba(255,255,255,0.06)'; // Dark tinted glass
          }
          ctxB.fillRect(x, y, wWidth, wHeight);
        }
      }

      // Neon Top Header Sign
      ctxB.fillStyle = '#ff4500';
      ctxB.fillRect(20, 16, 472, 38);
      ctxB.fillStyle = '#ffffff';
      ctxB.font = 'bold 22px sans-serif';
      ctxB.textAlign = 'center';
      ctxB.fillText(theme.sign, 256, 42);

      const bTex = new THREE.CanvasTexture(bCanvas);
      this.buildingTexCache.push(bTex);
    });

    // D. Highway Billboards Textures
    const billTitles = [
      { t: 'ONLYSONS DYNASTY', sub: 'Join 5 Legendary Brothers on r/All', color: '#ff4500' },
      { t: 'DEVVIT HACKATHON', sub: 'Built with pride for Reddit Community', color: '#0079d3' },
      { t: 'TO THE MOON 🚀', sub: 'r/WallStreetBets Diamond Hands', color: '#ffd700' }
    ];

    billTitles.forEach(b => {
      const bbCanvas = document.createElement('canvas');
      bbCanvas.width = 512;
      bbCanvas.height = 256;
      const ctxBB = bbCanvas.getContext('2d');

      ctxBB.fillStyle = '#0f172a';
      ctxBB.fillRect(0, 0, 512, 256);

      // Neon Border
      ctxBB.strokeStyle = b.color;
      ctxBB.lineWidth = 10;
      ctxBB.strokeRect(8, 8, 496, 240);

      // Title
      ctxBB.fillStyle = b.color;
      ctxBB.font = 'bold 36px sans-serif';
      ctxBB.textAlign = 'center';
      ctxBB.fillText(b.t, 256, 110);

      // Subtitle
      ctxBB.fillStyle = '#ffffff';
      ctxBB.font = '19px sans-serif';
      ctxBB.fillText(b.sub, 256, 165);

      this.billboardTexCache.push(new THREE.CanvasTexture(bbCanvas));
    });
  }

  // ===========================================================================
  // 2. INITIALIZATION & SCENE SETUP
  // ===========================================================================
  init() {
    if (!this.container || typeof THREE === 'undefined') return;

    // Generate high-resolution procedural textures
    this.generateProceduralTextures();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0c121e, 0.0075);

    // Camera
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
    this.camera.position.set(0, 4.2, 8.5);
    this.camera.lookAt(0, 1.4, -15);

    // Renderer with Soft Shadows and High-Precision Depth
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Realistic Sunset / Cyber Dusk Lighting
    const hemiLight = new THREE.HemisphereLight(0xffecd2, 0x111625, 0.85);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffa040, 1.35);
    sunLight.position.set(35, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Build Realistic 3D World
    this.createRealisticPlayerCar();
    this.buildInitialCityHighway();
    this.setupController();

    window.addEventListener('resize', () => this.onResize());
  }

  // ===========================================================================
  // 3. REALISTIC GTA SUPERCAR MODEL WITH ARTICULATION & PBR MATERIALS
  // ===========================================================================
  createRealisticPlayerCar() {
    this.car = new THREE.Group();

    // Car Body / Chassis Root (for suspension roll and pitch tilting)
    this.carBody = new THREE.Group();
    this.car.add(this.carBody);

    // High-Gloss Metallic Car Paint Material
    const carPaintMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      metalness: 0.88,
      roughness: 0.18,
      name: 'CarPaint'
    });

    // Dark Carbon Fiber Material
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      metalness: 0.5,
      roughness: 0.4
    });

    // Dark Tinted Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050b14,
      metalness: 0.95,
      roughness: 0.08,
      transparent: true,
      opacity: 0.88
    });

    // 1. Aerodynamic Lower Fuselage / Monocoque
    const lowerBodyGeo = new THREE.BoxGeometry(2.2, 0.55, 4.8);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, carPaintMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.carBody.add(lowerBody);

    // 2. Cabin Greenhouse & Windshield (Aerodynamic Wedge)
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.52, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.05, -0.2);
    cabin.castShadow = true;
    this.carBody.add(cabin);

    // 3. Carbon Fiber Front Splitter & Bumper
    const splitterGeo = new THREE.BoxGeometry(2.3, 0.1, 0.8);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.32, -2.4);
    splitter.castShadow = true;
    this.carBody.add(splitter);

    // 4. Front Honeycomb Radiator Grille
    const grilleGeo = new THREE.PlaneGeometry(1.6, 0.28);
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0c });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 0.48, -2.41);
    this.carBody.add(grille);

    // 5. Dual Xenon Projector Headlights
    [-0.8, 0.8].forEach(x => {
      const lampGeo = new THREE.BoxGeometry(0.38, 0.18, 0.3);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xe0f7fa });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(x, 0.62, -2.35);
      this.carBody.add(lamp);

      // Active SpotLight shining onto highway
      const spot = new THREE.SpotLight(0xffffff, 2.5, 45, Math.PI / 6, 0.45, 1.2);
      spot.position.set(x, 0.65, -2.4);
      const target = new THREE.Object3D();
      target.position.set(x * 0.4, 0, -28);
      this.car.add(target);
      spot.target = target;
      this.car.add(spot);
      this.headlights.push(spot);
    });

    // 6. Rear Carbon Diffuser & Quad Exhaust Pipes
    const diffuserGeo = new THREE.BoxGeometry(2.1, 0.25, 0.4);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, 0.38, 2.4);
    this.carBody.add(diffuser);

    [-0.65, -0.45, 0.45, 0.65].forEach(x => {
      const pipeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.35, 12);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, metalness: 0.95, roughness: 0.2 });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 0.36, 2.5);
      this.carBody.add(pipe);
      this.exhaustPipes.push(pipe);
    });

    // 7. Full-Width Glowing Red LED Taillight Bar
    const tailGeo = new THREE.BoxGeometry(2.0, 0.14, 0.1);
    this.tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e00 });
    const taillight = new THREE.Mesh(tailGeo, this.tailMat);
    taillight.position.set(0, 0.72, 2.42);
    this.carBody.add(taillight);

    // 8. Elevated GT Race Wing Spoiler
    const wingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.5);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.3, 2.1);
    wing.castShadow = true;
    [-0.7, 0.7].forEach(sx => {
      const pylonGeo = new THREE.BoxGeometry(0.06, 0.35, 0.15);
      const pylon = new THREE.Mesh(pylonGeo, carbonMat);
      pylon.position.set(sx, 1.12, 2.1);
      this.carBody.add(pylon);
    });
    this.carBody.add(wing);

    // 9. Snoo / Son Mascot Driver Avatar on Roof
    const mascot = new THREE.Group();
    const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    mHead.position.y = 1.62;
    const mAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0xff4500 }));
    mAntenna.position.set(0.06, 2.05, 0);
    mAntenna.rotation.z = 0.2;
    const mBulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
    mBulb.position.set(0.15, 2.22, 0);
    mascot.add(mHead, mAntenna, mBulb);
    this.carBody.add(mascot);

    // 10. Four Modeled Wheels with Rubber Tires and Chrome 5-Spoke Rims
    const wheelPositions = [
      { id: 'fl', x: -1.15, y: 0.42, z: -1.45 },
      { id: 'fr', x: 1.15, y: 0.42, z: -1.45 },
      { id: 'rl', x: -1.15, y: 0.42, z: 1.45 },
      { id: 'rr', x: 1.15, y: 0.42, z: 1.45 }
    ];

    const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 20);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.9 });
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.33, 10);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 0.95, roughness: 0.15 });
    const caliperGeo = new THREE.BoxGeometry(0.14, 0.18, 0.12);
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    wheelPositions.forEach(wp => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wp.x, wp.y, wp.z);

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(wp.x > 0 ? -0.1 : 0.1, 0.12, 0);
      wGroup.add(caliper);

      this.car.add(wGroup);
      this.wheels[wp.id] = wGroup;
    });

    // 11. Energy Shield Dome (Activates with Shield Powerup)
    const shieldGeo = new THREE.SphereGeometry(3.2, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.2;
    this.shieldMesh.visible = false;
    this.car.add(this.shieldMesh);

    this.car.position.set(0, 0, 0);
    this.scene.add(this.car);
  }

  // ===========================================================================
  // 4. PROCEDURAL 3D CITY HIGHWAY LEVEL DESIGN
  // ===========================================================================
  buildInitialCityHighway() {
    for (let i = 0; i < 18; i++) {
      this.spawnHighwaySegment(-i * 32);
    }
  }

  spawnHighwaySegment(zPos) {
    const seg = new THREE.Group();
    const segLen = 32;

    // 1. 4-Lane Asphalt Highway Roadbed
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, segLen);
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      roughness: 0.72,
      metalness: 0.15
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, zPos);
    road.receiveShadow = true;
    seg.add(road);

    // 2. Concrete Sidewalks and Curbs on Both Sides
    [-1, 1].forEach(side => {
      const swGeo = new THREE.BoxGeometry(4.5, 0.4, segLen);
      const swMat = new THREE.MeshStandardMaterial({
        map: this.sidewalkTex,
        roughness: 0.85
      });
      const sw = new THREE.Mesh(swGeo, swMat);
      sw.position.set(side * (this.roadWidth / 2 + 2.25), 0.2, zPos);
      sw.receiveShadow = true;
      seg.add(sw);

      // Galvanized Guardrail / Jersey Barrier
      const railGeo = new THREE.BoxGeometry(0.35, 0.75, segLen);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x718093, metalness: 0.8, roughness: 0.3 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(side * (this.roadWidth / 2 + 0.2), 0.4, zPos);
      rail.castShadow = true;
      seg.add(rail);
    });

    // 3. Realistic Curved Highway Streetlights (every 64 meters)
    if (Math.abs(zPos) % 64 === 0) {
      [-1, 1].forEach(side => {
        const pole = new THREE.Group();
        pole.position.set(side * (this.roadWidth / 2 + 1.8), 0, zPos);

        // Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 9, 8), new THREE.MeshStandardMaterial({ color: 0x576574, metalness: 0.9 }));
        mast.position.y = 4.5;
        mast.castShadow = true;

        // Curved Overhang
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.5, 8), new THREE.MeshStandardMaterial({ color: 0x576574, metalness: 0.9 }));
        arm.position.set(-side * 1.2, 8.8, 0);
        arm.rotation.z = side * Math.PI / 3.2;

        // Lamp Head
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
        lamp.position.set(-side * 2.2, 8.6, 0);

        // Actual SpotLight illuminating the highway
        const spot = new THREE.SpotLight(0xfff5cc, 1.8, 28, Math.PI / 4, 0.5, 1.4);
        spot.position.set(-side * 2.2, 8.5, 0);
        const tgt = new THREE.Object3D();
        tgt.position.set(-side * 2.2, 0, 0);
        pole.add(tgt);
        spot.target = tgt;

        pole.add(mast, arm, lamp, spot);
        seg.add(pole);
      });
    }

    // 4. Skyscraper High-Rises & Towers Flanking the Highway
    const heights = [32, 48, 62, 40, 55, 72];
    [-1, 1].forEach(side => {
      const bH = heights[Math.floor(Math.random() * heights.length)];
      const bW = 12 + Math.random() * 6;
      const bD = 24;
      const bGeo = new THREE.BoxGeometry(bW, bH, bD);

      const tex = this.buildingTexCache[Math.floor(Math.random() * this.buildingTexCache.length)];
      const bMat = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.35,
        roughness: 0.55
      });

      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(side * (this.roadWidth / 2 + 5 + bW / 2), bH / 2, zPos);
      building.castShadow = true;
      building.receiveShadow = true;
      seg.add(building);

      // Rooftop Details (AC Chiller + Aviation Beacon)
      const acGeo = new THREE.BoxGeometry(3, 1.8, 3);
      const ac = new THREE.Mesh(acGeo, new THREE.MeshStandardMaterial({ color: 0x485460 }));
      ac.position.set(side * (this.roadWidth / 2 + 5 + bW / 2), bH + 0.9, zPos);
      seg.add(ac);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      beacon.position.set(side * (this.roadWidth / 2 + 5 + bW / 2), bH + 2.5, zPos);
      seg.add(beacon);
    });

    // 5. Overhead Highway Billboard or Stunt Jump Ramp (every 96 meters)
    if (Math.abs(zPos) % 96 === 0 && Math.abs(zPos) > 32) {
      if (Math.random() < 0.6) {
        // Highway Overhead Billboard
        const gantry = new THREE.Group();
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 9), new THREE.MeshStandardMaterial({ color: 0x2f3542, metalness: 0.8 }));
        p1.position.set(-this.roadWidth / 2 - 1, 4.5, zPos);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 9), new THREE.MeshStandardMaterial({ color: 0x2f3542, metalness: 0.8 }));
        p2.position.set(this.roadWidth / 2 + 1, 4.5, zPos);

        const bbGeo = new THREE.BoxGeometry(this.roadWidth - 2, 3.8, 0.6);
        const bbTex = this.billboardTexCache[Math.floor(Math.random() * this.billboardTexCache.length)];
        const bbMat = new THREE.MeshBasicMaterial({ map: bbTex });
        const bb = new THREE.Mesh(bbGeo, bbMat);
        bb.position.set(0, 7.8, zPos);

        gantry.add(p1, p2, bb);
        seg.add(gantry);
      } else {
        // 3D Stunt Jump Ramp!
        this.spawnStuntRamp(zPos);
      }
    }

    this.scene.add(seg);
    this.trackSegments.push({ mesh: seg, z: zPos });

    // Populate Traffic and Collectibles on distant segments
    if (zPos < -40) {
      this.populateSegmentEntities(zPos);
    }
  }

  // ===========================================================================
  // 5. STUNT RAMPS & PROCEDURAL AI TRAFFIC (GTA HIGHWAY TRAFFIC)
  // ===========================================================================
  spawnStuntRamp(zPos) {
    const lanes = [-4.5, 0, 4.5];
    const rx = lanes[Math.floor(Math.random() * lanes.length)];

    const rampGroup = new THREE.Group();
    rampGroup.position.set(rx, 0, zPos);

    // Wedge Geometry (Extruded or angled Box)
    const rampGeo = new THREE.BoxGeometry(3.6, 0.8, 7.5);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      metalness: 0.85,
      roughness: 0.25
    });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.rotation.x = -0.22; // Incline angle
    ramp.position.set(0, 0.6, 0);
    ramp.castShadow = true;
    rampGroup.add(ramp);

    // Hazard Stripes on ramp lips
    const lip = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    lip.position.set(0, 1.4, -3.4);
    rampGroup.add(lip);

    rampGroup.userData = { type: 'ramp', bounds: 2.0 };
    this.scene.add(rampGroup);
    this.obstacles.push(rampGroup);
  }

  populateSegmentEntities(zPos) {
    const lanes = [-6.2, -2.1, 2.1, 6.2];
    const occupiedLanes = new Set();

    // 1. Procedural Traffic Vehicles (Cabs, SUVs, Police Cruisers)
    if (Math.random() < 0.65) {
      const tLane = lanes[Math.floor(Math.random() * lanes.length)];
      occupiedLanes.add(tLane);
      this.spawnTrafficCar(tLane, zPos);
    }

    // 2. Destructible Highway Props (Barrels, Cones, Downvotes)
    lanes.forEach(l => {
      if (!occupiedLanes.has(l) && Math.random() < 0.22) {
        occupiedLanes.add(l);
        this.spawnPropObstacle(l, zPos);
      }
    });

    // 3. Upvotes & Gold Reddit Medallions in Open Lanes
    lanes.forEach(l => {
      if (!occupiedLanes.has(l) && Math.random() < 0.5) {
        if (Math.random() < 0.18) {
          this.spawnPowerup(l, zPos);
        } else {
          this.spawnCollectible(l, zPos);
        }
      }
    });
  }

  spawnTrafficCar(x, z) {
    const trafficTypes = [
      { name: 'taxi', color: 0xf1c40f, speed: 28 },
      { name: 'suv', color: 0x1e272e, speed: 32 },
      { name: 'police', color: 0xffffff, speed: 38 }
    ];
    const tData = trafficTypes[Math.floor(Math.random() * trafficTypes.length)];

    const tCar = new THREE.Group();
    tCar.position.set(x, 0, z);

    // Car Body
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.65, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: tData.color,
      metalness: 0.75,
      roughness: 0.35
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    tCar.add(body);

    // Cabin
    const cabGeo = new THREE.BoxGeometry(1.6, 0.55, 2.2);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x111625, metalness: 0.9, roughness: 0.1 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.1, -0.2);
    tCar.add(cab);

    // Wheels
    [[-0.95, -1.3], [0.95, -1.3], [-0.95, 1.3], [0.95, 1.3]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
      );
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.36, wz);
      tCar.add(w);
    });

    // Special Liveries
    if (tData.name === 'police') {
      // Flashing Red & Blue Strobe Bar
      const sirenGeo = new THREE.BoxGeometry(0.8, 0.14, 0.2);
      const sirenMat = new THREE.MeshBasicMaterial({ color: 0x00a8ff });
      const siren = new THREE.Mesh(sirenGeo, sirenMat);
      siren.position.set(0, 1.45, -0.2);
      tCar.add(siren);
      tCar.userData.sirenMesh = siren;
    } else if (tData.name === 'taxi') {
      const roofSign = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.25), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      roofSign.position.set(0, 1.45, -0.2);
      tCar.add(roofSign);
    }

    tCar.userData = {
      type: 'traffic',
      subType: tData.name,
      speed: tData.speed,
      bounds: 1.6
    };

    this.scene.add(tCar);
    this.trafficCars.push(tCar);
  }

  spawnPropObstacle(x, z) {
    const prop = new THREE.Group();
    prop.position.set(x, 0, z);

    if (Math.random() < 0.5) {
      // Construction Barrel with reflective bands
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.3 })
      );
      barrel.position.y = 0.6;
      barrel.castShadow = true;
      prop.add(barrel);
      prop.userData = { type: 'barrel', bounds: 1.2 };
    } else {
      // Downvote Spike Monolith
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 1.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x7193ff, metalness: 0.8, roughness: 0.2 })
      );
      spike.rotation.y = Math.PI / 4;
      spike.position.y = 0.8;
      spike.castShadow = true;
      prop.add(spike);
      prop.userData = { type: 'spike', bounds: 1.2 };
    }

    this.scene.add(prop);
    this.obstacles.push(prop);
  }

  spawnCollectible(x, z) {
    const isGold = Math.random() < 0.35;
    let gem;

    if (isGold) {
      // 3D Spinning Reddit Gold Medallion
      const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 18);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x665500,
        emissiveIntensity: 0.35
      });
      gem = new THREE.Mesh(coinGeo, coinMat);
      gem.rotation.x = Math.PI / 2;
      gem.position.set(x, 1.2, z);
      gem.userData = { type: 'coin', value: 50 };
    } else {
      // Glowing Orange Upvote Octahedron Crystal
      const geo = new THREE.OctahedronGeometry(0.55);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff4500,
        emissiveIntensity: 0.5,
        roughness: 0.15
      });
      gem = new THREE.Mesh(geo, mat);
      gem.position.set(x, 1.2, z);
      gem.userData = { type: 'gem', value: 20 };
    }

    this.scene.add(gem);
    this.collectibles.push(gem);
  }

  spawnPowerup(x, z) {
    const types = ['nitro', 'shield', 'multiplier', 'magnet'];
    const pType = types[Math.floor(Math.random() * types.length)];
    const colors = { nitro: 0x00d2d3, shield: 0x54a0ff, multiplier: 0x1dd1a1, magnet: 0xfeca57 };

    const orb = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.65),
      new THREE.MeshStandardMaterial({
        color: colors[pType],
        emissive: colors[pType],
        emissiveIntensity: 0.55,
        roughness: 0.2
      })
    );
    orb.position.set(x, 1.4, z);
    orb.userData = { type: 'powerup', powerType: pType };
    this.scene.add(orb);
    this.collectibles.push(orb);
  }

  // ===========================================================================
  // 6. CONTROLS & EVENT BINDINGS
  // ===========================================================================
  setupController() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
      if (e.key === ' ' || e.code === 'Space') this.keys.handbrake = true;
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.nitro = true;
      if (e.key === 'c' || e.key === 'C') this.toggleCameraMode();
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      if (e.key === ' ' || e.code === 'Space') this.keys.handbrake = false;
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.nitro = false;
    });
  }

  toggleCameraMode() {
    const modes = ['chase', 'bumper', 'aerial'];
    const idx = modes.indexOf(this.cameraMode);
    this.cameraMode = modes[(idx + 1) % modes.length];
  }

  // Interface compatibility for touch buttons
  moveLane(dir) {
    this.posX += dir * 4.2;
    this.posX = Math.max(-this.roadWidth / 2 + 1.8, Math.min(this.roadWidth / 2 - 1.8, this.posX));
  }

  jump() {
    if (!this.isAirborne) {
      this.isAirborne = true;
      this.verticalVelocity = 14.5;
      if (this.sound) this.sound.stuntJump();
    }
  }

  slide() {
    // Triggers drift / handbrake
    this.keys.handbrake = true;
    setTimeout(() => { this.keys.handbrake = false; }, 400);
  }

  // ===========================================================================
  // 7. REALISTIC GTA VEHICLE & RIGID BODY PHYSICS SIMULATION
  // ===========================================================================
  updateVehiclePhysics(dt) {
    const dtSec = Math.min(dt, 0.05);

    // 1. Nitrous Oxide (NOS) Handling
    if (this.keys.nitro && this.nitroFuel > 0) {
      this.isBoosting = true;
      this.nitroFuel = Math.max(0, this.nitroFuel - this.nitroDrainRate * dtSec);
      this.targetFov = 78; // High-speed camera FOV warp
      this.spawnExhaustFlames();
    } else {
      this.isBoosting = false;
      this.nitroFuel = Math.min(100, this.nitroFuel + this.nitroRechargeRate * dtSec);
      this.targetFov = 65;
    }

    // 2. Acceleration, Braking & Speed Dynamics
    const effectiveTopSpeed = this.isBoosting ? this.boostSpeed : this.maxSpeed;
    const accelRate = this.isBoosting ? this.acceleration * 1.75 : this.acceleration;

    if (this.keys.up || this.isRunning) {
      // Auto-cruise with throttle input
      const throttleMult = this.keys.up ? 1.0 : 0.85;
      if (this.speed < effectiveTopSpeed) {
        this.speed += accelRate * throttleMult * dtSec;
      }
    }

    if (this.keys.down) {
      // Braking / Reverse
      this.speed -= this.braking * dtSec;
      if (this.speed < 12) this.speed = 12; // Min forward coasting speed
      if (this.tailMat) this.tailMat.color.setHex(0xff0033);
    } else {
      if (this.tailMat) this.tailMat.color.setHex(0xb31400);
    }

    // Air drag & rolling resistance
    this.speed *= Math.pow(this.drag, dtSec * 60);

    // 3. Transmission Gear & RPM Calculation
    const speedRatio = this.speed / this.maxSpeed;
    if (speedRatio < 0.18) this.gear = 1;
    else if (speedRatio < 0.38) this.gear = 2;
    else if (speedRatio < 0.58) this.gear = 3;
    else if (speedRatio < 0.78) this.gear = 4;
    else if (speedRatio < 0.95) this.gear = 5;
    else this.gear = 6;

    const gearRatio = ((speedRatio * 6) % 1);
    this.rpm = Math.floor(1200 + gearRatio * 6400);

    // Update Web Audio engine synthesizer
    if (this.sound && this.sound.isEngineRunning) {
      this.sound.updateEngine(this.rpm / 8000, this.isBoosting ? 1.0 : 0.6);
    }

    // 4. Steering, Lateral Handling & Drift Physics
    const steerSpeed = 22.0;
    let targetSteer = 0;
    if (this.keys.left) targetSteer = -0.42;
    if (this.keys.right) targetSteer = 0.42;

    this.steerAngle += (targetSteer - this.steerAngle) * 0.25;

    // Animate front wheel turning angle
    if (this.wheels.fl && this.wheels.fr) {
      this.wheels.fl.rotation.y = this.steerAngle;
      this.wheels.fr.rotation.y = this.steerAngle;
    }

    // Handbrake Drift Trigger
    if (this.keys.handbrake && Math.abs(this.steerAngle) > 0.08) {
      this.isDrifting = true;
      this.driftAngle = this.steerAngle * 1.8;
      this.driftMultiplier = Math.min(4.0, this.driftMultiplier + dtSec * 1.2);
      this.driftScore += Math.floor(this.speed * this.driftMultiplier * dtSec);
      this.spawnDriftSmoke();
      this.laySkidMarks();
      if (this.sound && Math.random() < 0.12) this.sound.driftScreech();
    } else {
      this.isDrifting = false;
      this.driftAngle *= 0.88;
      this.driftMultiplier = Math.max(1.0, this.driftMultiplier - dtSec * 2.0);
    }

    // Lateral displacement
    const lateralSpeed = (this.speed * 0.38 + 12) * dtSec;
    this.posX += (this.steerAngle + this.driftAngle * 0.5) * lateralSpeed;
    const maxX = this.roadWidth / 2 - 1.8;
    this.posX = Math.max(-maxX, Math.min(maxX, this.posX));

    // 5. Airborne Stunt Jump Physics (Ballistic Trajectory)
    if (this.isAirborne) {
      this.carAltitude += this.verticalVelocity * dtSec;
      this.verticalVelocity -= this.gravity * dtSec;

      // In-flight aerodynamics: pitch up initially, then level out and tip down
      this.pitchAngle = -this.verticalVelocity * 0.025;

      if (this.carAltitude <= 0) {
        // Landing Impact!
        this.carAltitude = 0;
        this.isAirborne = false;
        this.suspensionVelocity = -8.5; // Deep suspension compression
        this.cameraShake = 0.45;
        this.spawnSparks(this.car.position.x, 0.2, this.car.position.z);
        if (this.sound) this.sound.hit();
        this.score += 250 * this.scoreMultiplier; // Stunt bonus
      }
    } else {
      this.pitchAngle *= 0.82;
    }

    // 6. Realistic Suspension Springs (Roll & Pitch Harmonics)
    // Spring damping equation: F = -k*x - c*v
    const k = 140.0;
    const c = 12.0;
    const springForce = -k * this.suspensionOffset - c * this.suspensionVelocity;
    this.suspensionVelocity += springForce * dtSec;
    this.suspensionOffset += this.suspensionVelocity * dtSec;

    // Chassis body roll on cornering: rolls away from steering direction
    this.rollAngle = -(this.steerAngle + this.driftAngle) * 0.28;

    // Chassis pitch on acceleration / braking
    let accelPitch = 0;
    if (this.keys.up || this.isBoosting) accelPitch = -0.06;
    if (this.keys.down) accelPitch = 0.09;

    // Apply 6-DOF Transformations to 3D Car
    this.car.position.x = this.posX;
    this.car.position.y = this.carAltitude;
    this.car.rotation.y = -(this.steerAngle * 0.4 + this.driftAngle);

    if (this.carBody) {
      this.carBody.position.y = this.suspensionOffset;
      this.carBody.rotation.z = this.rollAngle;
      this.carBody.rotation.x = this.pitchAngle + accelPitch;
    }

    // Spin wheels proportional to speed
    const wheelRotDelta = (this.speed * dtSec) / 0.42;
    Object.values(this.wheels).forEach(w => {
      if (w) w.children[0].rotation.x += wheelRotDelta;
    });

    // Distance & Score progression
    this.distance += this.speed * dtSec;
    this.score += Math.floor(this.speed * 0.6 * this.scoreMultiplier);

    // Check Level Complete
    if (this.distance >= this.targetDistance) {
      this.isRunning = false;
      if (this.sound) {
        this.sound.stopEngine();
        this.sound.levelUp();
      }
      if (this.onLevelComplete) {
        this.onLevelComplete(this.level, this.score, this.coins);
      }
    }
  }

  // ===========================================================================
  // 8. WORLD UPDATES & PROCEDURAL RECYCLING
  // ===========================================================================
  updateWorld(dt) {
    const moveDist = this.speed * dt;

    // 1. Move Highway Track Segments towards camera
    this.trackSegments.forEach(seg => {
      seg.z += moveDist;
      seg.mesh.position.z = seg.z;

      // Recycle segment far behind camera
      if (seg.z > 40) {
        seg.z -= 18 * 32;
        seg.mesh.position.z = seg.z;
        this.populateSegmentEntities(seg.z);
      }
    });

    // 2. Move Procedural Traffic Vehicles
    for (let i = this.trafficCars.length - 1; i >= 0; i--) {
      const tc = this.trafficCars[i];
      // Traffic moves in same direction but at lower relative speed
      const relativeSpeed = this.speed - tc.userData.speed;
      tc.position.z += relativeSpeed * dt;

      // Strobe lights for police cars
      if (tc.userData.sirenMesh) {
        tc.userData.sirenMesh.material.color.setHex(Math.sin(performance.now() * 0.02) > 0 ? 0xff0033 : 0x0099ff);
      }

      if (tc.position.z > 35) {
        this.scene.remove(tc);
        this.trafficCars.splice(i, 1);
      }
    }

    // 3. Move Obstacles & Ramps
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.position.z += moveDist;

      if (obs.position.z > 35) {
        this.scene.remove(obs);
        this.obstacles.splice(i, 1);
      }
    }

    // 4. Move Collectibles & Magnet Attraction
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.position.z += moveDist;
      item.rotation.y += 0.04;

      // Magnet effect
      if (this.magnetTimer > 0) {
        const dx = this.car.position.x - item.position.x;
        const dz = this.car.position.z - item.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 18) {
          item.position.x += dx * 0.22;
          item.position.z += dz * 0.22;
        }
      }

      // Collect Detection
      const distToCar = Math.hypot(this.car.position.x - item.position.x, this.car.position.z - item.position.z);
      if (distToCar < 1.8 && Math.abs(this.car.position.y - item.position.y) < 2.0) {
        this.handleCollect(item);
        this.scene.remove(item);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (item.position.z > 35) {
        this.scene.remove(item);
        this.collectibles.splice(i, 1);
      }
    }

    // 5. Update Skid Marks Fade
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      const sm = this.skidMarks[i];
      sm.position.z += moveDist;
      sm.material.opacity *= 0.992;
      if (sm.position.z > 35 || sm.material.opacity < 0.02) {
        this.scene.remove(sm);
        this.skidMarks.splice(i, 1);
      }
    }

    // 6. Update Particle Systems (Smoke, Sparks, Boost Flames)
    this.updateParticles(dt, moveDist);
  }

  // ===========================================================================
  // 9. COLLISION DETECTION & IMPULSE DYNAMICS
  // ===========================================================================
  checkCollisions() {
    const cPos = this.car.position;

    // Check Ramp Stunt Jumps
    for (let obs of this.obstacles) {
      if (obs.userData && obs.userData.type === 'ramp') {
        const dx = Math.abs(obs.position.x - cPos.x);
        const dz = Math.abs(obs.position.z - cPos.z);
        if (dx < 1.9 && dz < 2.5 && !this.isAirborne) {
          this.isAirborne = true;
          this.verticalVelocity = 18.5; // Mega ballistic launch!
          this.cameraShake = 0.35;
          if (this.sound) this.sound.stuntJump();
          return;
        }
      }
    }

    // Check Traffic Collisions
    for (let tc of this.trafficCars) {
      const dx = Math.abs(tc.position.x - cPos.x);
      const dz = Math.abs(tc.position.z - cPos.z);

      if (dx < 1.7 && dz < 3.2 && cPos.y < 1.5) {
        if (this.hasShield) {
          // Shield blasts the traffic vehicle away!
          this.hasShield = false;
          this.shieldMesh.visible = false;
          tc.position.y = 12;
          tc.rotation.x = Math.PI;
          this.spawnSparks(cPos.x, 1.0, cPos.z);
          if (this.sound) this.sound.shield();
          return;
        }

        // Fatal Traffic Crash!
        this.handleCrash();
        return;
      }
    }

    // Check Props / Barriers
    for (let obs of this.obstacles) {
      if (obs.userData && obs.userData.type !== 'ramp') {
        const dx = Math.abs(obs.position.x - cPos.x);
        const dz = Math.abs(obs.position.z - cPos.z);

        if (dx < 1.5 && dz < 1.8 && cPos.y < 1.3) {
          if (this.hasShield) {
            this.hasShield = false;
            this.shieldMesh.visible = false;
            obs.position.z = 999;
            this.spawnSparks(cPos.x, 0.8, cPos.z);
            if (this.sound) this.sound.shield();
            return;
          }

          // Fatal Prop Crash
          this.handleCrash();
          return;
        }
      }
    }
  }

  handleCrash() {
    this.isRunning = false;
    this.cameraShake = 0.85;
    this.spawnSparks(this.car.position.x, 1.0, this.car.position.z);
    if (this.sound) {
      this.sound.stopEngine();
      this.sound.impactCrash();
      this.sound.defeat();
    }
    if (this.onGameOver) {
      this.onGameOver(this.score, this.coins, Math.floor(this.distance));
    }
  }

  handleCollect(item) {
    const data = item.userData;
    if (data.type === 'coin') {
      this.score += data.value * this.scoreMultiplier;
      this.coins += 2;
      if (this.sound) this.sound.award();
    } else if (data.type === 'gem') {
      this.score += data.value * this.scoreMultiplier;
      this.coins += 1;
      if (this.sound) this.sound.upvote();
    } else if (data.type === 'powerup') {
      if (data.powerType === 'shield') {
        this.hasShield = true;
        this.shieldMesh.visible = true;
        if (this.sound) this.sound.shield();
      } else if (data.powerType === 'nitro') {
        this.nitroFuel = 100;
        if (this.sound) this.sound.nitroBoost();
      } else if (data.powerType === 'multiplier') {
        this.multiplierTimer = 350;
        this.scoreMultiplier = 2;
        if (this.sound) this.sound.crit();
      } else if (data.powerType === 'magnet') {
        this.magnetTimer = 300;
        if (this.sound) this.sound.upvote();
      }
    }
  }

  // ===========================================================================
  // 10. PARTICLE FX: TIRE DRIFT SMOKE, NOS FLAMES, METALLIC SPARKS, SKID MARKS
  // ===========================================================================
  spawnDriftSmoke() {
    const puffGeo = new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 6, 6);
    const puffMat = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      transparent: true,
      opacity: 0.5
    });

    [-1.0, 1.0].forEach(sx => {
      const puff = new THREE.Mesh(puffGeo, puffMat);
      puff.position.set(this.car.position.x + sx, 0.35, this.car.position.z + 2.2);
      puff.userData = {
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.2 + Math.random() * 1.5,
        vz: 2.0 + Math.random() * 2.0,
        life: 1.0
      };
      this.scene.add(puff);
      this.smokeParticles.push(puff);
    });
  }

  laySkidMarks() {
    const skidGeo = new THREE.PlaneGeometry(0.32, 1.4);
    const skidMat = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });

    [-1.0, 1.0].forEach(sx => {
      const mark = new THREE.Mesh(skidGeo, skidMat);
      mark.rotation.x = -Math.PI / 2;
      mark.rotation.z = this.car.rotation.y;
      mark.position.set(this.car.position.x + sx, 0.02, this.car.position.z + 1.8);
      this.scene.add(mark);
      this.skidMarks.push(mark);
    });
  }

  spawnExhaustFlames() {
    const flameGeo = new THREE.ConeGeometry(0.12, 0.6, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3 }); // Intense cyan NOS flame

    [-0.55, 0.55].forEach(sx => {
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(this.car.position.x + sx, 0.36, this.car.position.z + 2.7);
      flame.userData = { life: 0.12 };
      this.scene.add(flame);
      this.exhaustFlameParticles.push(flame);
    });
  }

  spawnSparks(x, y, z) {
    for (let i = 0; i < 24; i++) {
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xffcc00 })
      );
      spark.position.set(x, y, z);
      spark.userData = {
        vx: (Math.random() - 0.5) * 18,
        vy: Math.random() * 14 + 4,
        vz: (Math.random() - 0.5) * 18,
        life: 0.6
      };
      this.scene.add(spark);
      this.sparkParticles.push(spark);
    }
  }

  updateParticles(dt, moveDist) {
    // 1. Smoke
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.userData.life -= dt * 1.8;
      p.position.x += p.userData.vx * dt;
      p.position.y += p.userData.vy * dt;
      p.position.z += (p.userData.vz + this.speed * 0.3) * dt;
      p.scale.multiplyScalar(1.05);
      p.material.opacity = p.userData.life * 0.45;

      if (p.userData.life <= 0) {
        this.scene.remove(p);
        this.smokeParticles.splice(i, 1);
      }
    }

    // 2. Exhaust Flames
    for (let i = this.exhaustFlameParticles.length - 1; i >= 0; i--) {
      const f = this.exhaustFlameParticles[i];
      f.userData.life -= dt;
      if (f.userData.life <= 0) {
        this.scene.remove(f);
        this.exhaustFlameParticles.splice(i, 1);
      }
    }

    // 3. Sparks
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const s = this.sparkParticles[i];
      s.userData.life -= dt;
      s.position.x += s.userData.vx * dt;
      s.position.y += s.userData.vy * dt;
      s.position.z += s.userData.vz * dt;
      s.userData.vy -= 30 * dt; // Gravity on sparks

      if (s.userData.life <= 0) {
        this.scene.remove(s);
        this.sparkParticles.splice(i, 1);
      }
    }
  }

  // ===========================================================================
  // 11. DYNAMIC GTA THIRD-PERSON CAMERA & CINEMATICS
  // ===========================================================================
  updateCamera(dt) {
    // Dynamic FOV interpolation
    this.camera.fov += (this.targetFov - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();

    // Camera trauma decay
    this.cameraShake *= 0.92;
    const shakeX = (Math.random() - 0.5) * this.cameraShake * 1.2;
    const shakeY = (Math.random() - 0.5) * this.cameraShake * 1.2;

    if (this.cameraMode === 'chase') {
      // Classic GTA Dynamic Follow View
      const speedRatio = this.speed / this.maxSpeed;
      const targetCamZ = 8.5 + speedRatio * 3.5;
      const targetCamY = 3.6 + this.carAltitude * 0.4;
      const targetCamX = this.car.position.x * 0.65;

      this.camera.position.x += (targetCamX + shakeX - this.camera.position.x) * 0.15;
      this.camera.position.y += (targetCamY + shakeY - this.camera.position.y) * 0.15;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.15;

      // Look slightly ahead of car
      this.camera.lookAt(this.car.position.x * 0.9, 1.4 + this.carAltitude * 0.8, -14);

    } else if (this.cameraMode === 'bumper') {
      // High-speed hood/bumper camera
      this.camera.position.set(this.car.position.x + shakeX, 1.0 + this.carAltitude + shakeY, -2.2);
      this.camera.lookAt(this.car.position.x, 1.0 + this.carAltitude, -35);

    } else if (this.cameraMode === 'aerial') {
      // Drone pursuit camera
      this.camera.position.set(this.car.position.x * 0.4 + shakeX, 18.0 + shakeY, 14.0);
      this.camera.lookAt(this.car.position.x, 1.2, -18);
    }
  }

  // ===========================================================================
  // 12. GAME LOOP & LIFECYCLE
  // ===========================================================================
  start(level = 1) {
    this.level = level;
    this.targetDistance = 250 + level * 65;
    this.maxSpeed = 68 + Math.min(30, (level - 1) * 0.8);
    this.speed = 22; // Initial rolling launch
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.posX = 0;
    this.carAltitude = 0;
    this.isAirborne = false;
    this.hasShield = false;
    this.shieldMesh.visible = false;
    this.nitroFuel = 100;

    this.isRunning = true;
    this.lastTime = performance.now();

    if (this.sound) {
      this.sound.startEngine();
    }

    this.animate();
  }

  pause() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.sound) this.sound.stopEngine();
  }

  animate() {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.updateVehiclePhysics(dt);
    this.updateWorld(dt);
    this.checkCollisions();
    this.updateCamera(dt);

    // Timers
    if (this.magnetTimer > 0) this.magnetTimer--;
    if (this.multiplierTimer > 0) {
      this.multiplierTimer--;
      if (this.multiplierTimer <= 0) this.scoreMultiplier = 1;
    }

    // Update HUD Callback with GTA telemetry
    if (this.onScoreUpdate) {
      this.onScoreUpdate({
        score: this.score,
        coins: this.coins,
        distance: Math.floor(this.distance),
        level: this.level,
        targetDistance: this.targetDistance,
        hasShield: this.hasShield,
        multiplier: this.scoreMultiplier,
        speedMph: Math.floor(this.speed * 1.8),
        gear: this.gear,
        rpm: this.rpm,
        nitroPercent: Math.floor(this.nitroFuel),
        isDrifting: this.isDrifting,
        driftMult: this.driftMultiplier.toFixed(1),
        cameraMode: this.cameraMode
      });
    }

    this.renderer.render(this.scene, this.camera);
    this.animId = requestAnimationFrame(() => this.animate());
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.sound) this.sound.stopEngine();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
    }
  }
}
