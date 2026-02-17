// src/audio/MusicManager.ts
import Sound from 'react-native-sound';

export type MusicTrack = 'menu' | 'ingame_1';

const TRACK_FILES: Record<MusicTrack, string> = {
  menu: 'menu_music.mp3',
  ingame_1: 'ingame_music_1.mp3',
};

class MusicManagerClass {
  private current: Sound | null = null;
  private currentTrack: MusicTrack | null = null;
  private volume = 0.7;
  private enabled = true;

  init() {
    // Playback = joue même en mode silencieux (mode "Ring" iOS)
    // true = mixOthers : ne coupe pas les autres apps audio
    Sound.setCategory('Playback', true);
  }

  play(track: MusicTrack) {
    if (!this.enabled) return;
    if (this.currentTrack === track && this.current) return;

    this.stop();

    const filename = TRACK_FILES[track];
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, (err) => {
      if (err) {
        console.warn('[MusicManager] Erreur chargement', filename, err);
        return;
      }
      sound.setVolume(this.volume);
      sound.setNumberOfLoops(-1); // boucle infinie
      sound.play((success) => {
        if (!success) {
          console.warn('[MusicManager] Lecture échouée:', filename);
        }
      });
    });

    this.current = sound;
    this.currentTrack = track;
  }

  stop() {
    if (this.current) {
      this.current.stop();
      this.current.release();
      this.current = null;
    }
    this.currentTrack = null;
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
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const MusicManager = new MusicManagerClass();
