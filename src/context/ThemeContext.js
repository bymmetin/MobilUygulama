import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSettings, setSetting } from '../services/settingsService';
import { lightColors, darkColors } from '../config/themes';

const ThemeContext = createContext({
  colors:       lightColors,
  isDark:       false,
  toggleDark:   () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    getSettings().then(s => setIsDark(!!s.darkMode));
  }, []);

  const toggleDark = useCallback(async (value) => {
    setIsDark(value);
    await setSetting('darkMode', value);
  }, []);

  return (
    <ThemeContext.Provider value={{ colors: isDark ? darkColors : lightColors, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
