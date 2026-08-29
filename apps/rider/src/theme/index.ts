import { useThemeStore } from '../store/themeStore';

export const LightColors = {
  // Brand: Signature Sevazo Velocity Orange & Eco Green Touch
  primary: '#FF6600',          // Electric High-Visibility Orange
  primaryDark: '#EA580C',
  primaryLight: '#FFF7ED',
  primaryGlow: 'rgba(255, 102, 0, 0.2)',

  // Green Accents
  accentGreen: '#10B981',      // Emerald Green Touch
  accentGreenDark: '#059669',
  accentGreenLight: '#ECFDF5',
  accentGreenGlow: 'rgba(16, 185, 129, 0.2)',

  // Secondary & Accents
  secondary: '#F59E0B',
  secondaryLight: '#FEF3C7',
  accentPurple: '#8B5CF6',
  accentPurpleLight: '#F5F3FF',

  // Status & Notifications
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#FF6600',
  infoLight: '#FFF7ED',

  // Neutral & Surfaces (Classic White Theme)
  background: '#FFFFFF',       // Pure Classic White
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',          // Pure White Card
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text Colors (High Contrast for White Background)
  textPrimary: '#0F172A',      // Crisp Dark Slate
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textAccent: '#FF6600',
  textGreen: '#059669',

  // Online / Offline Switch
  onlineGreen: '#10B981',
  offlineGray: '#94A3B8',
};

export const DarkColors = {
  // Brand: Signature Sevazo Velocity Orange & Eco Green Touch
  primary: '#FF6600',          // Electric High-Visibility Orange
  primaryDark: '#EA580C',
  primaryLight: '#FFF7ED',
  primaryGlow: 'rgba(255, 102, 0, 0.25)',

  // Green Accents
  accentGreen: '#10B981',      // Emerald Green Touch
  accentGreenDark: '#059669',
  accentGreenLight: '#ECFDF5',
  accentGreenGlow: 'rgba(16, 185, 129, 0.25)',

  // Secondary & Accents
  secondary: '#F59E0B',        // Warm Amber
  secondaryLight: '#FEF3C7',
  accentPurple: '#8B5CF6',
  accentPurpleLight: '#F5F3FF',

  // Status & Notifications
  success: '#10B981',          // Emerald Green
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#FF6600',
  infoLight: '#FFF7ED',

  // Neutral & Surfaces (Dark Theme)
  background: '#0F172A',       // Obsidian Slate
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',          // Deep Slate
  surfaceCard: '#1E293B',
  surfaceElevated: '#334155',
  border: '#334155',
  borderLight: '#475569',

  // Text Colors (Dark Theme)
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  textAccent: '#FF7A00',
  textGreen: '#10B981',

  // Online / Offline Switch
  onlineGreen: '#10B981',
  offlineGray: '#64748B',
};

// Default export is LightColors (Classic White)
export const Colors = LightColors;

export const useAppColors = () => {
  const isDark = useThemeStore((state) => state.isDark);
  return isDark ? DarkColors : LightColors;
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Typography = {
  hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8 },
  titleLarge: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  titleMedium: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.4 },
  titleSmall: { fontSize: 17, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  mono: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700' as const },
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  glowOrange: {
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  glowGreen: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  glowBlue: {
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};
