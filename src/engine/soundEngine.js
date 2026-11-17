/**
 * ONLYSONS Procedural Audio Synthesizer: 8-Bit Chiptune & Realistic GTA Vehicle Engine
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 100% Procedural Web Audio API — Zero external audio files required.
 */

export class RetroSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;

    // Vehicle engine sound state
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.noiseBuffer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.generateNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.2) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context policy
    }
  }

  // ---------------------------------------------------------------------------
  // GTA REALISTIC VEHICLE AUDIO
  // ---------------------------------------------------------------------------
  startEngine() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      // Primary engine combustion harmonics
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      // Deep rumble sub-bass
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'triangle';
      this.engineSubOsc.frequency.setValueAtTime(28, this.ctx.currentTime);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineSubOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.engineSubOsc.start();
      this.isEngineRunning = true;
    } catch (e) {}
  }

  updateEngine(rpmRatio, load = 0.5) {
    if (!this.isEngineRunning || !this.ctx) return;
    try {
      const clampedRpm = Math.max(0.1, Math.min(1.2, rpmRatio));
      // Base idle at 42Hz, redline at 240Hz
      const targetFreq = 42 + clampedRpm * 195;
      const filterFreq = 180 + clampedRpm * 950 + (load > 0.7 ? 350 : 0);

      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, this.ctx.currentTime, 0.05);
      this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05);

      const targetGain = 0.09 + clampedRpm * 0.14 + (load > 0.8 ? 0.06 : 0);
      this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }

  stopEngine() {
    if (!this.isEngineRunning || !this.ctx) return;
    try {
      if (this.engineGain) {
        this.engineGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        try {
          if (this.engineOsc) this.engineOsc.stop();
          if (this.engineSubOsc) this.engineSubOsc.stop();
        } catch (e) {}
        this.isEngineRunning = false;
      }, 350);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  turboBlowoff() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    try {
      // High frequency turbo whistle
      this.playTone(1800, 'sine', 0.25, 0.12);

      // Pneumatic blow-off hiss
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  driftScreech() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    try {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(6.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.28);
    } catch (e) {}
  }

  nitroBoost() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    try {
      // Rocket thrust noise
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.6);

      // Sci-fi power ascent
      this.playTone(320, 'sawtooth', 0.4, 0.2);
      setTimeout(() => this.playTone(640, 'triangle', 0.4, 0.25), 80);
    } catch (e) {}
  }

  impactCrash() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    try {
      // Heavy metal crumple noise
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.5);

      // Sub-bass thump
      this.playTone(60, 'square', 0.4, 0.45);
      setTimeout(() => this.playTone(40, 'sine', 0.3, 0.35), 40);
    } catch (e) {}
  }

  stuntJump() {
    if (!this.enabled) return;
    this.playTone(220, 'triangle', 0.35, 0.25);
    setTimeout(() => this.playTone(440, 'sine', 0.45, 0.3), 100);
    setTimeout(() => this.playTone(880, 'sine', 0.5, 0.2), 220);
  }

  // ---------------------------------------------------------------------------
  // 8-BIT & GAME SOUNDS
  // ---------------------------------------------------------------------------
  upvote() {
    this.playTone(523, 'triangle', 0.08, 0.25);
    setTimeout(() => this.playTone(784, 'sine', 0.12, 0.25), 50);
  }

  downvote() {
    this.playTone(280, 'sawtooth', 0.1, 0.2);
    setTimeout(() => this.playTone(160, 'sine', 0.18, 0.2), 60);
  }

  award() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.18, 0.15), i * 70);
    });
  }

  hit() {
    this.playTone(190, 'sawtooth', 0.12, 0.3);
  }

  shield() {
    this.playTone(360, 'sine', 0.1, 0.25);
    setTimeout(() => this.playTone(540, 'sine', 0.14, 0.25), 60);
  }

  crit() {
    this.playTone(440, 'square', 0.1, 0.3);
    setTimeout(() => this.playTone(660, 'sawtooth', 0.12, 0.35), 70);
    setTimeout(() => this.playTone(990, 'triangle', 0.2, 0.3), 140);
  }

  levelUp() {
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.25, 0.25), i * 110);
    });
  }

  defeat() {
    [320, 280, 240, 180].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.25, 0.2), i * 120);
    });
  }
}
