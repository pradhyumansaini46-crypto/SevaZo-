export const lightColors = {
  // Brand & Primary
  primary: '#059669',          // Emerald Green
  primaryDark: '#047857',
  primaryLight: '#E3FDF5',     // User Specified Mint Palette
  primaryGlow: 'rgba(5, 150, 105, 0.15)',

  // Secondary & Accents
  secondary: '#6366F1',        // Indigo
  secondaryLight: '#FFE6FA',   // User Specified Soft Lavender/Pink Palette
  accentPurple: '#8B5CF6',
  accentPurpleLight: '#FFE6FA',

  // Gradient Background Stops (#E3FDF5 -> #FFE6FA)
  gradientStart: '#E3FDF5',
  gradientEnd: '#FFE6FA',

  // Status & Notifications
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#EFF6FF',

  // Clean Light Canvas
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // High-Contrast Light Typography (Crystal Clear)
  textPrimary: '#0F172A',      // Slate 900
  textSecondary: '#334155',    // Slate 700
  textMuted: '#64748B',        // Slate 500
  textInverse: '#FFFFFF',
  textAccent: '#059669',

  onlineGreen: '#10B981',
  offlineGray: '#64748B',
};

export const darkColors = {
  // Brand & Primary for Dark Mode (Vibrant High-Luminance Emerald)
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: 'rgba(16, 185, 129, 0.2)',
  primaryGlow: 'rgba(16, 185, 129, 0.35)',

  // Secondary & Accents
  secondary: '#38BDF8',
  secondaryLight: 'rgba(56, 189, 248, 0.18)',
  accentPurple: '#A855F7',
  accentPurpleLight: 'rgba(168, 85, 247, 0.18)',

  gradientStart: '#0B0F19',
  gradientEnd: '#131B2A',

  // Status & Notifications
  success: '#22C55E',
  successLight: '#052E16',
  warning: '#F59E0B',
  warningLight: '#2A1B0A',
  danger: '#EF4444',
  dangerLight: '#450A0A',
  info: '#38BDF8',
  infoLight: '#0C2D48',

  // Deep Obsidian Dark Surfaces
  background: '#090D16',       // Deep Dark Canvas
  surface: '#131B2A',          // Slate 900
  surfaceCard: '#1A2438',      // Slate 850
  surfaceElevated: '#222F46',  // Slate 800
  border: '#334155',           // Slate 700 (High-definition borders)
  borderLight: '#2A374A',

  // Ultra-Crisp Dark Mode Typography (Sabhi letters bilkul saaf)
  textPrimary: '#FFFFFF',      // 100% Crisp White
  textSecondary: '#E2E8F0',    // Slate 200 (Bright & easy to read)
  textMuted: '#94A3B8',        // Slate 400 (Clean metadata text)
  textInverse: '#090D16',
  textAccent: '#38BDF8',

  onlineGreen: '#22C55E',
  offlineGray: '#94A3B8',
};

export const getThemeColors = (mode: 'LIGHT' | 'DARK') => {
  return mode === 'DARK' ? darkColors : lightColors;
};

// Default Colors proxying active default theme
export const Colors = {
  ...lightColors,
  dark: darkColors,
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
  hero: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.8 },
  titleLarge: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  titleMedium: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.4 },
  titleSmall: { fontSize: 17, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  mono: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700' as const },
};

export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
};
