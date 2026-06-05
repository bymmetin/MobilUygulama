import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'app_settings';

export const DEFAULT_SETTINGS = {
  soundEffects: true,
  music: true,
  notifications: true,
  darkMode: false,
};

export const getSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const setSetting = async (key, value) => {
  const current = await getSettings();
  const next = { ...current, [key]: value };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
};
