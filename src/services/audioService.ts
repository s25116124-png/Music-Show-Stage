/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio Engine for Idol Stage Rumble
class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentBgmLoop: number | null = null;
  private isMuted: boolean = false;
  private bgmVolume: number = 0.65;
  private sfxVolume: number = 0.85;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, bgm: number, sfx: number) {
    this.bgmVolume = bgm;
    this.sfxVolume = sfx;
    if (this.ctx && this.masterGain && this.bgmGain && this.sfxGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : master, this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(bgm, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playPerfectHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Bright 3-note sparkle arpeggio (C6, E6, G6)
    [1046.5, 1318.5, 1567.98, 2093].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.025;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });

    // Sub clap punch
    const oscPunch = this.ctx.createOscillator();
    const gainPunch = this.ctx.createGain();
    oscPunch.type = 'sine';
    oscPunch.frequency.setValueAtTime(180, now);
    oscPunch.frequency.exponentialRampToValueAtTime(50, now + 0.09);
    gainPunch.gain.setValueAtTime(0.3, now);
    gainPunch.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    oscPunch.connect(gainPunch);
    gainPunch.connect(this.sfxGain);
    oscPunch.start(now);
    oscPunch.stop(now + 0.09);
  }

  public playGreatHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.07);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playMiss() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Comic dull bonk
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSpecialMove() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Magical idol burst
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.03;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  public playBananaSlip() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Cartoon slide whistle downward
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);

    // Followed by comic squeak-thud
    const oscThud = this.ctx.createOscillator();
    const gainThud = this.ctx.createGain();
    oscThud.type = 'triangle';
    oscThud.frequency.setValueAtTime(120, now + 0.32);
    oscThud.frequency.exponentialRampToValueAtTime(45, now + 0.5);

    gainThud.gain.setValueAtTime(0.4, now + 0.32);
    gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscThud.connect(gainThud);
    gainThud.connect(this.sfxGain);
    oscThud.start(now + 0.32);
    oscThud.stop(now + 0.5);
  }

  public playDodgeMic() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Fast whoosh + metallic resonance
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playEmergencyAlert() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Comic alert siren: two high-low warning beeps
    [
      { freq: 880, start: now, dur: 0.12 },
      { freq: 659.25, start: now + 0.14, dur: 0.12 },
      { freq: 880, start: now + 0.28, dur: 0.15 },
    ].forEach(({ freq, start, dur }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + dur);
    });
  }

  public playCrowdCheer() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Synthesized enthusiastic cheering chorus
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const detune = (Math.random() - 0.5) * 40;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 + detune, now);
      osc.frequency.linearRampToValueAtTime(580 + detune, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  }

  public playGlowstickToss() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sparkling whoosh with high twinkles
    const twirlFreqs = [1318.51, 1567.98, 1760.0, 2093.0];
    twirlFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playVictoryFanfare() {
    this.initContext();
    this.stopBgm();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Grand idol fanfare: C - G - C - E - G - high C
    const fanfareNotes = [
      { f: 523.25, d: 0.15, offset: 0 },
      { f: 523.25, d: 0.15, offset: 0.16 },
      { f: 523.25, d: 0.15, offset: 0.32 },
      { f: 659.25, d: 0.35, offset: 0.48 },
      { f: 783.99, d: 0.25, offset: 0.85 },
      { f: 1046.5, d: 0.7, offset: 1.1 },
    ];

    fanfareNotes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + n.offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + n.d);
    });
  }

  public playCheeryFanfare() {
    this.initContext();
    this.stopBgm();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Bouncy joyful pop celebration: G4, B4, D5, E5, G5
    const cheeryNotes = [
      { f: 392.0, d: 0.12, offset: 0 },
      { f: 493.88, d: 0.12, offset: 0.13 },
      { f: 587.33, d: 0.14, offset: 0.26 },
      { f: 659.25, d: 0.14, offset: 0.4 },
      { f: 783.99, d: 0.5, offset: 0.55 },
    ];

    cheeryNotes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + n.offset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + n.d);
    });

    this.playCrowdCheer();
  }

  public playFailSound() {
    this.initContext();
    this.stopBgm();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sad comic trombone: F4, E4, Eb4, D4 (with vibrato)
    const notes = [
      { f: 349.23, d: 0.3, t: 0 },
      { f: 329.63, d: 0.3, t: 0.32 },
      { f: 311.13, d: 0.3, t: 0.64 },
      { f: 293.66, d: 0.7, t: 0.96 },
    ];

    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + n.t;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + n.d);
    });
  }

  // --- Dynamic Procedural BGM Engine ---

  public startBgm(type: 'TITLE' | 'STAGE1' | 'STAGE2' | 'STAGE3') {
    this.initContext();
    this.stopBgm();

    if (!this.ctx || !this.bgmGain) return;

    let bpm = 125;
    let scale: number[] = [];
    let bassScale: number[] = [];

    if (type === 'TITLE') {
      bpm = 116;
      // Bright cute major pentatonic (F Major)
      scale = [349.23, 392.0, 440.0, 523.25, 587.33, 698.46];
      bassScale = [174.61, 220.0, 261.63, 196.0];
    } else if (type === 'STAGE1') {
      bpm = 90;
      // Pink idol bubblegum bounce (C Major)
      scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      bassScale = [130.81, 164.81, 196.0, 220.0];
    } else if (type === 'STAGE2') {
      bpm = 108;
      // Neon electro dance funk (A Minor)
      scale = [440.0, 493.88, 523.25, 587.33, 659.25, 783.99];
      bassScale = [110.0, 130.81, 146.83, 164.81];
    } else if (type === 'STAGE3') {
      bpm = 126;
      // Galactic energetic groove (D Minor)
      scale = [587.33, 659.25, 698.46, 783.99, 880.0, 1046.5, 1174.66];
      bassScale = [146.83, 174.61, 196.0, 220.0];
    }

    const secondsPerBeat = 60 / bpm;
    let step = 0;

    const playBeat = () => {
      if (!this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;

      // 1. Drum Kick & Snare
      if (step % 2 === 0) {
        // Kick on downbeats
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

        kickGain.gain.setValueAtTime(0.4, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.12);
      } else {
        // Hi-hat / snare tick
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hatOsc.type = 'triangle';
        hatOsc.frequency.setValueAtTime(1200, now);
        hatOsc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        hatGain.gain.setValueAtTime(0.18, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        hatOsc.connect(hatGain);
        hatGain.connect(this.bgmGain);
        hatOsc.start(now);
        hatOsc.stop(now + 0.05);
      }

      // 2. Bassline
      const bassIndex = Math.floor(step / 4) % bassScale.length;
      const bassFreq = bassScale[bassIndex];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + secondsPerBeat * 0.8);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + secondsPerBeat * 0.8);

      // 3. Catchy Lead Melody
      const melodyPattern = [0, 2, 4, 3, 1, 4, 2, 5, 3, 2, 0, 4];
      const melodyFreq = scale[melodyPattern[step % melodyPattern.length] % scale.length];

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = type === 'STAGE3' ? 'sawtooth' : 'triangle';
      leadOsc.frequency.setValueAtTime(melodyFreq, now);

      leadGain.gain.setValueAtTime(0.16, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + secondsPerBeat * 0.6);

      leadOsc.connect(leadGain);
      leadGain.connect(this.bgmGain);
      leadOsc.start(now);
      leadOsc.stop(now + secondsPerBeat * 0.6);

      step++;
    };

    // Run interval
    playBeat();
    this.currentBgmLoop = window.setInterval(playBeat, secondsPerBeat * 1000);
  }

  public stopBgm() {
    if (this.currentBgmLoop !== null) {
      window.clearInterval(this.currentBgmLoop);
      this.currentBgmLoop = null;
    }
  }
}

export const audioService = new SoundEngine();
