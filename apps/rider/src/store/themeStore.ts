import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light', // default classic white light theme
  isDark: false,
  setMode: (mode: ThemeMode) => {
    const isDark =
      mode === 'system'
        ? Appearance.getColorScheme() !== 'light'
        : mode === 'dark';
    set({ mode, isDark });
  },
  toggleTheme: () => {
    const nextMode = get().isDark ? 'light' : 'dark';
    set({ mode: nextMode, isDark: nextMode === 'dark' });
  },
}));

export default useThemeStore;
