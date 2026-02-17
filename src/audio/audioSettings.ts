// src/audio/audioSettings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@audio_settings';

export type AudioSettings = {
  musicVolume: number;   // 1-10 (segments UI)
  musicEnabled: boolean;
  sfxEnabled: boolean;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicVolume: 7,
  musicEnabled: true,
  sfxEnabled: true,
};

export async function loadAudioSettings(): Promise<AudioSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export async function saveAudioSettings(patch: Partial<AudioSettings>): Promise<void> {
  try {
    const current = await loadAudioSettings();
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
  } catch {}
}
