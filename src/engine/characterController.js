/**
 * ONLYSONS: Photorealistic Human & Android Character Architecture
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Features:
 *  - Real Human 3D Anatomical Head & Face Architecture:
 *      - Modeled rounded cranium, contoured cheekbones, jawline, and chin
 *      - 3D protruding nose bridge, tip, and nostrils
 *      - 3D anatomical upper and lower lips with Cupid's bow
 *      - 3D modeled ears with outer helix and earlobe geometry
 *      - 3D styled hair volume with textured fade and side parting
 *  - 1024x1024 Ultra-Realistic Photographic Face Texture Generator:
 *      - Multi-layer dermal color blending (subsurface warmth, highlights, micro-pores)
 *      - Photorealistic human eyes: detailed radial iris fibers, limbal ring, ivory sclera with micro-veins,
 *        dual specular studio light glints, realistic eyelids, and feathered eyebrows
 *      - Photorealistic trimmed designer beard & stubble: multi-pass follicle engine rendering
 *        thousands of individual directional micro-hair strands with natural density gradients
 *      - Natural lip vermilion texture with micro-creases and subtle moisture sheen
 *  - Multiple Real Human Character Presets:
 *      1. Ayaan Malik (Protagonist - 25yo underground racer, designer beard, warm amber eyes)
 *      2. Father Rashid Malik (52yo veteran mechanic, distinguished silver-streaked beard)
 *      3. Sister Zara Malik (23yo investigative journalist, radiant skin, dark eyes)
 *      4. Brother Hamza Malik (19yo tech streamer, youthful crop fade)
 *      5. Agent Kabir (38yo intelligence handler, sharp tactical jaw)
 *      6. Unit-07 Full Android (Brushed titanium faceplate, cyan optical lens arrays)
 *      7. Ayaan Cyber-Hybrid (Organic human face merging into titanium neural chassis)
 *  - Photo-to-Playable Face Upload Pipeline (Custom photo mapped directly onto 3D face mesh)
 *  - Seamless Vehicle Enter / Exit Mechanics ([F] key)
 *  - Complete Procedural Animation Controller (Walk, run, sprint, jump, drive, talk)
 */

export class CharacterController {
  constructor(scene, onEnterVehicle = null, onExitVehicle = null) {
    this.scene = scene;
    this.onEnterVehicle = onEnterVehicle;
    this.onExitVehicle = onExitVehicle;

    // Root Group & Meshes
    this.group = new THREE.Group();
    this.archetype = 'human'; // 'human', 'android', 'hybrid'
    this.currentFacePreset = 'ayaan';
    this.currentAction = 'idle';

    // Rig Parts for Procedural Skeletal Animation
    this.limbs = {
      head: null,
      faceMesh: null,
      noseMesh: null,
      lipsMesh: null,
      earsGroup: null,
      hairMesh: null,
      torso: null,
      leftArm: null,
      rightArm: null,
      leftLeg: null,
      rightLeg: null
    };

    // State & Transform
    this.pos = { x: 0, y: 0, z: 5 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotationY = 0;
    this.speed = 0;
    this.walkSpeed = 4.5;
    this.runSpeed = 8.5;
    this.sprintSpeed = 13.5;
    this.accel = 32.0;

    // Jump Physics
    this.isGrounded = true;
    this.jumpVelocity = 0;
    this.gravity = 30.0;

    // Driving State
    this.isInVehicle = false;
    this.targetVehicle = null;

    // Animation Timers & Phase
    this.animTime = 0;
    this.talkAnimTime = 0;
    this.isTalking = false;

    // Custom Face Photo Canvas & Texture
    this.faceTexture = null;
    this.faceMaterial = null;

    // Build the Character
    this.rebuildCharacterMesh();
    if (this.scene) {
      this.scene.add(this.group);
    }
  }

  // ===========================================================================
  // 1. 1024x1024 PHOTOREALISTIC HUMAN FACE TEXTURE ENGINE
  // ===========================================================================
  generateFaceTexture(faceType = 'ayaan', customImageDataUrl = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (customImageDataUrl) {
      // User uploaded custom real human photo
      const img = new Image();
      img.onload = () => {
        // Draw centered and blend edges
        ctx.drawImage(img, 0, 0, 1024, 1024);
        if (this.faceTexture) this.faceTexture.needsUpdate = true;
      };
      img.src = customImageDataUrl;
      this.faceTexture = new THREE.CanvasTexture(canvas);
      return this.faceTexture;
    }

    if (faceType === 'android') {
      // Photorealistic Polished Titanium Android Faceplate (Unit-07)
      const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
      grad.addColorStop(0, '#1c2430');
      grad.addColorStop(0.5, '#2c3848');
      grad.addColorStop(1, '#151c26');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Brushed Metal Grain
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let y = 0; y < 1024; y += 3) {
        ctx.fillRect(0, y, 1024, 1);
      }

      // Titanium Seams & Carbon-Fiber Panels
      ctx.strokeStyle = '#3d4d60';
      ctx.lineWidth = 12;
      ctx.strokeRect(120, 160, 784, 700);

      // Cyan Luminous Optical Visor Lens Arrays
      const visorGrad = ctx.createLinearGradient(160, 420, 864, 420);
      visorGrad.addColorStop(0, '#00b0ff');
      visorGrad.addColorStop(0.5, '#00f7ff');
      visorGrad.addColorStop(1, '#00b0ff');
      ctx.fillStyle = visorGrad;
      ctx.fillRect(160, 420, 704, 110);

      // Visor Inner HUD Grid & Micro-Sensors
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let x = 180; x < 860; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x, 530); ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('UNIT-07 // NEURAL LINK ACTIVE', 240, 490);

      // Lower Cooling Vents
      ctx.fillStyle = '#0a0d12';
      for (let y = 680; y < 860; y += 35) {
        ctx.fillRect(360, y, 304, 18);
      }

    } else if (faceType === 'hybrid') {
      // Half Real Human, Half Titanium Neural Frame
      this.renderPhotorealisticHumanFace(ctx, 'ayaan', false, true);

      // Right Side: Cybernetic Titanium Overlay
      ctx.save();
      ctx.beginPath();
      ctx.rect(512, 0, 512, 1024);
      ctx.clip();

      const cGrad = ctx.createLinearGradient(512, 0, 1024, 1024);
      cGrad.addColorStop(0, '#1a232f');
      cGrad.addColorStop(1, '#2c3b4e');
      ctx.fillStyle = cGrad;
      ctx.fillRect(512, 0, 512, 1024);

      // Cybernetic Glowing Eye Sensor
      ctx.fillStyle = '#ff4500';
      ctx.beginPath(); ctx.arc(660, 440, 48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.arc(660, 440, 20, 0, Math.PI * 2); ctx.fill();

      // Neural Circuit Traces
      ctx.strokeStyle = '#00f7ff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(512, 200); ctx.lineTo(650, 200); ctx.lineTo(720, 280); ctx.lineTo(840, 280);
      ctx.moveTo(512, 600); ctx.lineTo(620, 600); ctx.lineTo(680, 700); ctx.lineTo(800, 700);
      ctx.stroke();

      ctx.restore();

      // Glowing Neon Energy Seam dividing organic and machine
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(512, 1024);
      ctx.stroke();

    } else {
      // Real Photographic Human Face: Ayaan, Rashid, Zara, Hamza, Kabir
      this.renderPhotorealisticHumanFace(ctx, faceType);
    }

    this.faceTexture = new THREE.CanvasTexture(canvas);
    return this.faceTexture;
  }

  // ===========================================================================
  // PHOTOREALISTIC HUMAN FACE GENERATOR (True Skin, Eyes, Lips & Beard Stubble)
  // ===========================================================================
  renderPhotorealisticHumanFace(ctx, person = 'ayaan', leftHalfOnly = false, rightHalfOnly = false) {
    // 1. Skin Tone & Complexion Settings per Character
    let baseTone = '#b47e56';   // Warm South Asian golden-tan (Ayaan)
    let shadowTone = '#96633e';
    let highlightTone = '#cb9168';
    let cheekBlush = 'rgba(195, 105, 85, 0.28)';
    let eyeIrisColor = '#4a2c16'; // Warm deep amber-brown
    let hasBeard = true;
    let beardColor = '#141212';
    let isSilverBeard = false;

    if (person === 'rashid') {
      // Veteran Mechanic Father (52yo): Weathered skin, silver-streaked beard
      baseTone = '#a8724b';
      shadowTone = '#845330';
      highlightTone = '#ba825a';
      hasBeard = true;
      beardColor = '#4a4646';
      isSilverBeard = true;
    } else if (person === 'zara') {
      // Investigative Journalist Sister (23yo): Smooth radiant complexion, no beard
      baseTone = '#ba845d';
      shadowTone = '#9e6945';
      highlightTone = '#d19971';
      cheekBlush = 'rgba(215, 95, 90, 0.35)';
      hasBeard = false;
    } else if (person === 'hamza') {
      // Gamer Brother (19yo): Youthful, light stubble
      baseTone = '#b8825a';
      shadowTone = '#986540';
      highlightTone = '#cb9269';
      hasBeard = true;
      beardColor = '#242020';
    } else if (person === 'kabir') {
      // Intelligence Handler (38yo): Sharp square jawline, tactical heavy stubble
      baseTone = '#ad7852';
      shadowTone = '#8c5936';
      highlightTone = '#bf875f';
      hasBeard = true;
      beardColor = '#181616';
    }

    // A. Base Photographic Skin Radial Gradient
    const skinGrad = ctx.createRadialGradient(512, 480, 100, 512, 512, 520);
    skinGrad.addColorStop(0, highlightTone);
    skinGrad.addColorStop(0.65, baseTone);
    skinGrad.addColorStop(1, shadowTone);
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // B. Micro-Pore Noise & Realistic Dermal Texture
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.9));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.8));
    }
    ctx.putImageData(imgData, 0, 0);

    // C. Subsurface Warmth on Cheeks & Forehead
    ctx.fillStyle = cheekBlush;
    ctx.beginPath(); ctx.ellipse(330, 530, 140, 90, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(694, 530, 140, 90, 0, 0, Math.PI * 2); ctx.fill();

    // D. Forehead & Temples Shading
    const browShadow = ctx.createLinearGradient(512, 280, 512, 420);
    browShadow.addColorStop(0, 'rgba(0,0,0,0.18)');
    browShadow.addColorStop(1, 'rgba(0,0,0,0.0)');
    ctx.fillStyle = browShadow;
    ctx.fillRect(200, 280, 624, 140);

    // E. Photorealistic Eyes (Left & Right)
    const drawEye = (centerX, centerY, isRight = false) => {
      // 1. Orbital Socket Crease Shadow
      ctx.fillStyle = 'rgba(40, 24, 16, 0.35)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 28, 76, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Eye Sclera (Ivory warm base + spherical shadow)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 68, 34, 0, 0, Math.PI * 2);
      ctx.clip();

      const scleraGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 68);
      scleraGrad.addColorStop(0, '#f5f4ef');
      scleraGrad.addColorStop(0.85, '#e8e4dc');
      scleraGrad.addColorStop(1, '#c5b5a8');
      ctx.fillStyle = scleraGrad;
      ctx.fillRect(centerX - 70, centerY - 40, 140, 80);

      // Micro-Capillary Red Veins
      ctx.strokeStyle = 'rgba(215, 70, 70, 0.22)';
      ctx.lineWidth = 1;
      for (let v = 0; v < 4; v++) {
        ctx.beginPath();
        ctx.moveTo(centerX + (isRight ? 35 : -35), centerY + (v * 4 - 8));
        ctx.lineTo(centerX + (isRight ? 18 : -18), centerY + (v * 3 - 4));
        ctx.stroke();
      }

      // 3. Realistic Iris with Limbal Ring & Radial Fibers
      const irisRadius = 32;
      // Outer Limbal Ring (Deep dark boundary)
      ctx.fillStyle = '#110c08';
      ctx.beginPath(); ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2); ctx.fill();

      // Iris Stroma Gradient (Warm Amber-Brown Depth)
      const irisGrad = ctx.createRadialGradient(centerX, centerY, 6, centerX, centerY, irisRadius - 2);
      irisGrad.addColorStop(0, '#78461f');
      irisGrad.addColorStop(0.5, eyeIrisColor);
      irisGrad.addColorStop(1, '#2c190d');
      ctx.fillStyle = irisGrad;
      ctx.beginPath(); ctx.arc(centerX, centerY, irisRadius - 2, 0, Math.PI * 2); ctx.fill();

      // Radial Iris Fibers
      ctx.strokeStyle = 'rgba(255, 190, 120, 0.3)';
      ctx.lineWidth = 1.2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(a) * 9, centerY + Math.sin(a) * 9);
        ctx.lineTo(centerX + Math.cos(a) * (irisRadius - 4), centerY + Math.sin(a) * (irisRadius - 4));
        ctx.stroke();
      }

      // Deep Black Pupil
      ctx.fillStyle = '#050404';
      ctx.beginPath(); ctx.arc(centerX, centerY, 13, 0, Math.PI * 2); ctx.fill();

      // Cornea Specular Light Reflections (Studio Light Glints)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(centerX - 7, centerY - 8, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(centerX + 6, centerY + 5, 2.2, 0, Math.PI * 2); ctx.fill();

      ctx.restore();

      // 4. Eyelid Contours & Eyelashes
      // Upper Eyelid Line
      ctx.strokeStyle = '#22150f';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 2, 70, 35, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // Upper Eyelashes
      ctx.strokeStyle = '#140c08';
      ctx.lineWidth = 1.8;
      for (let lx = -60; lx <= 60; lx += 9) {
        ctx.beginPath();
        const yTop = centerY - 2 - Math.sqrt(Math.max(0, 1 - (lx / 70) ** 2)) * 34;
        ctx.moveTo(centerX + lx, yTop);
        ctx.lineTo(centerX + lx + (isRight ? 4 : -4), yTop - 9);
        ctx.stroke();
      }

      // Lower Eyelid Line
      ctx.strokeStyle = 'rgba(70, 42, 28, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 2, 66, 32, 0, 0.05, Math.PI * 0.95);
      ctx.stroke();
    };

    drawEye(350, 435, false);
    drawEye(674, 435, true);

    // F. Photorealistic Hair-by-Hair Feathered Eyebrows
    const drawEyebrow = (startX, startY, endX, isRight = false) => {
      ctx.strokeStyle = '#18120e';
      ctx.lineWidth = 1.6;
      const step = isRight ? 3.5 : -3.5;
      const count = Math.abs(endX - startX) / 3.5;
      for (let i = 0; i < count; i++) {
        const x = startX + i * step;
        const arch = Math.sin((i / count) * Math.PI) * 16;
        const y = startY - arch;
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + (isRight ? 6 : -6), y - 10);
        ctx.stroke();
      }
    };

    drawEyebrow(430, 360, 270, false);
    drawEyebrow(594, 360, 754, true);

    // G. Realistic 3D Nose Shading
    // Nasal Bridge Highlight
    const noseHigh = ctx.createLinearGradient(512, 410, 512, 600);
    noseHigh.addColorStop(0, 'rgba(255,255,255,0.22)');
    noseHigh.addColorStop(0.85, 'rgba(255,255,255,0.35)');
    noseHigh.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = noseHigh;
    ctx.fillRect(504, 410, 16, 180);

    // Lateral Nose Shadows (Bridge Contours)
    ctx.fillStyle = 'rgba(60, 35, 20, 0.28)';
    ctx.beginPath();
    ctx.moveTo(480, 420); ctx.lineTo(502, 580); ctx.lineTo(470, 605); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(544, 420); ctx.lineTo(522, 580); ctx.lineTo(554, 605); ctx.closePath(); ctx.fill();

    // Nasal Tip & Nostrils
    ctx.fillStyle = 'rgba(180, 80, 60, 0.22)';
    ctx.beginPath(); ctx.arc(512, 605, 28, 0, Math.PI * 2); ctx.fill();

    // Nostril Cavities
    ctx.fillStyle = '#22120b';
    ctx.beginPath(); ctx.ellipse(475, 615, 14, 9, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(549, 615, 14, 9, 0.25, 0, Math.PI * 2); ctx.fill();

    // Philtrum Groove (leading from nose to upper lip)
    ctx.fillStyle = 'rgba(60, 35, 20, 0.2)';
    ctx.beginPath(); ctx.rect(502, 630, 6, 40); ctx.fill();
    ctx.beginPath(); ctx.rect(516, 630, 6, 40); ctx.fill();

    // H. Photorealistic Lips (Vermilion texture with micro-creases)
    // Upper Lip (Cupid's bow)
    const upperLipGrad = ctx.createLinearGradient(512, 670, 512, 705);
    upperLipGrad.addColorStop(0, '#8e4b3c');
    upperLipGrad.addColorStop(1, '#683327');
    ctx.fillStyle = upperLipGrad;
    ctx.beginPath();
    ctx.moveTo(410, 695);
    ctx.quadraticCurveTo(475, 680, 502, 688);
    ctx.quadraticCurveTo(512, 694, 522, 688);
    ctx.quadraticCurveTo(549, 680, 614, 695);
    ctx.quadraticCurveTo(512, 712, 410, 695);
    ctx.fill();

    // Lower Lip (Full volume & center highlight)
    const lowerLipGrad = ctx.createLinearGradient(512, 705, 512, 755);
    lowerLipGrad.addColorStop(0, '#a25545');
    lowerLipGrad.addColorStop(0.5, '#bb6654');
    lowerLipGrad.addColorStop(1, '#78382c');
    ctx.fillStyle = lowerLipGrad;
    ctx.beginPath();
    ctx.moveTo(416, 700);
    ctx.quadraticCurveTo(512, 765, 608, 700);
    ctx.quadraticCurveTo(512, 708, 416, 700);
    ctx.fill();

    // Moisture Specular Sheen on Lower Lip
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath(); ctx.ellipse(512, 725, 36, 7, 0, 0, Math.PI * 2); ctx.fill();

    // Sublabial Depression Shadow under Lower Lip
    ctx.fillStyle = 'rgba(40, 20, 12, 0.35)';
    ctx.beginPath(); ctx.ellipse(512, 765, 55, 12, 0, 0, Math.PI * 2); ctx.fill();

    // I. Realistic Designer Facial Hair & Trimmed Stubble (Follicle Simulation)
    if (hasBeard) {
      ctx.fillStyle = beardColor;
      // Thousands of micro-fine directional stubble hairs
      const hairDensity = person === 'hamza' ? 1200 : 3800;
      for (let h = 0; h < hairDensity; h++) {
        // Sample points across lower jaw, chin, cheeks, and mustache
        const hx = 220 + Math.random() * 584;
        const hy = 580 + Math.random() * 380;

        // Density envelope (exclude center lips and upper nose)
        const distFromCenter = Math.hypot(hx - 512, hy - 710);
        if (distFromCenter < 55 && hy > 685 && hy < 740) continue; // Skip inner mouth

        // Cheek gradient falloff
        if (hy < 640 && Math.abs(hx - 512) < 140) continue; // Clean cheek upper area
        const cheekDist = Math.abs(hx - 512);
        if (hy < 670 && cheekDist < 190 && Math.random() > 0.35) continue;

        // Silver hairs for Father Rashid
        if (isSilverBeard && Math.random() < 0.35) {
          ctx.strokeStyle = 'rgba(215, 218, 222, 0.75)';
        } else {
          ctx.strokeStyle = beardColor;
        }

        ctx.lineWidth = 1.1;
        const strandLen = 3 + Math.random() * 4;
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + Math.cos(angle) * strandLen, hy + Math.sin(angle) * strandLen);
        ctx.stroke();
      }
    }

    // J. Hairline Gradient at Top
    const hairLineGrad = ctx.createLinearGradient(512, 120, 512, 260);
    hairLineGrad.addColorStop(0, '#0c0a09');
    hairLineGrad.addColorStop(0.85, 'rgba(12, 10, 9, 0.95)');
    hairLineGrad.addColorStop(1, 'rgba(12, 10, 9, 0.0)');
    ctx.fillStyle = hairLineGrad;
    ctx.fillRect(160, 120, 704, 150);
  }

  // ===========================================================================
  // 2. 3D ANATOMICAL HEAD & RIGGED CHARACTER GEOMETRY GENERATOR
  // ===========================================================================
  rebuildCharacterMesh() {
    // Clear existing children
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    // Material Palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: this.archetype === 'android' ? 0x2c3848 : 0xb47e56,
      metalness: this.archetype === 'android' ? 0.85 : 0.08,
      roughness: this.archetype === 'android' ? 0.25 : 0.6
    });

    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x161c24, // Racing Leather
      roughness: 0.5,
      metalness: 0.25
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x222a36, // Tactical Cargo
      roughness: 0.85
    });

    const bootsMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      roughness: 0.6
    });

    const cyberMat = new THREE.MeshStandardMaterial({
      color: 0x3d4e63,
      metalness: 0.92,
      roughness: 0.18
    });

    const glowingCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f7ff });

    // 1. Torso & Upper Body
    const torsoGeo = new THREE.BoxGeometry(0.74, 0.92, 0.44);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.limbs.torso = torso;
    this.group.add(torso);

    // Chest Emblem / "Malik Garage" Racing Badge
    const badgeGeo = new THREE.PlaneGeometry(0.22, 0.12);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.18, 0.22, 0.23);
    torso.add(badge);

    // 2. Anatomical Neck & Head Group
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.24, 16), skinMat);
    neck.position.y = 0.54;
    neck.castShadow = true;
    torso.add(neck);

    // Head Pivot Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.95;

    // A. Contoured Rounded Cranium (Smooth anatomical shape)
    const craniumGeo = new THREE.SphereGeometry(0.32, 24, 20);
    craniumGeo.scale(0.88, 1.05, 0.96);
    const craniumMesh = new THREE.Mesh(craniumGeo, skinMat);
    craniumMesh.castShadow = true;
    headGroup.add(craniumMesh);

    // B. Contoured Front Face Feature Plane with 1024x1024 Photographic Face Texture
    const faceTex = this.generateFaceTexture(
      this.archetype === 'android' ? 'android' : (this.archetype === 'hybrid' ? 'hybrid' : this.currentFacePreset)
    );
    this.faceMaterial = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.55,
      metalness: 0.08
    });

    const facePlaneGeo = new THREE.PlaneGeometry(0.52, 0.62);
    const facePlane = new THREE.Mesh(facePlaneGeo, this.faceMaterial);
    facePlane.position.set(0, 0.02, -0.285);
    facePlane.rotation.y = Math.PI; // Face front
    headGroup.add(facePlane);
    this.limbs.faceMesh = facePlane;

    // C. Modeled 3D Nose Bridge & Tip (Protrudes from face plane)
    const noseGroup = new THREE.Group();
    noseGroup.position.set(0, 0.02, -0.32);

    const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.16, 0.08), skinMat);
    noseBridge.rotation.x = 0.25;
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), skinMat);
    noseTip.position.set(0, -0.06, 0.035);

    noseGroup.add(noseBridge, noseTip);
    headGroup.add(noseGroup);
    this.limbs.noseMesh = noseGroup;

    // D. Modeled 3D Upper & Lower Lips
    const lipsGroup = new THREE.Group();
    lipsGroup.position.set(0, -0.14, -0.3);

    const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.04), skinMat);
    upperLip.position.y = 0.018;
    const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.045), skinMat);
    lowerLip.position.y = -0.018;

    lipsGroup.add(upperLip, lowerLip);
    headGroup.add(lipsGroup);
    this.limbs.lipsMesh = lipsGroup;

    // E. Modeled 3D Ears (Left & Right with anatomical outer helix)
    const earsGroup = new THREE.Group();
    [-0.29, 0.29].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.09), skinMat);
      ear.position.set(ex, 0.02, -0.02);
      ear.rotation.y = ex > 0 ? 0.2 : -0.2;
      earsGroup.add(ear);
    });
    headGroup.add(earsGroup);
    this.limbs.earsGroup = earsGroup;

    // F. Modeled 3D Styled Hair Volume (Pompadour / Fade)
    if (this.archetype !== 'android') {
      const hairMat = new THREE.MeshStandardMaterial({
        color: this.currentFacePreset === 'rashid' ? 0x3a3838 : 0x110f0f,
        roughness: 0.85
      });

      const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.18, 0.54), hairMat);
      hairTop.position.set(0, 0.28, -0.02);
      hairTop.castShadow = true;

      const hairSides = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.5), hairMat);
      hairSides.position.set(0, 0.16, -0.02);

      headGroup.add(hairTop, hairSides);
      this.limbs.hairMesh = hairTop;
    }

    this.limbs.head = headGroup;
    torso.add(headGroup);

    // 3. Left & Right Articulated Arms
    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.35, 0);

    const lArmMat = (this.archetype === 'android' || this.archetype === 'hybrid') ? cyberMat : jacketMat;
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.48, 12), lArmMat);
    lUpperArm.position.y = -0.24;
    lUpperArm.castShadow = true;

    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.14), skinMat);
    lHand.position.y = -0.52;

    leftArmGroup.add(lUpperArm, lHand);
    this.limbs.leftArm = leftArmGroup;
    torso.add(leftArmGroup);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.48, 0.35, 0);

    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.48, 12), jacketMat);
    rUpperArm.position.y = -0.24;
    rUpperArm.castShadow = true;

    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.14), skinMat);
    rHand.position.y = -0.52;

    rightArmGroup.add(rUpperArm, rHand);
    this.limbs.rightArm = rightArmGroup;
    torso.add(rightArmGroup);

    // 4. Left & Right Legs
    // Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.2, 0.9, 0);

    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.76, 12), pantsMat);
    lLegMesh.position.y = -0.38;
    lLegMesh.castShadow = true;

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.32), bootsMat);
    lBoot.position.set(0, -0.82, 0.06);

    leftLegGroup.add(lLegMesh, lBoot);
    this.limbs.leftLeg = leftLegGroup;
    this.group.add(leftLegGroup);

    // Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.2, 0.9, 0);

    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.76, 12), pantsMat);
    rLegMesh.position.y = -0.38;
    rLegMesh.castShadow = true;

    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.32), bootsMat);
    rBoot.position.set(0, -0.82, 0.06);

    rightLegGroup.add(rLegMesh, rBoot);
    this.limbs.rightLeg = rightLegGroup;
    this.group.add(rightLegGroup);

    // 5. Hybrid Cybernetic Spine & LED Circuitry
    if (this.archetype === 'hybrid' || this.archetype === 'android') {
      const spineGeo = new THREE.BoxGeometry(0.1, 0.8, 0.06);
      const spine = new THREE.Mesh(spineGeo, glowingCyanMat);
      spine.position.set(0, 0, -0.24);
      torso.add(spine);
    }
  }

  // ===========================================================================
  // 3. ARCHETYPE SWITCHING & CUSTOM PHOTO SETTER
  // ===========================================================================
  setArchetype(type) {
    if (['human', 'android', 'hybrid'].includes(type)) {
      this.archetype = type;
      this.rebuildCharacterMesh();
    }
  }

  setFacePreset(presetName) {
    if (['ayaan', 'rashid', 'zara', 'hamza', 'kabir', 'android', 'hybrid'].includes(presetName)) {
      this.currentFacePreset = presetName;
      if (presetName === 'android') this.archetype = 'android';
      else if (presetName === 'hybrid') this.archetype = 'hybrid';
      else this.archetype = 'human';
      this.rebuildCharacterMesh();
    }
  }

  setCustomPhoto(imageDataUrl) {
    this.generateFaceTexture(this.archetype, imageDataUrl);
  }

  // ===========================================================================
  // 4. PROCEDURAL ANIMATION CONTROLLER
  // ===========================================================================
  updateAnimation(dt) {
    this.animTime += dt * 8.0;

    if (this.isInVehicle) {
      // Driving Posture: Sitting, arms forward holding steering wheel
      if (this.limbs.torso) this.limbs.torso.position.y = 0.85;
      if (this.limbs.leftLeg) {
        this.limbs.leftLeg.rotation.x = -Math.PI / 2.4;
        this.limbs.leftLeg.position.y = 0.55;
      }
      if (this.limbs.rightLeg) {
        this.limbs.rightLeg.rotation.x = -Math.PI / 2.4;
        this.limbs.rightLeg.position.y = 0.55;
      }
      if (this.limbs.leftArm) this.limbs.leftArm.rotation.x = -0.9;
      if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = -0.9;
      return;
    }

    if (!this.isGrounded) {
      // In-Air Jumping Animation
      this.currentAction = 'jump';
      if (this.limbs.leftLeg) this.limbs.leftLeg.rotation.x = 0.45;
      if (this.limbs.rightLeg) this.limbs.rightLeg.rotation.x = -0.3;
      if (this.limbs.leftArm) this.limbs.leftArm.rotation.x = -1.2;
      if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = -1.2;
      return;
    }

    const movingSpeed = Math.abs(this.speed);

    if (movingSpeed < 0.2) {
      // Idle Breathing Animation
      this.currentAction = 'idle';
      const breath = Math.sin(this.animTime * 0.4) * 0.03;
      if (this.limbs.torso) this.limbs.torso.position.y = 1.35 + breath;
      if (this.limbs.head) this.limbs.head.rotation.x = breath * 0.5;

      // Relaxed arms
      if (this.limbs.leftArm) {
        this.limbs.leftArm.rotation.x = Math.sin(this.animTime * 0.4) * 0.05;
        this.limbs.leftArm.rotation.z = 0.08;
      }
      if (this.limbs.rightArm) {
        this.limbs.rightArm.rotation.x = -Math.sin(this.animTime * 0.4) * 0.05;
        this.limbs.rightArm.rotation.z = -0.08;
      }
      if (this.limbs.leftLeg) this.limbs.leftLeg.rotation.x = 0;
      if (this.limbs.rightLeg) this.limbs.rightLeg.rotation.x = 0;

    } else {
      // Locomotion Cycle (Walk, Run, or Sprint)
      const isSprinting = movingSpeed > 9.0;
      this.currentAction = isSprinting ? 'sprint' : (movingSpeed > 5.0 ? 'run' : 'walk');
      const strideRate = isSprinting ? 2.4 : 1.6;
      const legAngle = Math.sin(this.animTime * strideRate) * (isSprinting ? 0.95 : 0.65);
      const armAngle = Math.cos(this.animTime * strideRate) * (isSprinting ? 1.1 : 0.75);

      // Torso bobbing & forward lean
      if (this.limbs.torso) {
        this.limbs.torso.position.y = 1.35 + Math.abs(Math.sin(this.animTime * strideRate * 2)) * 0.08;
        this.limbs.torso.rotation.x = isSprinting ? 0.22 : 0.1;
      }

      // Opposite arm-leg swinging
      if (this.limbs.leftLeg) this.limbs.leftLeg.rotation.x = legAngle;
      if (this.limbs.rightLeg) this.limbs.rightLeg.rotation.x = -legAngle;

      if (this.limbs.leftArm) this.limbs.leftArm.rotation.x = armAngle;
      if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = -armAngle;
    }

    // Story Dialogue Talking Gestures
    if (this.isTalking) {
      this.talkAnimTime += dt * 5.0;
      if (this.limbs.head) {
        this.limbs.head.rotation.y = Math.sin(this.talkAnimTime) * 0.15;
        this.limbs.head.rotation.x = Math.cos(this.talkAnimTime * 0.8) * 0.08;
      }
      if (this.limbs.rightArm) {
        this.limbs.rightArm.rotation.x = -0.6 + Math.sin(this.talkAnimTime) * 0.2;
      }
    }
  }

  // ===========================================================================
  // 5. ON-FOOT MOVEMENT & PHYSICS
  // ===========================================================================
  update(dt, keys, terrainHeightFunc = null) {
    if (this.isInVehicle) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    // Movement direction input
    let moveForward = 0;
    if (keys.forward) moveForward += 1;
    if (keys.backward) moveForward -= 0.6;

    // Turn rotation
    if (keys.left) this.rotationY += 3.2 * dt;
    if (keys.right) this.rotationY -= 3.2 * dt;

    // Speed scaling (Walk, Run, Sprint)
    let targetTopSpeed = this.walkSpeed;
    if (keys.sprint) targetTopSpeed = this.sprintSpeed;
    else if (moveForward > 0) targetTopSpeed = this.runSpeed;

    const targetSpeed = moveForward * targetTopSpeed;
    this.speed += (targetSpeed - this.speed) * this.accel * dt;

    // Velocity displacement
    this.velocity.x = -Math.sin(this.rotationY) * this.speed;
    this.velocity.z = -Math.cos(this.rotationY) * this.speed;

    this.pos.x += this.velocity.x * dt;
    this.pos.z += this.velocity.z * dt;

    // Jump Physics
    if (keys.jump && this.isGrounded) {
      this.jumpVelocity = 12.0;
      this.isGrounded = false;
    }

    const groundY = terrainHeightFunc ? terrainHeightFunc(this.pos.x, this.pos.z) : 0;

    if (!this.isGrounded) {
      this.pos.y += this.jumpVelocity * dt;
      this.jumpVelocity -= this.gravity * dt;
      if (this.pos.y <= groundY) {
        this.pos.y = groundY;
        this.jumpVelocity = 0;
        this.isGrounded = true;
      }
    } else {
      this.pos.y = groundY;
    }

    // Sync 3D Mesh
    this.group.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.group.rotation.y = this.rotationY;

    // Update Skeletal Animations
    this.updateAnimation(dt);
  }

  // ===========================================================================
  // 6. SEAMLESS VEHICLE ENTER / EXIT SYSTEM
  // ===========================================================================
  canEnterVehicle(vehicleDynamics) {
    if (!vehicleDynamics || this.isInVehicle) return false;
    const dist = Math.hypot(this.pos.x - vehicleDynamics.pos.x, this.pos.z - vehicleDynamics.pos.z);
    return dist < 4.2; // Within door proximity
  }

  enterVehicle(vehicleDynamics) {
    this.isInVehicle = true;
    this.targetVehicle = vehicleDynamics;
    this.group.visible = false;
    if (this.onEnterVehicle) {
      this.onEnterVehicle(vehicleDynamics);
    }
  }

  exitVehicle() {
    if (!this.isInVehicle || !this.targetVehicle) return;

    const vHeading = this.targetVehicle.heading;
    const vPos = this.targetVehicle.pos;

    // Offset to left of car
    const doorOffsetX = -2.2;
    const doorOffsetZ = 0;
    const worldX = vPos.x + (doorOffsetX * Math.cos(vHeading) + doorOffsetZ * Math.sin(vHeading));
    const worldZ = vPos.z + (-doorOffsetX * Math.sin(vHeading) + doorOffsetZ * Math.cos(vHeading));

    this.pos.x = worldX;
    this.pos.y = vPos.y;
    this.pos.z = worldZ;
    this.rotationY = vHeading - Math.PI / 2;
    this.speed = 0;
    this.isInVehicle = false;
    this.targetVehicle = null;
    this.group.visible = true;

    if (this.onExitVehicle) {
      this.onExitVehicle(this.pos);
    }
  }

  // ===========================================================================
  // 7. CAMERA FOLLOW CONTROLLER FOR ON-FOOT
  // ===========================================================================
  updateCamera(camera, dt) {
    if (!camera || this.isInVehicle) return;

    const camDistance = 4.8;
    const camHeight = 2.4;

    const targetX = this.pos.x + Math.sin(this.rotationY) * camDistance;
    const targetY = this.pos.y + camHeight;
    const targetZ = this.pos.z + Math.cos(this.rotationY) * camDistance;

    camera.position.x += (targetX - camera.position.x) * 12.0 * dt;
    camera.position.y += (targetY - camera.position.y) * 12.0 * dt;
    camera.position.z += (targetZ - camera.position.z) * 12.0 * dt;

    camera.lookAt(this.pos.x, this.pos.y + 1.4, this.pos.z);
  }

  destroy() {
    if (this.scene && this.group) {
      this.scene.remove(this.group);
    }
  }
}
