export const Colors = {
  // Brand & Primary for Customer App (Fresh Sevazo Emerald & Quick Commerce Teal)
  primary: '#059669',          // Emerald 600
  primaryDark: '#047857',      // Emerald 700
  primaryLight: '#ECFDF5',     // Emerald 50
  primaryGlow: 'rgba(5, 150, 105, 0.18)',

  // Secondary & Accents
  secondary: '#4F46E5',        // Indigo 600
  secondaryLight: '#EEF2FF',   // Indigo 50
  accentOrange: '#F97316',     // Orange 500 - Flash deals / Offers
  accentOrangeLight: '#FFF7ED',
  accentYellow: '#F59E0B',     // Amber 500 - Star ratings / Delivery badge
  accentYellowLight: '#FEF3C7',
  accentPurple: '#7C3AED',
  accentPurpleLight: '#F5F3FF',

  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Neutral & Surfaces
  background: '#F8FAFC',       // Slate 50
  surface: '#FFFFFF',          // Pure White
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#F1F5F9',  // Slate 100
  surfaceMuted: '#E2E8F0',     // Slate 200
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text Colors
  textPrimary: '#0F172A',      // Slate 900
  textSecondary: '#475569',    // Slate 600
  textMuted: '#94A3B8',        // Slate 400
  textInverse: '#FFFFFF',
  textPrice: '#059669',        // Green price highlight
  textCompare: '#94A3B8',      // Strikethrough price

  // App Elements
  heartRed: '#E11D48',
  starGold: '#F59E0B',
  badgeGreen: '#10B981',
  badgeDiscount: '#DC2626',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  hero: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.6 },
  titleLarge: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  titleMedium: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.3 },
  titleSmall: { fontSize: 15, fontWeight: '600' as const },
  bodyLarge: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  bodySmall: { fontSize: 11, fontWeight: '400' as const, lineHeight: 15 },
  priceLarge: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.5 },
  priceMedium: { fontSize: 16, fontWeight: '700' as const },
  priceSmall: { fontSize: 13, fontWeight: '700' as const },
  caption: { fontSize: 10, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
  tag: { fontSize: 11, fontWeight: '600' as const },
};

export const Shadows = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  floatingCTA: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
};
