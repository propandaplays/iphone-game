/**
 * Audio Manager
 *
 * Manages background music (BGM) and sound effects (SFX) using Web Audio API.
 * Supports crossfade between BGM tracks, volume control, and muting.
 *
 * Usage:
 *   const audio = new AudioManager();
 *
 *   // Load audio (call after user interaction due to browser autoplay policy)
 *   await audio.loadBGM('main-theme', '/audio/bgm/main-theme.mp3');
 *   await audio.loadSFX('click', '/audio/sfx/click.wav');
 *
 *   // Or bulk load:
 *   await audio.loadAll({
 *     bgm: { 'main-theme': '/audio/main-theme.mp3', 'battle': '/audio/battle.mp3' },
 *     sfx: { 'click': '/audio/click.wav', 'confirm': '/audio/confirm.wav' }
 *   });
 *
 *   // Play BGM (with optional crossfade)
 *   audio.playBGM('main-theme');
 *   audio.playBGM('battle', { crossfade: true });
 *
 *   // Play SFX
 *   audio.playSFX('click');
 *   audio.playSFXRandomized('footstep', { pitchVariation: 0.1 });
 *
 *   // Volume control
 *   audio.setMasterVolume(0.8);
 *   audio.setBGMVolume(0.5);
 *   audio.mute();
 */

/**
 * Audio track state
 */
interface AudioTrack {
  key: string;
  buffer: AudioBuffer;
  source?: AudioBufferSourceNode;
  gainNode?: GainNode;
  isPlaying: boolean;
}

/**
 * AudioManager - handles BGM and SFX playback
 */
export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Audio tracks
  private bgmTracks: Map<string, AudioTrack> = new Map();
  private sfxTracks: Map<string, AudioTrack> = new Map();

  // Current state
  private currentBGM: AudioTrack | null = null;
  private isMuted: boolean = false;

  // Volume levels (0-1)
  private masterVolume: number = 1.0;
  private bgmVolume: number = 0.7;
  private sfxVolume: number = 1.0;

  // Crossfade settings
  private crossfadeDuration: number = 1000; // milliseconds

  // Callbacks
  onBGMStart?: (key: string) => void;
  onBGMEnd?: (key: string) => void;
  onSFXPlay?: (key: string) => void;

  constructor() {
    // AudioContext is created on first user interaction (browser requirement)
  }

  /**
   * Initialize audio context (call on first user interaction)
   */
  init(): void {
    if (this.context) return;

    this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create gain nodes
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = this.masterVolume;

    this.bgmGain = this.context.createGain();
    this.bgmGain.connect(this.masterGain);
    this.bgmGain.gain.value = this.bgmVolume;

    this.sfxGain = this.context.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = this.sfxVolume;
  }

  /**
   * Ensure context is initialized and resumed
   */
  private async ensureContext(): Promise<void> {
    if (!this.context) {
      this.init();
    }

    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  // ============================================================================
  // Loading
  // ============================================================================

  /**
   * Load a BGM track
   */
  async loadBGM(key: string, url: string): Promise<void> {
    await this.ensureContext();
    if (!this.context) return;

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.context.decodeAudioData(arrayBuffer);

    this.bgmTracks.set(key, {
      key,
      buffer,
      isPlaying: false,
    });
  }

  /**
   * Load a sound effect
   */
  async loadSFX(key: string, url: string): Promise<void> {
    await this.ensureContext();
    if (!this.context) return;

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.context.decodeAudioData(arrayBuffer);

    this.sfxTracks.set(key, {
      key,
      buffer,
      isPlaying: false,
    });
  }

  /**
   * Load multiple audio files
   */
  async loadAll(
    manifest: { bgm?: Record<string, string>; sfx?: Record<string, string> }
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    if (manifest.bgm) {
      for (const [key, url] of Object.entries(manifest.bgm)) {
        promises.push(this.loadBGM(key, url));
      }
    }

    if (manifest.sfx) {
      for (const [key, url] of Object.entries(manifest.sfx)) {
        promises.push(this.loadSFX(key, url));
      }
    }

    await Promise.all(promises);
  }

  // ============================================================================
  // BGM Playback
  // ============================================================================

  /**
   * Play background music (with optional crossfade from current)
   */
  playBGM(key: string, options?: { loop?: boolean; crossfade?: boolean }): void {
    const track = this.bgmTracks.get(key);
    if (!track || !this.context || !this.bgmGain) return;

    const loop = options?.loop ?? true;
    const crossfade = options?.crossfade ?? true;

    // If same track is already playing, do nothing
    if (this.currentBGM?.key === key && this.currentBGM.isPlaying) {
      return;
    }

    // Crossfade or stop current BGM
    if (this.currentBGM?.isPlaying) {
      if (crossfade) {
        this.fadeOutBGM(this.currentBGM);
      } else {
        this.stopCurrentBGM();
      }
    }

    // Create new source
    const source = this.context.createBufferSource();
    source.buffer = track.buffer;
    source.loop = loop;

    // Create gain for this track (for crossfade)
    const trackGain = this.context.createGain();
    trackGain.connect(this.bgmGain);

    // Start at 0 volume for crossfade
    if (crossfade && this.currentBGM) {
      trackGain.gain.value = 0;
      trackGain.gain.linearRampToValueAtTime(
        1,
        this.context.currentTime + this.crossfadeDuration / 1000
      );
    } else {
      trackGain.gain.value = 1;
    }

    source.connect(trackGain);
    source.start(0);

    track.source = source;
    track.gainNode = trackGain;
    track.isPlaying = true;
    this.currentBGM = track;

    source.onended = () => {
      track.isPlaying = false;
      if (this.currentBGM === track) {
        this.currentBGM = null;
        this.onBGMEnd?.(key);
      }
    };

    this.onBGMStart?.(key);
  }

  /**
   * Fade out a BGM track
   */
  private fadeOutBGM(track: AudioTrack): void {
    if (!track.gainNode || !this.context) return;

    track.gainNode.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + this.crossfadeDuration / 1000
    );

    // Stop after fade
    setTimeout(() => {
      track.source?.stop();
      track.isPlaying = false;
    }, this.crossfadeDuration);
  }

  /**
   * Stop current BGM immediately
   */
  stopBGM(): void {
    this.stopCurrentBGM();
  }

  private stopCurrentBGM(): void {
    if (!this.currentBGM) return;

    this.currentBGM.source?.stop();
    this.currentBGM.isPlaying = false;
    this.onBGMEnd?.(this.currentBGM.key);
    this.currentBGM = null;
  }

  /**
   * Pause current BGM
   */
  pauseBGM(): void {
    this.context?.suspend();
  }

  /**
   * Resume paused BGM
   */
  resumeBGM(): void {
    this.context?.resume();
  }

  // ============================================================================
  // SFX Playback
  // ============================================================================

  /**
   * Play a sound effect
   */
  playSFX(key: string, options?: { volume?: number; rate?: number }): void {
    const track = this.sfxTracks.get(key);
    if (!track || !this.context || !this.sfxGain) return;

    const volume = options?.volume ?? 1;
    const rate = options?.rate ?? 1;

    const source = this.context.createBufferSource();
    source.buffer = track.buffer;
    source.playbackRate.value = rate;

    // Individual volume for this instance
    const instanceGain = this.context.createGain();
    instanceGain.gain.value = volume;
    instanceGain.connect(this.sfxGain);

    source.connect(instanceGain);
    source.start(0);

    this.onSFXPlay?.(key);
  }

  /**
   * Play SFX with random pitch variation
   */
  playSFXRandomized(key: string, options?: { volume?: number; pitchVariation?: number }): void {
    const variation = options?.pitchVariation ?? 0.1;
    const rate = 1 + (Math.random() * 2 - 1) * variation;
    this.playSFX(key, { volume: options?.volume, rate });
  }

  // ============================================================================
  // Volume Control
  // ============================================================================

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
  }

  /**
   * Set BGM volume (0-1)
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.bgmVolume;
    }
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  /**
   * Mute all audio
   */
  mute(): void {
    this.isMuted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  /**
   * Unmute all audio
   */
  unmute(): void {
    this.isMuted = false;
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // ============================================================================
  // Settings
  // ============================================================================

  /**
   * Set crossfade duration in milliseconds
   */
  setCrossfadeDuration(ms: number): void {
    this.crossfadeDuration = ms;
  }

  // ============================================================================
  // State
  // ============================================================================

  isBGMPlaying(): boolean {
    return this.currentBGM?.isPlaying ?? false;
  }

  getCurrentBGMKey(): string | null {
    return this.currentBGM?.key ?? null;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  hasBGM(key: string): boolean {
    return this.bgmTracks.has(key);
  }

  hasSFX(key: string): boolean {
    return this.sfxTracks.has(key);
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Stop all audio and close context
   */
  dispose(): void {
    this.stopCurrentBGM();
    this.context?.close();
    this.context = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.bgmTracks.clear();
    this.sfxTracks.clear();
  }
}
