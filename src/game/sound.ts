/**
 * Sound Manager for Friends Flappy Bird
 * - Plays user-uploaded music files matching the active character
 * - Generates low-latency Web Audio API sound effects for arcade actions
 */

class SoundManager {
  private musicAudio: HTMLAudioElement | null = null;
  private currentTrackUrl: string = '';
  private audioCtx: AudioContext | null = null;
  private musicVolume: number = 0.65;
  private sfxVolume: number = 0.8;
  private isMuted: boolean = false;
  private isUserInteracted: boolean = false;
  private shouldPlayMusic: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public registerUserInteraction() {
    this.isUserInteracted = true;
    this.initAudioContext();
    if (this.shouldPlayMusic && this.musicAudio && !this.isMuted) {
      this.musicAudio.play().catch(() => {});
    }
  }

  public setVolumes(musicVol: number, sfxVol: number, muted: boolean) {
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVol));
    this.isMuted = muted;

    if (this.musicAudio) {
      this.musicAudio.volume = this.isMuted ? 0 : this.musicVolume;
      if (this.isMuted && !this.musicAudio.paused) {
        this.musicAudio.pause();
      } else if (!this.isMuted && this.shouldPlayMusic && this.musicAudio.paused) {
        this.musicAudio.play().catch(() => {});
      }
    }
  }

  public playCharacterSong(audioSrc: string, loop: boolean = true) {
    this.shouldPlayMusic = true;
    if (!audioSrc) return;

    if (this.currentTrackUrl === audioSrc && this.musicAudio) {
      if (!this.isMuted && this.musicAudio.paused && this.isUserInteracted) {
        this.musicAudio.play().catch(() => {});
      }
      return;
    }

    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }

    this.currentTrackUrl = audioSrc;
    this.musicAudio = new Audio(audioSrc);
    this.musicAudio.loop = loop;
    this.musicAudio.volume = this.isMuted ? 0 : this.musicVolume;
    this.musicAudio.preload = 'auto';

    if (this.isUserInteracted && !this.isMuted) {
      this.musicAudio.play().catch((err) => {
        console.warn('Autoplay prevented until user gesture:', err);
      });
    }
  }

  public pauseMusic() {
    this.shouldPlayMusic = false;
    if (this.musicAudio && !this.musicAudio.paused) {
      this.musicAudio.pause();
    }
  }

  public resumeMusic() {
    this.shouldPlayMusic = true;
    if (this.musicAudio && !this.isMuted && this.isUserInteracted) {
      this.musicAudio.play().catch(() => {});
    }
  }

  public stopMusic() {
    this.shouldPlayMusic = false;
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }
  }

  public getCurrentTime(): number {
    return this.musicAudio?.currentTime || 0;
  }

  public isPlaying(): boolean {
    return !this.isMuted && !!this.musicAudio && !this.musicAudio.paused;
  }

  // --- Web Audio SFX Generation ---

  public playFlap() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, startTime);
      osc.frequency.exponentialRampToValueAtTime(740, startTime + 0.12);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.14);
    } catch {
      // AudioContext fallback
    }
  }

  public playPoint() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High bell ping
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1975.53, now); // B6 overtone

      gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {
      // AudioContext fallback
    }
  }

  public playHit() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Punchy thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // AudioContext fallback
    }
  }

  public playGameOver() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.15);
      osc.frequency.linearRampToValueAtTime(220, now + 0.32);
      osc.frequency.linearRampToValueAtTime(140, now + 0.55);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch {
      // AudioContext fallback
    }
  }

  public playClick() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // AudioContext fallback
    }
  }
}

export const soundManager = new SoundManager();
