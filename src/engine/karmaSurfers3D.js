/**
 * KarmaSurfers 3D: A Complete 3D Runner Game for Reddit Devvit
 * Built by Rupesh Kumar, Eshwar Kartik, and Prashant
 * Features 3-lane 3D WebGL physics, progressive levels 1-100, procedural biomes, and powerups.
 */

export class KarmaSurfers3D {
  constructor(canvasContainerId, onScoreUpdate, onGameOver, onLevelComplete) {
    this.container = document.getElementById(canvasContainerId);
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;
    this.onLevelComplete = onLevelComplete;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = null;
    this.animId = null;

    // Game state
    this.isRunning = false;
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.level = 1;
    this.targetDistanceForLevel = 250; // meters to clear level
    this.baseSpeed = 0.55;
    this.currentSpeed = 0.55;

    // Lanes: -1 (Left), 0 (Center), 1 (Right)
    this.currentLane = 0;
    this.laneDistance = 3.2;
    this.targetX = 0;

    // Jumping & Sliding
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = 0.038;
    this.isSliding = false;
    this.slideTimer = 0;

    // Powerups
    this.hasShield = false;
    this.magnetTimer = 0;
    this.multiplierTimer = 0;
    this.scoreMultiplier = 1;

    // World entities
    this.trackTiles = [];
    this.obstacles = [];
    this.collectibles = [];
    this.particleSwarm = null;

    // Biomes (Levels 1-100)
    this.biomes = [
      { name: "Wholesome Meadow", sky: 0x87ceeb, fog: 0xc8e6c9, ground: 0x2e7d32, track: 0x388e3c },
      { name: "Neon Cyber Reddit", sky: 0x050510, fog: 0x0d1b2a, ground: 0x0079d3, track: 0x1a2634 },
      { name: "r/wallstreetbets Floor", sky: 0x1b1302, fog: 0x332605, ground: 0xffd700, track: 0x3e2723 },
      { name: "ModQueue Fortress", sky: 0x1a0505, fog: 0x2d0a0a, ground: 0xd32f2f, track: 0x212121 },
      { name: "Cosmic Hivemind", sky: 0x02000a, fog: 0x1a0033, ground: 0x8a2be2, track: 0x0a0017 }
    ];

    this.currentBiome = this.biomes[0];
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') return;

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.currentBiome = this.getBiomeForLevel(this.level);
    this.scene.background = new THREE.Color(this.currentBiome.sky);
    this.scene.fog = new THREE.FogExp2(this.currentBiome.fog, 0.015);

    // Camera
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 300);
    this.camera.position.set(0, 4.2, 7.5);
    this.camera.lookAt(0, 1.6, -10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // Build World
    this.createPlayer();
    this.createInitialTrack();
    this.createEnvironmentParticles();
    this.setupControls();

    window.addEventListener('resize', () => this.onResize());
  }

  getBiomeForLevel(lvl) {
    if (lvl <= 10) return this.biomes[0];
    if (lvl <= 25) return this.biomes[1];
    if (lvl <= 50) return this.biomes[2];
    if (lvl <= 75) return this.biomes[3];
    return this.biomes[4];
  }

  createPlayer() {
    this.player = new THREE.Group();

    // Body (Reddit Snoo)
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.65, 1.2, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.85;
    body.castShadow = true;
    this.player.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.65, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.9;
    this.player.add(head);

    // Glowing Orange Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.25, 1.95, -0.55);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.25, 1.95, -0.55);
    this.player.add(leftEye, rightEye);

    // Antenna
    const stalkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.position.set(0, 2.65, 0);
    stalk.rotation.z = 0.2;
    this.player.add(stalk);

    const bulbGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0.12, 2.9, 0);
    this.player.add(bulb);

    // Shield Bubble (Hidden initially)
    const shieldGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00b0ff,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.5;
    this.shieldMesh.visible = false;
    this.player.add(this.shieldMesh);

    this.player.position.set(0, 0, 0);
    this.scene.add(this.player);
  }

  createInitialTrack() {
    for (let i = 0; i < 16; i++) {
      this.spawnTrackSection(-i * 18);
    }
  }

  spawnTrackSection(zPos) {
    const section = new THREE.Group();

    // Main 3-Lane Track Floor
    const floorGeo = new THREE.PlaneGeometry(11, 18);
    const floorMat = new THREE.MeshStandardMaterial({
      color: this.currentBiome.track,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, zPos);
    floor.receiveShadow = true;
    section.add(floor);

    // Glowing Neon Lane Dividers
    for (let lx of [-1.6, 1.6]) {
      const lineGeo = new THREE.PlaneGeometry(0.12, 18);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(lx, 0.02, zPos);
      section.add(line);
    }

    // Outer Guardrails
    for (let rx of [-5.5, 5.5]) {
      const railGeo = new THREE.BoxGeometry(0.3, 0.8, 18);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x0079d3 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(rx, 0.4, zPos);
      section.add(rail);
    }

    this.scene.add(section);
    this.trackTiles.push({ mesh: section, z: zPos });

    // Spawn obstacles and gems on distant sections
    if (zPos < -20) {
      this.populateSection(zPos);
    }
  }

  populateSection(zPos) {
    const lanes = [-this.laneDistance, 0, this.laneDistance];
    const laneChoice = lanes[Math.floor(Math.random() * lanes.length)];
    const roll = Math.random();

    if (roll < 0.45) {
      // Spawn Downvote Spikes (Jump or Dodge)
      this.spawnObstacle(laneChoice, zPos, 'spike');
    } else if (roll < 0.7) {
      // Spawn AutoMod Banhammer (Slide under)
      this.spawnObstacle(laneChoice, zPos, 'hammer');
    }

    // Spawn Collectibles in other lanes
    lanes.forEach(l => {
      if (l !== laneChoice && Math.random() < 0.6) {
        if (Math.random() < 0.15) {
          this.spawnPowerup(l, zPos);
        } else {
          this.spawnGem(l, zPos);
        }
      }
    });
  }

  spawnObstacle(x, z, type) {
    const obs = new THREE.Group();

    if (type === 'spike') {
      // Downvote Cone / Spike
      const geo = new THREE.ConeGeometry(0.8, 1.8, 4);
      const mat = new THREE.MeshStandardMaterial({ color: 0x7193ff, roughness: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.y = Math.PI / 4;
      mesh.position.y = 0.9;
      obs.add(mesh);
      obs.userData = { type: 'spike', height: 1.8, bounds: 0.9 };
    } else {
      // High AutoMod Barrier (Must Slide)
      const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const p1 = new THREE.Mesh(postGeo, postMat);
      p1.position.set(-1.3, 1.6, 0);
      const p2 = new THREE.Mesh(postGeo, postMat);
      p2.position.set(1.3, 1.6, 0);

      const barGeo = new THREE.BoxGeometry(2.8, 0.7, 0.4);
      const barMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0x551100 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 2.2, 0);

      obs.add(p1, p2, bar);
      obs.userData = { type: 'hammer', height: 2.2, minSlideHeight: 1.2 };
    }

    obs.position.set(x, 0, z);
    this.scene.add(obs);
    this.obstacles.push(obs);
  }

  spawnGem(x, z) {
    // 3D Rotating Upvote Gem
    const geo = new THREE.OctahedronGeometry(0.45);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0x331100,
      roughness: 0.2
    });
    const gem = new THREE.Mesh(geo, mat);
    gem.position.set(x, 1.1, z);
    gem.userData = { type: 'gem', value: 10 };
    this.scene.add(gem);
    this.collectibles.push(gem);
  }

  spawnPowerup(x, z) {
    const types = ['magnet', 'shield', 'multiplier'];
    const pType = types[Math.floor(Math.random() * types.length)];
    const colors = { magnet: 0xffd700, shield: 0x00b0ff, multiplier: 0x46d160 };

    const geo = new THREE.DodecahedronGeometry(0.5);
    const mat = new THREE.MeshStandardMaterial({
      color: colors[pType],
      emissive: colors[pType],
      emissiveIntensity: 0.3
    });
    const pow = new THREE.Mesh(geo, mat);
    pow.position.set(x, 1.3, z);
    pow.userData = { type: 'powerup', powerType: pType };
    this.scene.add(pow);
    this.collectibles.push(pow);
  }

  createEnvironmentParticles() {
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 25;
      positions[i + 2] = -Math.random() * 200;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    });

    this.particleSwarm = new THREE.Points(geo, mat);
    this.scene.add(this.particleSwarm);
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.moveLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.moveLane(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        this.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.slide();
      }
    });
  }

  moveLane(dir) {
    const next = this.currentLane + dir;
    if (next >= -1 && next <= 1) {
      this.currentLane = next;
      this.targetX = this.currentLane * this.laneDistance;
    }
  }

  jump() {
    if (!this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.jumpVelocity = 0.52;
    }
  }

  slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 35; // frames
      if (this.isJumping) {
        this.jumpVelocity = -0.4; // slam down fast
      }
    }
  }

  start(level = 1) {
    this.level = level;
    this.targetDistanceForLevel = 200 + level * 50;
    this.currentSpeed = this.baseSpeed + (level - 1) * 0.035;
    this.currentBiome = this.getBiomeForLevel(level);

    if (this.scene) {
      this.scene.background = new THREE.Color(this.currentBiome.sky);
      this.scene.fog.color = new THREE.Color(this.currentBiome.fog);
    }

    this.isRunning = true;
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.currentLane = 0;
    this.targetX = 0;
    this.hasShield = false;
    this.shieldMesh.visible = false;

    this.animate();
  }

  pause() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  animate() {
    if (!this.isRunning) return;

    this.updatePhysics();
    this.updateTrack();
    this.updateCollectibles();
    this.checkCollisions();
    this.updateTimers();

    // Render
    this.renderer.render(this.scene, this.camera);
    this.animId = requestAnimationFrame(() => this.animate());
  }

  updatePhysics() {
    // Smooth lane transition
    this.player.position.x += (this.targetX - this.player.position.x) * 0.22;
    this.player.rotation.z = (this.player.position.x - this.targetX) * 0.08;

    // Jump physics
    if (this.isJumping) {
      this.player.position.y += this.jumpVelocity;
      this.jumpVelocity -= this.gravity;

      if (this.player.position.y <= 0) {
        this.player.position.y = 0;
        this.isJumping = false;
      }
    }

    // Slide physics
    if (this.isSliding) {
      this.slideTimer--;
      this.player.scale.set(1.2, 0.45, 1.4);
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.player.scale.set(1, 1, 1);
      }
    } else if (!this.isJumping) {
      this.player.scale.set(1, 1, 1);
    }

    // Running bob
    if (!this.isJumping && !this.isSliding) {
      this.player.position.y = Math.abs(Math.sin(this.distance * 1.8)) * 0.2;
    }

    // Distance & Score progression
    this.distance += this.currentSpeed * 0.6;
    this.score += Math.floor(this.currentSpeed * 2 * this.scoreMultiplier);

    // Notify UI
    if (this.onScoreUpdate) {
      this.onScoreUpdate({
        score: this.score,
        coins: this.coins,
        distance: Math.floor(this.distance),
        level: this.level,
        targetDistance: this.targetDistanceForLevel,
        hasShield: this.hasShield,
        multiplier: this.scoreMultiplier
      });
    }

    // Check level clear
    if (this.distance >= this.targetDistanceForLevel) {
      this.isRunning = false;
      if (this.onLevelComplete) {
        this.onLevelComplete(this.level, this.score, this.coins);
      }
    }
  }

  updateTrack() {
    const moveDist = this.currentSpeed;

    // Move track towards camera
    this.trackTiles.forEach(tile => {
      tile.z += moveDist;
      tile.mesh.position.z = tile.z;

      // Recycle tile behind camera
      if (tile.z > 25) {
        tile.z -= 16 * 18;
        tile.mesh.position.z = tile.z;
        this.populateSection(tile.z);
      }
    });

    // Move obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.position.z += moveDist;

      if (obs.position.z > 20) {
        this.scene.remove(obs);
        this.obstacles.splice(i, 1);
      }
    }
  }

  updateCollectibles() {
    const moveDist = this.currentSpeed;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.position.z += moveDist;
      item.rotation.y += 0.04;

      // Magnet effect
      if (this.magnetTimer > 0) {
        const dx = this.player.position.x - item.position.x;
        const dz = this.player.position.z - item.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 14) {
          item.position.x += dx * 0.18;
          item.position.z += dz * 0.18;
        }
      }

      // Collect detection
      const pBox = this.player.position;
      const distToPlayer = Math.hypot(pBox.x - item.position.x, pBox.z - item.position.z);

      if (distToPlayer < 1.3 && Math.abs(pBox.y - item.position.y) < 1.6) {
        this.handleCollectItem(item);
        this.scene.remove(item);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (item.position.z > 20) {
        this.scene.remove(item);
        this.collectibles.splice(i, 1);
      }
    }
  }

  handleCollectItem(item) {
    if (item.userData.type === 'gem') {
      this.score += 25 * this.scoreMultiplier;
      this.coins += 1;
    } else if (item.userData.type === 'powerup') {
      const p = item.userData.powerType;
      if (p === 'shield') {
        this.hasShield = true;
        this.shieldMesh.visible = true;
      } else if (p === 'magnet') {
        this.magnetTimer = 300; // ~6 seconds
      } else if (p === 'multiplier') {
        this.multiplierTimer = 350;
        this.scoreMultiplier = 2;
      }
    }
  }

  checkCollisions() {
    const px = this.player.position.x;
    const py = this.player.position.y;

    for (let obs of this.obstacles) {
      if (Math.abs(obs.position.z) < 1.2 && Math.abs(obs.position.x - px) < 1.4) {
        const data = obs.userData;

        // Check if collision can be avoided
        if (data.type === 'spike') {
          if (py > 1.2) continue; // successfully jumped over
        } else if (data.type === 'hammer') {
          if (this.isSliding) continue; // successfully slid under
        }

        // Collision Occurred
        if (this.hasShield) {
          this.hasShield = false;
          this.shieldMesh.visible = false;
          obs.position.z = 999; // destroy obstacle
          continue;
        }

        // Fatal collision
        this.isRunning = false;
        if (this.onGameOver) {
          this.onGameOver(this.score, this.coins, Math.floor(this.distance));
        }
        break;
      }
    }
  }

  updateTimers() {
    if (this.magnetTimer > 0) this.magnetTimer--;
    if (this.multiplierTimer > 0) {
      this.multiplierTimer--;
      if (this.multiplierTimer <= 0) this.scoreMultiplier = 1;
    }
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
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
    }
  }
}
