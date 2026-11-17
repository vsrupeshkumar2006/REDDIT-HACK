/**
 * ONLYSONS: Expansive 5-Biome Open World, Forza-Grade Automotive & Character Engine
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Master Architecture:
 *  - 5 Seamless Interconnected Biomes (400m x 400m Open Landscape):
 *      1. Cyber City & Rashid's Performance Garage (Skyscrapers, neon signage, dyno lift, family hub)
 *      2. Grasslands & Rolling Hills (Lush vegetation, pine trees, rustic fences, dirt trails)
 *      3. Desert Dunes & Abandoned Outpost (Sand dunes, reduced traction, dust particles, rusty containers)
 *      4. Mountain Canyon Pass & Tunnels (Towering peaks, winding hairpin roads, illuminated tunnel)
 *      5. Ancient Lost Empires & Ruins (Monolithic stone temples, monumental gates, ruined pillars, secret vault)
 *  - Seamless Dual Exploration:
 *      - On-Foot: Ayaan Malik (Human), Full Android (Unit-07), or Hybrid with full procedural animations
 *      - Driving: Forza-grade Supercar with 4-wheel independent raycast suspension, Ackermann steering,
 *        6 gears, RPM audio, NOS boost, drift physics, and 5 Camera Modes (Chase, Cockpit, Hood, Cinematic, Free)
 *      - Press [F] to seamlessly Enter/Exit car!
 *      - Press [C] to cycle Camera Modes!
 *      - Press [E] to interact with Pavilions, Rashid's Garage, or Robot Citizens!
 */

import { VehicleDynamics } from './vehicleDynamics.js';
import { CharacterController } from './characterController.js';

export class OpenWorld3D {
  constructor(containerId, onInteractWithZone, onStatsUpdate, soundEngine = null) {
    this.container = document.getElementById(containerId);
    this.onInteract = onInteractWithZone;
    this.onStatsUpdate = onStatsUpdate;
    this.sound = soundEngine;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;

    // Subsystems
    this.vehicle = null;
    this.character = null;
    this.isDriving = false;

    // Key Input State
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      handbrake: false,
      nitro: false
    };

    // 5 District Pavilions (Preserved & Enhanced)
    this.districts = [
      { id: 'rashid_garage', name: "Father Rashid's Performance Garage", emoji: '🔧', x: -16, z: 16, radius: 12, color: 0xff4500, type: 'spy_garage' },
      { id: 'wizard', name: "Son I: Mod Wizard's Arcane Spire", emoji: '🧙‍♂️', x: -45, z: -45, radius: 14, color: 0x9b59b6, type: 'tarot_limbo' },
      { id: 'cat', name: "Son II: Chaos Cat's Cyber Alley", emoji: '🐈', x: 45, z: -45, radius: 14, color: 0x3498db, type: 'mines_chicken' },
      { id: 'doge', name: "Son III: Wholesome Doge Plaza", emoji: '🐕', x: -45, z: 45, radius: 14, color: 0xf1c40f, type: 'plinko_dice' },
      { id: 'ape', name: "Son IV: WSB Ape Stock Exchange", emoji: '🦍', x: 45, z: 45, radius: 14, color: 0x2ecc71, type: 'crash_keno' },
      { id: 'capy', name: "Son V: Zen Capybara Central Vault", emoji: '🦫', x: 0, z: -65, radius: 16, color: 0xe67e22, type: 'council_fintech' }
    ];

    // Biome Metadata
    this.biomes = [
      { name: "Cyber City & Plaza", xRange: [-75, 75], zRange: [-75, 75], surface: "asphalt", grip: 0.95 },
      { name: "Grasslands & Hills", xRange: [-200, -75], zRange: [-200, -75], surface: "grass", grip: 0.82 },
      { name: "Desert Dunes", xRange: [-200, -75], zRange: [75, 200], surface: "sand", grip: 0.65 },
      { name: "Mountain Canyon Pass", xRange: [75, 200], zRange: [-200, -75], surface: "asphalt_mountain", grip: 0.88 },
      { name: "Ancient Lost Empires", xRange: [75, 200], zRange: [75, 200], surface: "stone_ruins", grip: 0.85 }
    ];

    this.activeZone = null;
    this.currentBiome = "Cyber City & Plaza";
    this.promptMessage = "";
    this.lastTime = performance.now();
  }

  // ===========================================================================
  // 1. INITIALIZATION & SCENE SETUP
  // ===========================================================================
  init() {
    if (!this.container || typeof THREE === 'undefined') return;

    const width = this.container.clientWidth || 920;
    const height = this.container.clientHeight || 580;

    // 1. Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c121d);
    this.scene.fog = new THREE.FogExp2(0x0e1524, 0.0055);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 550);
    this.camera.position.set(0, 10, 18);

    // 3. Renderer with Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xfff0dd, 0x111625, 0.95);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 1.4);
    sunLight.position.set(65, 120, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 380;
    sunLight.shadow.camera.left = -140;
    sunLight.shadow.camera.right = 140;
    sunLight.shadow.camera.top = 140;
    sunLight.shadow.camera.bottom = -140;
    this.scene.add(sunLight);

    // 5. Build Interconnected 5 Biomes
    this.buildTerrainLandscape();
    this.buildRoadNetwork();
    this.buildRashidGarage();
    this.buildDistrictPavilions();
    this.buildGrasslandsBiome();
    this.buildDesertBiome();
    this.buildMountainBiome();
    this.buildAncientEmpiresBiome();
    this.createBrainrotBillboards();
    this.spawnRobotPatrols();

    // 6. Spawn Vehicle & Character
    this.vehicle = new VehicleDynamics(this.scene, this.sound);
    this.vehicle.pos.x = -8;
    this.vehicle.pos.z = 12;
    this.vehicle.heading = Math.PI * 0.15;

    this.character = new CharacterController(this.scene);
    this.character.pos.x = -12;
    this.character.pos.z = 14;

    // Start in on-foot mode right outside Rashid's Garage
    this.isDriving = false;

    // 7. Input Controls
    this.setupControls();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  // ===========================================================================
  // 2. PROCEDURAL TERRAIN & BIOMES
  // ===========================================================================
  getTerrainHeight(x, z) {
    // Cyber City Plaza is flat at y = 0
    if (Math.abs(x) < 70 && Math.abs(z) < 70) {
      return 0;
    }
    // Mountain Region (x > 75, z < -75): high rolling peaks
    if (x > 70 && z < -70) {
      const dist = Math.hypot(x - 130, z + 130);
      return Math.max(0, 16 - dist * 0.12 + Math.sin(x * 0.08) * 3.5);
    }
    // Grasslands (x < -70, z < -70): gentle rolling hills
    if (x < -70 && z < -70) {
      return Math.sin(x * 0.05) * 2.2 + Math.cos(z * 0.05) * 2.2;
    }
    // Desert Dunes (x < -70, z > 70): smooth rolling dunes
    if (x < -70 && z > 70) {
      return Math.sin(x * 0.04 + z * 0.04) * 3.0;
    }
    // Ancient Ruins (x > 70, z > 70): stone terraces
    if (x > 70 && z > 70) {
      return Math.max(0, Math.sin(x * 0.06) * 1.8);
    }
    return 0;
  }

  buildTerrainLandscape() {
    // Massive 400x400m Master Terrain Plane
    const groundGeo = new THREE.PlaneGeometry(420, 420, 64, 64);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const h = this.getTerrainHeight(vx, -vy);
      posAttr.setZ(i, h);
    }
    groundGeo.computeVertexNormals();

    // Procedural multi-texture shader simulator via CanvasTexture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 4 quadrants representing biomes
    // Center & Streets: Dark Slate Asphalt
    ctx.fillStyle = '#111722';
    ctx.fillRect(0, 0, 1024, 1024);

    // North-West: Grasslands Green
    ctx.fillStyle = '#1c3b24';
    ctx.fillRect(0, 0, 420, 420);

    // North-East: Mountain Rocky Gray
    ctx.fillStyle = '#2d333b';
    ctx.fillRect(600, 0, 424, 420);

    // South-West: Desert Sand Amber
    ctx.fillStyle = '#7a5a29';
    ctx.fillRect(0, 600, 420, 424);

    // South-East: Ancient Ruins Sandstone
    ctx.fillStyle = '#544234';
    ctx.fillRect(600, 600, 424, 424);

    // Cyber Plaza Center Glowing Ring
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(512, 512, 140, 0, Math.PI * 2);
    ctx.stroke();

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.75,
      metalness: 0.15
    });

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
  }

  buildRoadNetwork() {
    // 4 Main Arterial Paved Highways connecting Cyber City to all 4 outlying biomes
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x161b24, roughness: 0.5 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5b000 });

    const roadLength = 160;
    const roadWidth = 14;

    // North, South, East, West Highway Spines
    const roadConfigs = [
      { x: 0, z: -110, w: roadWidth, l: roadLength, rot: 0 },
      { x: 0, z: 110, w: roadWidth, l: roadLength, rot: 0 },
      { x: -110, z: 0, w: roadLength, l: roadWidth, rot: 0 },
      { x: 110, z: 0, w: roadLength, l: roadWidth, rot: 0 }
    ];

    roadConfigs.forEach(rc => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(rc.w, rc.l), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(rc.x, 0.05, rc.z);
      road.receiveShadow = true;
      this.scene.add(road);

      // Yellow Center Divider Line
      const line = new THREE.Mesh(new THREE.PlaneGeometry(rc.w > rc.l ? rc.w : 0.4, rc.l > rc.w ? rc.l : 0.4), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(rc.x, 0.06, rc.z);
      this.scene.add(line);
    });
  }

  // ===========================================================================
  // 3. RASHID'S PERFORMANCE GARAGE (FAMILY HUB)
  // ===========================================================================
  buildRashidGarage() {
    const garageGroup = new THREE.Group();
    garageGroup.position.set(-16, 0, 16);

    // Garage Main Workshop Building
    const buildingGeo = new THREE.BoxGeometry(22, 9, 18);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.4, roughness: 0.6 });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.y = 4.5;
    building.castShadow = true;
    building.receiveShadow = true;
    garageGroup.add(building);

    // Open Bay Workshop Rollup Door
    const doorGeo = new THREE.PlaneGeometry(12, 6.5);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x0f141a });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 3.25, 9.02);
    garageGroup.add(door);

    // Glowing Neon Signboard: "MALIK PERFORMANCE GARAGE"
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#0a0d14';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#ff4500';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 504, 120);
    sCtx.fillStyle = '#ff4500';
    sCtx.font = 'bold 30px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('MALIK PERFORMANCE GARAGE', 256, 52);
    sCtx.fillStyle = '#00d2d3';
    sCtx.font = 'bold 18px monospace';
    sCtx.fillText('DYNO TUNING • UNDERCOVER HQ • [E] TALK', 256, 92);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: signTex }));
    signMesh.position.set(0, 7.5, 9.05);
    garageGroup.add(signMesh);

    // Interactive Hologram Beacon
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 3.5),
      new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.7 })
    );
    beacon.position.set(0, 2.0, 10.5);
    garageGroup.add(beacon);

    // Realistic Human NPCs at Rashid's Garage (Father Rashid, Sister Zara, Brother Hamza)
    this.createFamilyNpc(garageGroup, 'rashid', -4, 10.5, 0x3d434d, '🔧 Wrench');
    this.createFamilyNpc(garageGroup, 'zara', 4, 10.5, 0x1e272e, '📷 Camera');
    this.createFamilyNpc(garageGroup, 'hamza', 6, 8.5, 0x2c3e50, '🎮 Drone Remote');

    this.scene.add(garageGroup);
  }

  createFamilyNpc(parentGroup, preset, x, z, outfitColor, propType) {
    const npcGroup = new THREE.Group();
    npcGroup.position.set(x, 0, z);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb47e56, roughness: 0.6 });
    const clothMat = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.7 });

    // 1. Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.88, 0.42), clothMat);
    torso.position.y = 1.34;
    torso.castShadow = true;
    npcGroup.add(torso);

    // 2. Neck & Anatomical Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12), skinMat);
    neck.position.y = 0.52;
    torso.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.92;

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 16), skinMat);
    cranium.scale.set(0.88, 1.05, 0.96);
    headGroup.add(cranium);

    // Real Human Face Texture Generator for NPC
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dermal base & features
    const skinGrad = ctx.createRadialGradient(256, 240, 50, 256, 256, 260);
    skinGrad.addColorStop(0, '#cb9168');
    skinGrad.addColorStop(0.7, '#b47e56');
    skinGrad.addColorStop(1, '#96633e');
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Eye sockets & Eyes
    [-75, 75].forEach(ex => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(256 + ex, 220, 32, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a2211';
      ctx.beginPath(); ctx.arc(256 + ex, 220, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#050505';
      ctx.beginPath(); ctx.arc(256 + ex, 220, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(256 + ex - 3, 217, 2.5, 0, Math.PI * 2); ctx.fill();
      // Brow
      ctx.strokeStyle = '#18120e';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(256 + ex - 36, 185); ctx.lineTo(256 + ex + 36, 185); ctx.stroke();
    });

    // Nose & Lips
    ctx.fillStyle = 'rgba(180, 80, 60, 0.3)';
    ctx.beginPath(); ctx.arc(256, 305, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e1008';
    ctx.beginPath(); ctx.ellipse(240, 312, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(272, 312, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8e4b3c';
    ctx.beginPath(); ctx.ellipse(256, 360, 42, 14, 0, 0, Math.PI * 2); ctx.fill();

    // Beard for Father Rashid
    if (preset === 'rashid') {
      ctx.fillStyle = '#4a4646';
      ctx.beginPath();
      ctx.moveTo(140, 310);
      ctx.quadraticCurveTo(256, 490, 372, 310);
      ctx.quadraticCurveTo(256, 390, 140, 310);
      ctx.fill();
    }

    const faceTex = new THREE.CanvasTexture(canvas);
    const facePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.58),
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 })
    );
    facePlane.position.set(0, 0.02, -0.27);
    facePlane.rotation.y = Math.PI;
    headGroup.add(facePlane);

    // 3D Nose & Ears
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), skinMat);
    nose.position.set(0, 0.02, -0.31);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    [-0.28, 0.28].forEach(earX => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.07), skinMat);
      ear.position.set(earX, 0.02, -0.02);
      headGroup.add(ear);
    });

    // 3D Hair
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.16, 0.52),
      new THREE.MeshStandardMaterial({ color: preset === 'rashid' ? 0x444242 : 0x110f0f, roughness: 0.85 })
    );
    hair.position.set(0, 0.26, -0.02);
    headGroup.add(hair);

    torso.add(headGroup);

    // 3. Arms & Legs
    [-0.44, 0.44].forEach(ax => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.62, 10), clothMat);
      arm.position.set(ax, -0.25, 0);
      torso.add(arm);
    });

    [-0.18, 0.18].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.78, 10), new THREE.MeshStandardMaterial({ color: 0x1a212d }));
      leg.position.set(lx, 0.44, 0);
      npcGroup.add(leg);
    });

    // Prop
    if (preset === 'rashid') {
      const wrench = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.07), new THREE.MeshStandardMaterial({ color: 0xdcdde1, metalness: 0.9 }));
      wrench.position.set(0.44, 1.0, 0.22);
      wrench.rotation.z = 0.4;
      npcGroup.add(wrench);
    }

    parentGroup.add(npcGroup);
  }

  // ===========================================================================
  // 4. DISTRICT PAVILIONS (FIVE BROTHERS)
  // ===========================================================================
  buildDistrictPavilions() {
    this.districts.forEach(d => {
      if (d.id === 'rashid_garage') return; // Handled separately

      const group = new THREE.Group();
      group.position.set(d.x, 0, d.z);

      // Pavilion Base Dais
      const dais = new THREE.Mesh(
        new THREE.CylinderGeometry(d.radius * 0.85, d.radius, 1.2, 32),
        new THREE.MeshStandardMaterial({ color: 0x16202c, metalness: 0.8, roughness: 0.2 })
      );
      dais.position.y = 0.6;
      dais.receiveShadow = true;
      group.add(dais);

      // Glowing Neon Energy Ring around Dais
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(d.radius * 0.88, 0.25, 16, 64),
        new THREE.MeshBasicMaterial({ color: d.color })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.25;
      group.add(ring);

      // Unique Monuments per Brother
      if (d.id === 'wizard') {
        const tower = new THREE.Mesh(new THREE.ConeGeometry(3.5, 24, 6), new THREE.MeshStandardMaterial({ color: 0x4a235a, metalness: 0.85 }));
        tower.position.y = 12;
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.8), new THREE.MeshBasicMaterial({ color: 0x9b59b6, wireframe: true }));
        crystal.position.y = 26;
        group.add(tower, crystal);
      } else if (d.id === 'cat') {
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 4), new THREE.MeshStandardMaterial({ color: 0x1a252f, metalness: 0.8 }));
        b1.position.set(-4, 9, 0);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 4), new THREE.MeshStandardMaterial({ color: 0x1a252f, metalness: 0.8 }));
        b2.position.set(4, 9, 0);
        group.add(b1, b2);
      } else if (d.id === 'doge') {
        const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 14, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0x7d6608, metalness: 0.9, side: THREE.DoubleSide }));
        rotunda.position.y = 7;
        group.add(rotunda);
      } else if (d.id === 'ape') {
        const gantry = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.5, 22, 8), new THREE.MeshStandardMaterial({ color: 0x1e8449, metalness: 0.8 }));
        gantry.position.y = 11;
        const rocket = new THREE.Mesh(new THREE.ConeGeometry(1.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 }));
        rocket.position.y = 24;
        group.add(gantry, rocket);
      } else if (d.id === 'capy') {
        const citadel = new THREE.Mesh(new THREE.BoxGeometry(16, 14, 12), new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.7 }));
        citadel.position.y = 7;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe67e22, wireframe: true }));
        dome.position.y = 15;
        group.add(citadel, dome);
      }

      // Interactive Holographic Beacon
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 4.5),
        new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.8 })
      );
      beacon.position.set(0, 3.5, d.radius * 0.75);
      group.add(beacon);

      this.scene.add(group);
    });
  }

  // ===========================================================================
  // 5. BIOME GENERATION: GRASSLANDS, DESERT, MOUNTAINS, RUINS
  // ===========================================================================
  buildGrasslandsBiome() {
    const group = new THREE.Group();
    group.position.set(-135, 0, -135);

    // Procedural Pine Trees
    for (let i = 0; i < 24; i++) {
      const tx = (Math.random() - 0.5) * 85;
      const tz = (Math.random() - 0.5) * 85;

      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.0), new THREE.MeshStandardMaterial({ color: 0x4a2f13 }));
      trunk.position.y = 1.5;

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6.0, 7), new THREE.MeshStandardMaterial({ color: 0x194d23 }));
      foliage.position.y = 5.2;

      tree.add(trunk, foliage);
      group.add(tree);
    }
    this.scene.add(group);
  }

  buildDesertBiome() {
    const group = new THREE.Group();
    group.position.set(-135, 0, 135);

    // Sand Dunes Formations
    for (let i = 0; i < 6; i++) {
      const dune = new THREE.Mesh(
        new THREE.SphereGeometry(18, 16, 8),
        new THREE.MeshStandardMaterial({ color: 0xc29b38, roughness: 0.9 })
      );
      dune.scale.set(1.6, 0.35, 2.2);
      dune.position.set((i % 3) * 35 - 35, 2, Math.floor(i / 3) * 45 - 20);
      group.add(dune);
    }

    // Abandoned Rusty Shipping Containers
    const containerMat = new THREE.MeshStandardMaterial({ color: 0x8b3a2b, roughness: 0.8 });
    [-15, 15].forEach(cx => {
      const cont = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 14), containerMat);
      cont.position.set(cx, 1.5, 0);
      cont.rotation.y = 0.3;
      group.add(cont);
    });

    this.scene.add(group);
  }

  buildMountainBiome() {
    const group = new THREE.Group();
    group.position.set(135, 0, -135);

    // Towering Rock Peaks
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x47515d, roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
      const rock = new THREE.Mesh(new THREE.ConeGeometry(18 + i * 4, 38 + i * 5, 6), rockMat);
      rock.position.set((i % 3) * 45 - 45, 18, Math.floor(i / 3) * 55 - 25);
      group.add(rock);
    }

    // Illuminated Mountain Tunnel
    const tunnelGeo = new THREE.CylinderGeometry(8, 8, 38, 16, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x22262c, side: THREE.DoubleSide });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.position.set(0, 4, 0);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = Math.PI / 4;
    group.add(tunnel);

    this.scene.add(group);
  }

  buildAncientEmpiresBiome() {
    const group = new THREE.Group();
    group.position.set(135, 0, 135);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.85 });

    // Monumental Ancient Stone Temple
    const templeBase = new THREE.Mesh(new THREE.BoxGeometry(32, 4, 28), stoneMat);
    templeBase.position.y = 2;
    group.add(templeBase);

    // Ruined Pillars
    for (let px = -12; px <= 12; px += 8) {
      for (let pz = -10; pz <= 10; pz += 10) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 10, 12), stoneMat);
        pillar.position.set(px, 7, pz);
        group.add(pillar);
      }
    }

    // Monolithic Temple Archway
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(30, 2, 6), stoneMat);
    archTop.position.set(0, 12.5, 0);
    group.add(archTop);

    this.scene.add(group);
  }

  createBrainrotBillboards() {
    const billboardMetas = [
      { text: "GIGA DOGE: 1000 IQ KARMA", color: "#ffd700", x: -60, z: 0, rotY: Math.PI / 2 },
      { text: "SKIBIDI AUTOMOD: BANNED!", color: "#ff4500", x: 60, z: 0, rotY: -Math.PI / 2 },
      { text: "DIAMOND HANDS TO THE MOON", color: "#00d2d3", x: 0, z: 65, rotY: Math.PI },
      { text: "ONLYSONS SAGA: PATRIARCH PRIME", color: "#9b59b6", x: 0, z: -70, rotY: 0 }
    ];

    billboardMetas.forEach(b => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 512;
      bCanvas.height = 256;
      const ctx = bCanvas.getContext('2d');

      ctx.fillStyle = '#0a0e14';
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 500, 244);

      ctx.fillStyle = b.color;
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, 256, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText("LIVE DYNASTY SURVEILLANCE FEED", 256, 165);

      const bTex = new THREE.CanvasTexture(bCanvas);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), new THREE.MeshBasicMaterial({ map: bTex, side: THREE.DoubleSide }));
      mesh.position.set(b.x, 14, b.z);
      mesh.rotation.y = b.rotY;
      this.scene.add(mesh);
    });
  }

  spawnRobotPatrols() {
    // Intelligent Robot Security Patrols roaming the plaza
    this.robots = [];
    const robotPositions = [
      { x: 12, z: -12, patrolRadius: 18 },
      { x: -25, z: -15, patrolRadius: 15 },
      { x: 22, z: 25, patrolRadius: 20 }
    ];

    robotPositions.forEach((rp, idx) => {
      const rGroup = new THREE.Group();
      rGroup.position.set(rp.x, 0, rp.z);

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 1.6, 12), new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.85 }));
      body.position.y = 1.0;

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f7ff }));
      eye.position.set(0, 1.45, 0.4);

      // Detection Scan Cone
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 7.0, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x00f7ff, wireframe: true, transparent: true, opacity: 0.15 })
      );
      cone.position.set(0, 0.8, 3.5);
      cone.rotation.x = Math.PI / 2;

      rGroup.add(body, eye, cone);
      this.scene.add(rGroup);
      this.robots.push({ group: rGroup, base: rp, angle: idx * 2.0 });
    });
  }

  // ===========================================================================
  // 6. CONTROLS & SEAMLESS VEHICLE ENTER / EXIT
  // ===========================================================================
  setupControls() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') this.keys.forward = true;
      if (key === 's' || e.key === 'ArrowDown') this.keys.backward = true;
      if (key === 'a' || e.key === 'ArrowLeft') this.keys.left = true;
      if (key === 'd' || e.key === 'ArrowRight') this.keys.right = true;
      if (e.key === ' ' || e.code === 'Space') {
        if (this.isDriving) this.keys.handbrake = true;
        else this.keys.jump = true;
      }
      if (e.key === 'Shift') {
        this.keys.sprint = true;
        this.keys.nitro = true;
      }
      // [F] Key: Toggle Vehicle Enter / Exit
      if (key === 'f') {
        this.toggleVehicleState();
      }
      // [C] Key: Cycle Camera Mode (Chase, Cockpit, Hood, Cinematic, Free)
      if (key === 'c' && this.isDriving && this.vehicle) {
        this.vehicle.cycleCameraMode();
      }
      // [E] Key: Trigger District / Zone Interaction
      if (key === 'e') {
        this.triggerInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') this.keys.forward = false;
      if (key === 's' || e.key === 'ArrowDown') this.keys.backward = false;
      if (key === 'a' || e.key === 'ArrowLeft') this.keys.left = false;
      if (key === 'd' || e.key === 'ArrowRight') this.keys.right = false;
      if (e.key === ' ' || e.code === 'Space') {
        this.keys.handbrake = false;
        this.keys.jump = false;
      }
      if (e.key === 'Shift') {
        this.keys.sprint = false;
        this.keys.nitro = false;
      }
    });
  }

  toggleVehicleState() {
    if (this.isDriving) {
      // Exit Vehicle to On-Foot
      this.isDriving = false;
      if (this.character) {
        this.character.exitVehicle();
      }
      if (this.vehicle) {
        this.vehicle.setInputs({ throttle: 0, brake: 1.0, steer: 0, handbrake: true, nitro: false });
      }
      this.promptMessage = "Stepped out on foot. [F] to enter car.";
    } else {
      // Try to Enter Vehicle
      if (this.character && this.vehicle && this.character.canEnterVehicle(this.vehicle)) {
        this.isDriving = true;
        this.character.enterVehicle(this.vehicle);
        this.promptMessage = "Driving Forza GT. [W] Accelerate, [S] Brake/Rev, [A/D] Steer, [Space] Drift, [Shift] NOS, [C] Camera, [F] Exit.";
      }
    }
  }

  triggerInteraction() {
    if (this.activeZone && this.onInteract) {
      this.onInteract(this.activeZone);
    }
  }

  // ===========================================================================
  // 7. GAME LOOP & STATE DISPATCH
  // ===========================================================================
  animate() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    // A. Update Active Controller (Driving vs On-Foot)
    let currentX = 0;
    let currentZ = 0;
    let currentSpeed = 0;

    if (this.isDriving && this.vehicle) {
      // Feed controls to Vehicle Dynamics
      this.vehicle.setInputs({
        throttle: this.keys.forward ? 1.0 : 0,
        brake: this.keys.backward ? 1.0 : 0,
        steer: (this.keys.left ? 1.0 : 0) - (this.keys.right ? 1.0 : 0),
        handbrake: this.keys.handbrake,
        nitro: this.keys.nitro
      });

      this.vehicle.update(dt, (x, z) => this.getTerrainHeight(x, z));
      this.vehicle.updateCamera(this.camera, dt);

      currentX = this.vehicle.pos.x;
      currentZ = this.vehicle.pos.z;
      currentSpeed = Math.round(Math.abs(this.vehicle.speed) * 2.237);

    } else if (this.character) {
      // Feed controls to Character Controller
      this.character.update(dt, this.keys, (x, z) => this.getTerrainHeight(x, z));
      this.character.updateCamera(this.camera, dt);

      currentX = this.character.pos.x;
      currentZ = this.character.pos.z;
      currentSpeed = Math.round(Math.abs(this.character.speed));
    }

    // B. Patrol Robots Animation
    if (this.robots) {
      this.robots.forEach(r => {
        r.angle += dt * 0.6;
        r.group.position.x = r.base.x + Math.sin(r.angle) * r.base.patrolRadius;
        r.group.position.z = r.base.z + Math.cos(r.angle) * r.base.patrolRadius;
        r.group.rotation.y = r.angle + Math.PI / 2;
      });
    }

    // C. Detect Current Biome & Nearby Districts
    let detectedBiome = "Cyber City & Plaza";
    for (let b of this.biomes) {
      if (currentX >= b.xRange[0] && currentX <= b.xRange[1] && currentZ >= b.zRange[0] && currentZ <= b.zRange[1]) {
        detectedBiome = b.name;
        break;
      }
    }
    this.currentBiome = detectedBiome;

    // Check Proximity to Districts
    let nearDistrict = null;
    for (let d of this.districts) {
      const dist = Math.hypot(currentX - d.x, currentZ - d.z);
      if (dist < d.radius + 3) {
        nearDistrict = d;
        break;
      }
    }
    this.activeZone = nearDistrict;

    // Check proximity to vehicle when on-foot
    let canEnterCar = false;
    if (!this.isDriving && this.character && this.vehicle) {
      canEnterCar = this.character.canEnterVehicle(this.vehicle);
    }

    // D. Dispatch Telemetry Update
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        isDriving: this.isDriving,
        canEnterCar: canEnterCar,
        currentBiome: this.currentBiome,
        activeZone: this.activeZone,
        speedMph: currentSpeed,
        x: Math.round(currentX),
        z: Math.round(currentZ),
        vehicleTelemetry: this.vehicle ? this.vehicle.getTelemetry() : null,
        promptMessage: this.promptMessage
      });
    }

    // E. Render Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
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
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
    }
  }
}
