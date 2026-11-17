/**
 * KarmaCrunch: Web Audio API Procedural Synthesizer
 * Built by Rupesh Kumar, Eshwar Kartik, and Prashant
 * Zero external audio assets required.
 */

export class RetroSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
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
