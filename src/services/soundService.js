import { createAudioPlayer } from 'expo-audio';
import { getSettings } from './settingsService';

const SOUND_FILES = {
  correct:  require('../../assets/sounds/correct.mp3'),
  wrong:    require('../../assets/sounds/wrong.mp3'),
  complete: require('../../assets/sounds/complete.mp3'),
};

export const playSound = async (key) => {
  try {
    const settings = await getSettings();
    if (!settings.soundEffects) return;

    const player = createAudioPlayer(SOUND_FILES[key]);
    player.play();
    // Otomatik temizleme: çalma bitince dispose et
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) player.remove();
    });
  } catch (e) {
    console.warn('Ses çalınamadı:', key, e.message);
  }
};
