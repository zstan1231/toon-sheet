// D&D 3.5e themed colors and typography
export const COLORS = {
  // Parchment tones
  parchment: '#F5E6C8',
  parchmentDark: '#E8D5A3',
  parchmentDeep: '#D4BC85',

  // Text
  text: '#3D2B1F',
  textMuted: '#6B4C3B',
  textLight: '#8B6B5A',

  // Accent (red/crimson for D&D feel)
  accent: '#8B1A1A',
  accentLight: '#A52929',
  accentDark: '#5C0F0F',

  // UI colors
  border: '#C4A35A',
  borderLight: '#D4BC85',
  shadow: 'rgba(61, 43, 31, 0.3)',

  // Status colors
  success: '#2E7D32',
  warning: '#F57F17',
  danger: '#C62828',
  info: '#1565C0',

  // HP colors
  hpGood: '#388E3C',
  hpWounded: '#F57F17',
  hpCritical: '#D32F2F',
  hpDead: '#7B1FA2',

  // Backgrounds
  card: '#FAF0DC',
  cardDark: '#F0E0B8',
  overlay: 'rgba(61, 43, 31, 0.7)',

  // Tab bar
  tabActive: '#8B1A1A',
  tabInactive: '#6B4C3B',
  tabBackground: '#E8D5A3',

  // White / neutral
  white: '#FFFFFF',
  inputBg: '#FBF5E6',
};

export const FONTS = {
  serif: 'serif',   // System serif — Georgia on iOS, Noto Serif on Android
  mono: 'monospace',
  sans: 'sans-serif',
};

export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
