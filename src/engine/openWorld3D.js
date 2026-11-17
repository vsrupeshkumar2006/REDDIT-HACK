/**
 * ONLYSONS 3D Open-World Roamable Architecture Map
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Features:
 *  - 360-degree free roaming in a high-fidelity 3D Reddit Dynasty City Plaza
 *  - 5 District Pavilions corresponding to the Five Brothers:
 *      1. 🧙‍♂️ Mod Wizard Spire & Arcane Oracle
 *      2. 🐈 Chaos Cat Alley & Infiltration Matrix
 *      3. 🐕 Wholesome Doge Rotunda & Giant Plinko
 *      4. 🦍 WSB Ape Stock Exchange & Moon Rocket Launchpad
 *      5. 🦫 Zen Capybara Central Vault & Council Citadel
 *  - In-world physical interaction triggers: walk up to any pavilion to interact!
 *  - Native in-game brainrot meme billboards and live surveillance monitors
 *  - 6-DOF controls: WASD / Arrow keys, Jump, Boost, and 360° Camera Look
 *  - Minimap radar with player marker and landmark beacons
 */

export class OpenWorld3D {
  constructor(containerId, onInteractWithZone, onStatsUpdate) {
    this.container = document.getElementById(containerId);
    this.onInteract = onInteractWithZone;
    this.onStatsUpdate = onStatsUpdate;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = null;
    this.playerMesh = null;
    this.animId = null;

    // Movement & Physics
    this.pos = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotationY = 0;
    this.speed = 0;
    this.maxSpeed = 22;
    this.accel = 38;
    this.friction = 0.88;
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = 35;

    // Camera
    this.camDistance = 9;
    this.camHeight = 4.5;
    this.camPitch = 0.2;
    this.targetLook = null;

    // Control State
    this.keys = { forward: false, backward: false, left: false, right: false, jump: false, sprint: false };

    // Districts & Interaction Zones
    this.districts = [
      { id: 'wizard', name: "Son I: Mod Wizard's Arcane Spire", emoji: '🧙‍♂️', x: -35, z: -35, radius: 14, color: 0x9b59b6, type: 'tarot_limbo' },
      { id: 'cat', name: "Son II: Chaos Cat's Cyber Alley", emoji: '🐈', x: 35, z: -35, radius: 14, color: 0x3498db, type: 'mines_chicken' },
      { id: 'doge', name: "Son III: Wholesome Doge Plaza", emoji: '🐕', x: -35, z: 35, radius: 14, color: 0xf1c40f, type: 'plinko_dice' },
      { id: 'ape', name: "Son IV: WSB Ape Stock Exchange", emoji: '🦍', x: 35, z: 35, radius: 14, color: 0x2ecc71, type: 'crash_keno' },
      { id: 'capy', name: "Son V: Zen Capybara Central Vault", emoji: '🦫', x: 0, z: -55, radius: 16, color: 0xe67e22, type: 'council_fintech' }
    ];

    this.activeZone = null;
    this.memesList = [];
    this.lastTime = performance.now();
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') return;

    const width = this.container.clientWidth || 900;
    const height = this.container.clientHeight || 560;

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c111c);
    this.scene.fog = new THREE.FogExp2(0x0e1422, 0.009);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    this.camera.position.set(0, 8, 14);

    // 3. Renderer with Soft Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffecd2, 0x111625, 0.95);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffa834, 1.4);
    dirLight.position.set(45, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
    this.scene.add(dirLight);

    // 5. Build Open World
    this.createPlazaGround();
    this.createPlayerAvatar();
    this.buildDistrictPavilions();
    this.createBrainrotBillboards();
    this.setupControls();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  createPlazaGround() {
    // Grand Cyber City Plaza (160x160m)
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);

    // Procedural Plaza Grid Texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#121924';
    ctx.fillRect(0, 0, 512, 512);

    // Neon Cyber Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    }
    // Center glowing circle
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.stroke();

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(6, 6);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.65,
      metalness: 0.25
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Outer Perimeter Cyber Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a2332, metalness: 0.6, roughness: 0.4 });
    const wallGeoH = new THREE.BoxGeometry(160, 12, 2);
    const wallGeoV = new THREE.BoxGeometry(2, 12, 160);

    const wNorth = new THREE.Mesh(wallGeoH, wallMat); wNorth.position.set(0, 6, -80);
    const wSouth = new THREE.Mesh(wallGeoH, wallMat); wSouth.position.set(0, 6, 80);
    const wWest = new THREE.Mesh(wallGeoV, wallMat); wWest.position.set(-80, 6, 0);
    const wEast = new THREE.Mesh(wallGeoV, wallMat); wEast.position.set(80, 6, 0);
    this.scene.add(wNorth, wSouth, wWest, wEast);
  }

  createPlayerAvatar() {
    this.player = new THREE.Group();

    // Modeled Cyber Mascot Snoo / Dynasty Traveler
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.7, 1.4, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    this.player.add(body);

    const headGeo = new THREE.SphereGeometry(0.65, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.1;
    head.castShadow = true;
    this.player.add(head);

    // Glowing Visor / Eyes
    const visorGeo = new THREE.BoxGeometry(0.8, 0.2, 0.3);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.15, -0.55);
    this.player.add(visor);

    // Reddit Antenna with Beacon
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
    stalk.position.set(0, 2.9, 0);
    stalk.rotation.z = 0.2;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
    bulb.position.set(0.12, 3.15, 0);
    this.player.add(stalk, bulb);

    // Hover Halo / Shadow Ring
    const haloGeo = new THREE.RingGeometry(0.8, 1.05, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3, side: THREE.DoubleSide });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.04;
    this.player.add(halo);

    this.player.position.set(0, 0, 0);
    this.scene.add(this.player);
  }

  buildDistrictPavilions() {
    this.districts.forEach(d => {
      const group = new THREE.Group();
      group.position.set(d.x, 0, d.z);

      // Pavilion Base Dais
      const daisGeo = new THREE.CylinderGeometry(d.radius * 0.85, d.radius, 1.2, 32);
      const daisMat = new THREE.MeshStandardMaterial({ color: 0x16202c, metalness: 0.8, roughness: 0.2 });
      const dais = new THREE.Mesh(daisGeo, daisMat);
      dais.position.y = 0.6;
      dais.receiveShadow = true;
      group.add(dais);

      // Glowing Neon Energy Ring around Dais
      const ringGeo = new THREE.TorusGeometry(d.radius * 0.88, 0.25, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: d.color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.25;
      group.add(ring);

      // Architectural Monuments per Son
      if (d.id === 'wizard') {
        // Arcane Wizard Spire (Tower with floating crystal)
        const towerGeo = new THREE.ConeGeometry(3.5, 24, 6);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x4a235a, metalness: 0.85, roughness: 0.25 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 12;
        tower.castShadow = true;

        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.8), new THREE.MeshBasicMaterial({ color: 0x9b59b6, wireframe: true }));
        crystal.position.y = 26;
        group.add(tower, crystal);

      } else if (d.id === 'cat') {
        // Cyber Infiltration Monoliths with holographic laser grid
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 4), new THREE.MeshStandardMaterial({ color: 0x1a252f, metalness: 0.8 }));
        b1.position.set(-4, 9, 0);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 4), new THREE.MeshStandardMaterial({ color: 0x1a252f, metalness: 0.8 }));
        b2.position.set(4, 9, 0);
        group.add(b1, b2);

      } else if (d.id === 'doge') {
        // Wholesome Doge Giant 3D Plinko Pegboard Rotunda
        const rotundaGeo = new THREE.CylinderGeometry(5.5, 5.5, 14, 16, 1, true);
        const rotundaMat = new THREE.MeshStandardMaterial({ color: 0x7d6608, metalness: 0.9, roughness: 0.1, side: THREE.DoubleSide });
        const rotunda = new THREE.Mesh(rotundaGeo, rotundaMat);
        rotunda.position.y = 7;
        rotunda.castShadow = true;
        group.add(rotunda);

      } else if (d.id === 'ape') {
        // WSB Ape Financial Ticker & Moon Rocket Launch Gantry
        const gantry = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.5, 22, 8), new THREE.MeshStandardMaterial({ color: 0x1e8449, metalness: 0.8 }));
        gantry.position.y = 11;
        const rocket = new THREE.Mesh(new THREE.ConeGeometry(1.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 }));
        rocket.position.y = 24;
        group.add(gantry, rocket);

      } else if (d.id === 'capy') {
        // Zen Capybara Citadel of Ledger & Capacity Planning
        const citadel = new THREE.Mesh(new THREE.BoxGeometry(16, 14, 12), new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.7, roughness: 0.3 }));
        citadel.position.y = 7;
        citadel.castShadow = true;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe67e22, wireframe: true }));
        dome.position.y = 15;
        group.add(citadel, dome);
      }

      // Interactive Holographic Beacon Pillar
      const beaconGeo = new THREE.CylinderGeometry(0.4, 0.4, 4.5);
      const beaconMat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 3.5, d.radius * 0.75);
      group.add(beacon);

      this.scene.add(group);
    });
  }

  createBrainrotBillboards() {
    // 4 Massive Cyberpunk LED Hologram Billboards featuring Brainrot Reddit Memes
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
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, 256, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText("LIVE DYNASTY SURVEILLANCE FEED", 256, 165);

      const bTex = new THREE.CanvasTexture(bCanvas);
      const bGeo = new THREE.PlaneGeometry(24, 12);
      const bMat = new THREE.MeshBasicMaterial({ map: bTex, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(bGeo, bMat);
      mesh.position.set(b.x, 14, b.z);
      mesh.rotation.y = b.rotY;
      this.scene.add(mesh);
    });
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.keys.forward = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.keys.backward = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.keys.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.keys.right = true;
      if (e.key === ' ' || e.code === 'Space') this.jump();
      if (e.key === 'Shift') this.keys.sprint = true;
      if (e.key === 'e' || e.key === 'E') this.triggerCurrentInteraction();
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.keys.forward = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.keys.backward = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.keys.right = false;
      if (e.key === 'Shift') this.keys.sprint = false;
    });
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = 14;
    }
  }

  triggerCurrentInteraction() {
    if (this.activeZone && this.onInteract) {
      this.onInteract(this.activeZone);
    }
  }

  updatePlayerPhysics(dt) {
    const topSpeed = this.keys.sprint ? this.maxSpeed * 1.6 : this.maxSpeed;

    // Heading rotation (Left / Right keys rotate player)
    if (this.keys.left) this.rotationY += 2.6 * dt;
    if (this.keys.right) this.rotationY -= 2.6 * dt;

    // Forward / Backward thrust
    let forwardMove = 0;
    if (this.keys.forward) forwardMove += 1;
    if (this.keys.backward) forwardMove -= 0.6;

    const targetSpeed = forwardMove * topSpeed;
    this.speed += (targetSpeed - this.speed) * this.accel * dt;

    // Velocity vectors
    this.velocity.x = -Math.sin(this.rotationY) * this.speed;
    this.velocity.z = -Math.cos(this.rotationY) * this.speed;

    // Apply displacement
    this.pos.x += this.velocity.x * dt;
    this.pos.z += this.velocity.z * dt;

    // Clamp inside plaza boundaries (-76 to +76)
    this.pos.x = Math.max(-75, Math.min(75, this.pos.x));
    this.pos.z = Math.max(-75, Math.min(75, this.pos.z));

    // Jump physics
    if (this.isJumping) {
      this.pos.y += this.jumpVelocity * dt;
      this.jumpVelocity -= this.gravity * dt;
      if (this.pos.y <= 0) {
        this.pos.y = 0;
        this.isJumping = false;
      }
    }

    // Apply to 3D Player Group
    if (this.player) {
      this.player.position.set(this.pos.x, this.pos.y, this.pos.z);
      this.player.rotation.y = this.rotationY;
    }

    // Check Proximity to Districts
    let nearDistrict = null;
    for (let d of this.districts) {
      const dist = Math.hypot(this.pos.x - d.x, this.pos.z - d.z);
      if (dist < d.radius + 2) {
        nearDistrict = d;
        break;
      }
    }

    this.activeZone = nearDistrict;
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        x: Math.round(this.pos.x),
        z: Math.round(this.pos.z),
        speed: Math.round(Math.abs(this.speed)),
        activeZone: this.activeZone
      });
    }
  }

  updateCamera() {
    if (!this.player) return;

    // 3rd-Person Smooth Follow Camera
    const camOffsetZ = Math.cos(this.rotationY) * this.camDistance;
    const camOffsetX = Math.sin(this.rotationY) * this.camDistance;

    const targetCamX = this.pos.x + camOffsetX;
    const targetCamY = this.pos.y + this.camHeight;
    const targetCamZ = this.pos.z + camOffsetZ;

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.12;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.12;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.12;

    this.camera.lookAt(this.pos.x, this.pos.y + 1.8, this.pos.z);
  }

  animate() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.updatePlayerPhysics(dt);
    this.updateCamera();

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
