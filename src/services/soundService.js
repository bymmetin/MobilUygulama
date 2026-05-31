import { Audio } from 'expo-av';
import { getSettings } from './settingsService';

// Ücretsiz, kısa ses efektleri (freesound.org - CC0 lisansı)
const SOUNDS = {
  correct: 'https://www.soundjay.com/buttons/sounds/button-09a.mp3',
  wrong:   'https://www.soundjay.com/buttons/sounds/button-10.mp3',
  complete:'https://www.soundjay.com/buttons/sounds/button-37a.mp3',
};

let soundCache = {};

const loadSound = async (key) => {
  if (soundCache[key]) return soundCache[key];
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: SOUNDS[key] });
    soundCache[key] = sound;
    return sound;
  } catch (e) {
    console.warn('Ses yüklenemedi:', key, e.message);
    return null;
  }
};

export const playSound = async (key) => {
  try {
    const settings = await getSettings();
    if (!settings.soundEffects) return; // Ses kapalıysa çalma

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const sound = await loadSound(key);
    if (!sound) return;
    await sound.setPositionAsync(0); // Başa sar (önceki çalma bitmemişse)
    await sound.playAsync();
  } catch (e) {
    // Ses hatası uygulamayı kırmasın
    console.warn('Ses çalınamadı:', e.message);
  }
};

export const unloadSounds = async () => {
  for (const sound of Object.values(soundCache)) {
    try { await sound.unloadAsync(); } catch (_) {}
  }
  soundCache = {};
};
