// src/audio/MusicManager.ts
import Sound from 'react-native-sound';

export type MusicTrack = 'menu' | 'ingame_1';

const TRACK_FILES: Record<MusicTrack, string> = {
  menu: 'menu_music.mp3',
  ingame_1: 'ingame_music_1.mp3',
};

const FADE_IN_MS = 1500;
const FADE_OUT_MS = 700;
const FADE_STEPS = 25;

class MusicManagerClass {
  private current: Sound | null = null;
  private currentTrack: MusicTrack | null = null;
  private lastTrack: MusicTrack | null = null;
  private volume = 0.7;
  private enabled = true;
  private fadeInTimer: ReturnType<typeof setInterval> | null = null;

  init() {
    Sound.setCategory('Playback', true);
  }

  private clearFadeIn() {
    if (this.fadeInTimer) {
      clearInterval(this.fadeInTimer);
      this.fadeInTimer = null;
    }
  }

  private doFadeOut(sound: Sound, onDone?: () => void) {
    const startVol = this.volume;
    const stepVol = startVol / FADE_STEPS;
    const stepMs = FADE_OUT_MS / FADE_STEPS;
    let current = startVol;

    const timer = setInterval(() => {
      current = Math.max(0, current - stepVol);
      sound.setVolume(current);
      if (current <= 0) {
        clearInterval(timer);
        sound.stop();
        sound.release();
        onDone?.();
      }
    }, stepMs);
  }

  private doFadeIn(sound: Sound) {
    this.clearFadeIn();
    const targetVol = this.volume;
    const stepVol = targetVol / FADE_STEPS;
    const stepMs = FADE_IN_MS / FADE_STEPS;
    let current = 0;

    this.fadeInTimer = setInterval(() => {
      current = Math.min(current + stepVol, targetVol);
      sound.setVolume(current);
      if (current >= targetVol) {
        this.clearFadeIn();
      }
    }, stepMs);
  }

  play(track: MusicTrack) {
    if (!this.enabled) return;
    if (this.currentTrack === track && this.current) return;

    this.clearFadeIn();
    const outgoing = this.current;
    this.current = null;
    this.currentTrack = null;

    this.lastTrack = track;

    const loadNew = () => {
      const filename = TRACK_FILES[track];
      const sound = new Sound(filename, Sound.MAIN_BUNDLE, (err) => {
        if (err) {
          console.warn('[MusicManager] Erreur chargement', filename, err);
          return;
        }
        // Si une autre piste a été demandée entre-temps, on abandonne
        if (this.current !== sound) {
          sound.release();
          return;
        }
        sound.setVolume(0);
        sound.setNumberOfLoops(-1);
        sound.play((success) => {
          if (!success) console.warn('[MusicManager] Lecture échouée:', filename);
        });
        this.doFadeIn(sound);
      });
      this.current = sound;
      this.currentTrack = track;
    };

    if (outgoing) {
      this.doFadeOut(outgoing, loadNew);
    } else {
      loadNew();
    }
  }

  stop() {
    this.clearFadeIn();
    const outgoing = this.current;
    this.current = null;
    this.currentTrack = null;
    if (outgoing) {
      this.doFadeOut(outgoing);
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.current?.setVolume(this.volume);
  }

  getVolume(): number {
    return this.volume;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    } else if (this.lastTrack) {
      this.play(this.lastTrack);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const MusicManager = new MusicManagerClass();
