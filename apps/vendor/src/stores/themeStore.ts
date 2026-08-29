import { create } from 'zustand';

export type ThemeMode = 'LIGHT' | 'DARK';

interface ThemeState {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'LIGHT', // Default theme with #E3FDF5 -> #FFE6FA palette
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'LIGHT' ? 'DARK' : 'LIGHT',
    })),
  setTheme: (mode: ThemeMode) => set({ themeMode: mode }),
}));
