/**
 * ONLYSONS: Playable Android / Human Character System & Animation Controller
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Features:
 *  - Protagonist: Ayaan Malik (Age ~25, talented underground street racer, mechanic, bearded face)
 *  - 3 Character Archetypes:
 *      1. Human (Ayaan Malik - Leather Racing Jacket, Beard, Denim)
 *      2. Full Android (Unit-07 - Metallic Chassis, Glowing LED Optical Visor)
 *      3. Human-Android Hybrid (Ayaan Cyber-Augmented - Bio-mechanical cyber arm & spine)
 *  - Seamless Vehicle Enter / Exit Mechanics ([F] key)
 *  - Complete Procedural Animation Controller:
 *      - Idle breathing & balance sway
 *      - Walking (natural gait cycle)
 *      - Running & Sprinting (high-knee drive, forward torso lean)
 *      - Jumping & Landing (knee flexion shock absorption)
 *      - Sitting / Driving posture when in vehicle
 *      - Talking / Gesture animations during story dialogue
 *  - Photo-to-Playable-Character Pipeline:
 *      - Generates custom face canvas textures and projects them onto head geometry
 */

export class CharacterController {
  constructor(scene, onEnterVehicle = null, onExitVehicle = null) {
    this.scene = scene;
    this.onEnterVehicle = onEnterVehicle;
    this.onExitVehicle = onExitVehicle;

    // Root Group & Meshes
    this.group = new THREE.Group();
    this.archetype = 'human'; // 'human', 'android', 'hybrid'
    this.currentAction = 'idle'; // 'idle', 'walk', 'run', 'sprint', 'jump', 'drive', 'talk'

    // Rig Parts for Procedural Skeletal Animation
    this.limbs = {
      head: null,
      faceMesh: null,
      torso: null,
      leftArm: null,
      rightArm: null,
      leftLeg: null,
      rightLeg: null,
      hair: null,
      beard: null,
      jacket: null,
      cyberArm: null,
      cyberSpine: null
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

    // Custom Face Photo Canvas
    this.faceTexture = null;
    this.faceMaterial = null;

    // Build the Character
    this.rebuildCharacterMesh();
    if (this.scene) {
      this.scene.add(this.group);
    }
  }

  // ===========================================================================
  // 1. PHOTO-TO-PLAYABLE-CHARACTER TEXTURE PIPELINE
  // ===========================================================================
  generateFaceTexture(faceType = 'ayaan', customImageDataUrl = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (customImageDataUrl) {
      // Load user uploaded photo onto face texture
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 512, 512);
        if (this.faceTexture) this.faceTexture.needsUpdate = true;
      };
      img.src = customImageDataUrl;
    } else if (faceType === 'ayaan') {
      // Procedural Protagonist Face: Ayaan Malik (Handsome South Asian, Trimmed Beard, Focused Eyes)
      // Base warm skin tone
      ctx.fillStyle = '#b38059';
      ctx.fillRect(0, 0, 512, 512);

      // Cheek shading & jawline
      ctx.fillStyle = '#9e6c46';
      ctx.beginPath();
      ctx.ellipse(256, 320, 180, 140, 0, 0, Math.PI);
      ctx.fill();

      // Sharp Dark Eyes & Eyebrows
      ctx.fillStyle = '#1c1511';
      // Eyebrows
      ctx.fillRect(140, 185, 90, 18);
      ctx.fillRect(282, 185, 90, 18);

      // Eye Whites
      ctx.fillStyle = '#f0f3f6';
      ctx.beginPath(); ctx.ellipse(185, 225, 32, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(327, 225, 32, 18, 0, 0, Math.PI * 2); ctx.fill();

      // Brown Irises & Pupils
      ctx.fillStyle = '#452b1a';
      ctx.beginPath(); ctx.arc(185, 225, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(327, 225, 16, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(185, 225, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(327, 225, 8, 0, Math.PI * 2); ctx.fill();

      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(188, 221, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(330, 221, 4, 0, Math.PI * 2); ctx.fill();

      // Nose Contour
      ctx.fillStyle = '#8f5d37';
      ctx.beginPath();
      ctx.moveTo(256, 210);
      ctx.lineTo(245, 290);
      ctx.lineTo(267, 290);
      ctx.closePath();
      ctx.fill();

      // Full Trimmed Stubble / Beard (Ayaan's signature look)
      ctx.fillStyle = '#1a1818';
      ctx.beginPath();
      ctx.moveTo(110, 280);
      ctx.quadraticCurveTo(130, 440, 256, 480);
      ctx.quadraticCurveTo(382, 440, 402, 280);
      ctx.quadraticCurveTo(360, 360, 256, 370);
      ctx.quadraticCurveTo(152, 360, 110, 280);
      ctx.fill();

      // Mustache
      ctx.beginPath();
      ctx.ellipse(256, 335, 65, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Undercover Agent Headset Microphone
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(80, 240, 30, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();

    } else if (faceType === 'android') {
      // Full Android Optical Visor Interface (Cyber Unit-07)
      ctx.fillStyle = '#1e242e';
      ctx.fillRect(0, 0, 512, 512);

      // Cyan Glowing LED Visor Line
      ctx.fillStyle = '#00f7ff';
      ctx.fillRect(80, 210, 352, 55);

      // HUD Telemetry overlay on visor
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('UNIT-07 // ONLINE', 140, 248);

      // Titanium seams & cooling vents
      ctx.strokeStyle = '#384252';
      ctx.lineWidth = 8;
      ctx.strokeRect(60, 120, 392, 300);
      for (let y = 310; y < 400; y += 20) {
        ctx.beginPath(); ctx.moveTo(180, y); ctx.lineTo(332, y); ctx.stroke();
      }

    } else if (faceType === 'hybrid') {
      // Half Human, Half Cybernetic (Ayaan Cyber-Augmented)
      // Left side Human
      ctx.fillStyle = '#b38059';
      ctx.fillRect(0, 0, 256, 512);

      // Right side Cybernetic Chassis
      ctx.fillStyle = '#1e242e';
      ctx.fillRect(256, 0, 256, 512);

      // Glowing Bio-mechanical seam
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(256, 0); ctx.lineTo(256, 512); ctx.stroke();

      // Left Eye: Human
      ctx.fillStyle = '#f0f3f6';
      ctx.beginPath(); ctx.ellipse(185, 225, 32, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#452b1a';
      ctx.beginPath(); ctx.arc(185, 225, 16, 0, Math.PI * 2); ctx.fill();

      // Right Eye: Glowing Cybernetic Sensor
      ctx.fillStyle = '#ff4500';
      ctx.beginPath(); ctx.arc(327, 225, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath(); ctx.arc(327, 225, 8, 0, Math.PI * 2); ctx.fill();
    }

    this.faceTexture = new THREE.CanvasTexture(canvas);
    return this.faceTexture;
  }

  // ===========================================================================
  // 2. 3D RIGGED CHARACTER GEOMETRY GENERATOR
  // ===========================================================================
  rebuildCharacterMesh() {
    // Clear existing children
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    // Material Palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: this.archetype === 'android' ? 0x2c3e50 : 0xb38059,
      metalness: this.archetype === 'android' ? 0.8 : 0.05,
      roughness: this.archetype === 'android' ? 0.3 : 0.7
    });

    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x181e26, // Dark Racing Leather
      roughness: 0.5,
      metalness: 0.2
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x222831, // Tactical Cargo Pants
      roughness: 0.8
    });

    const bootsMat = new THREE.MeshStandardMaterial({
      color: 0x0f1114,
      roughness: 0.6
    });

    const cyberMat = new THREE.MeshStandardMaterial({
      color: 0x3d4e63,
      metalness: 0.9,
      roughness: 0.2
    });

    const glowingOrangeMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const glowingCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f7ff });

    // 1. Torso & Upper Body
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.9, 0.42);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.limbs.torso = torso;
    this.group.add(torso);

    // Jacket Racing Stripes & "Malik Garage" Chest Badge
    const badgeGeo = new THREE.PlaneGeometry(0.2, 0.1);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.18, 0.2, 0.22);
    torso.add(badge);

    // 2. Head & Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 12), skinMat);
    neck.position.y = 0.52;
    torso.add(neck);

    const headGeo = new THREE.BoxGeometry(0.52, 0.58, 0.52);
    // Setup multi-material for head (Front face gets face canvas texture)
    const faceTex = this.generateFaceTexture(this.archetype === 'android' ? 'android' : (this.archetype === 'hybrid' ? 'hybrid' : 'ayaan'));
    this.faceMaterial = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 });

    const headMaterials = [
      skinMat, // Right
      skinMat, // Left
      skinMat, // Top
      skinMat, // Bottom
      skinMat, // Back
      this.faceMaterial // Front Face
    ];

    const head = new THREE.Mesh(headGeo, headMaterials);
    head.position.y = 0.92;
    head.castShadow = true;
    this.limbs.head = head;
    torso.add(head);

    // Hair & Beard (For Human / Hybrid)
    if (this.archetype !== 'android') {
      const hairGeo = new THREE.BoxGeometry(0.54, 0.22, 0.54);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x110f0f, roughness: 0.9 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 0.26;
      head.add(hair);
    }

    // 3. Left & Right Arms (Hinged at Shoulders)
    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.35, 0);

    const lArmMat = (this.archetype === 'android' || this.archetype === 'hybrid') ? cyberMat : jacketMat;
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.48, 10), lArmMat);
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

    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.48, 10), jacketMat);
    rUpperArm.position.y = -0.24;
    rUpperArm.castShadow = true;

    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.14), skinMat);
    rHand.position.y = -0.52;

    rightArmGroup.add(rUpperArm, rHand);
    this.limbs.rightArm = rightArmGroup;
    torso.add(rightArmGroup);

    // 4. Left & Right Legs (Hinged at Hips)
    // Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.2, 0.9, 0);

    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.76, 10), pantsMat);
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

    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.76, 10), pantsMat);
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
      spine.position.set(0, 0, -0.22);
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
      this.group.visible = false; // Hide on-foot model while inside car
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

    // Position character next to driver side door
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
