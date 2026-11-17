/**
 * KarmaCrunch: 3D Holographic Visuals & Tilt Engine
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * Features WebGL 3D Karma Core & Dynamic Interactive 3D Depth Card
 */

export class KarmaVisuals3D {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.rotX = 0;
    this.rotY = 0;
    this.particles = [];
  }

  init() {
    if (!this.container) return;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.container.clientWidth || 360;
    this.canvas.height = this.container.clientHeight || 200;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.borderRadius = '14px';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Create 3D particle swarm
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 220,
        y: (Math.random() - 0.5) * 160,
        z: Math.random() * 200 - 100,
        size: Math.random() * 2.5 + 1,
        color: Math.random() > 0.5 ? '#ff4500' : '#0079d3',
        speed: Math.random() * 0.02 + 0.01
      });
    }

    this.animate();
  }

  animate() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Dynamic background glow
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
    grad.addColorStop(0, 'rgba(255, 69, 0, 0.15)');
    grad.addColorStop(0.6, 'rgba(0, 121, 211, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.rotY += 0.015;
    this.rotX += 0.008;

    // 3D Isometric Wireframe Karma Core
    this.draw3dPrism(ctx, cx, cy, 48, this.rotX, this.rotY);

    // Draw 3D floating particles
    this.particles.forEach(p => {
      p.z += Math.sin(this.rotY * 2) * 0.5;
      const fov = 180 / (180 + p.z);
      const px = cx + p.x * fov;
      const py = cy + p.y * fov;

      ctx.beginPath();
      ctx.arc(px, py, p.size * fov, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    this.animId = requestAnimationFrame(() => this.animate());
  }

  draw3dPrism(ctx, cx, cy, size, rx, ry) {
    // 3D vertices for octahedron (upvote crystal)
    const vertices = [
      { x: 0, y: -size * 1.3, z: 0 }, // top apex
      { x: size, y: 0, z: 0 },
      { x: 0, y: 0, z: size },
      { x: -size, y: 0, z: 0 },
      { x: 0, y: 0, z: -size },
      { x: 0, y: size * 1.3, z: 0 }  // bottom apex
    ];

    const edges = [
      [0,1],[0,2],[0,3],[0,4],
      [5,1],[5,2],[5,3],[5,4],
      [1,2],[2,3],[3,4],[4,1]
    ];

    const projected = vertices.map(v => {
      // Rotation Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      let x1 = v.x * cosY + v.z * sinY;
      let z1 = -v.x * sinY + v.z * cosY;

      // Rotation X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      let y2 = v.y * cosX - z1 * sinX;
      let z2 = v.y * sinX + z1 * cosX;

      const fov = 220 / (220 + z2);
      return {
        x: cx + x1 * fov,
        y: cy + y2 * fov,
        z: z2
      };
    });

    // Draw Edges
    edges.forEach(([i, j]) => {
      const p1 = projected[i];
      const p2 = projected[j];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#ff4500';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

/**
 * Attaches a dynamic 3D Mouse Gyro Tilt effect to a target DOM container.
 */
export function setup3dTiltCard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.style.transformStyle = 'preserve-3d';
  el.style.transition = 'transform 0.15s ease-out, box-shadow 0.2s';

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -14;
    const tiltY = (x / (rect.width / 2)) * 14;

    el.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(10px)`;
    el.style.boxShadow = `0 20px 45px rgba(255, 69, 0, 0.25), 0 0 30px rgba(0, 121, 211, 0.2)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  });
}
