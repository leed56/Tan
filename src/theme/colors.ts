export const COLORS = {
  // Backgrounds
  bgDark: '#0A0E27',
  bgMid: '#131936',
  bgCard: '#1C2347',
  bgCardLight: '#232B54',

  // Brand
  primary: '#7B6FF2',
  primaryLight: '#9B8CF9',
  primaryDark: '#5A50CC',
  secondary: '#4A90D9',
  secondaryLight: '#6AABEE',

  // Accent
  gold: '#F7C52E',
  goldLight: '#FFD700',
  goldDark: '#D4A017',

  // Semantic
  success: '#4ECDC4',
  successLight: '#7EDDD7',
  error: '#FF6B6B',
  errorLight: '#FF9494',
  warning: '#FFA94D',
  info: '#74C0FC',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0BAD3',
  textMuted: '#6B7499',
  textDisabled: '#3D4870',

  // Glass
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassBgDark: 'rgba(0, 0, 0, 0.3)',

  // Overlays
  overlay: 'rgba(10, 14, 39, 0.85)',
  overlayLight: 'rgba(10, 14, 39, 0.5)',

  // Subject colors
  subjects: {
    mathematics: '#4ECDC4',
    english: '#4A90D9',
    kiswahili: '#FF8C42',
    biology: '#52C41A',
    chemistry: '#7B6FF2',
    physics: '#5C6BC0',
    geography: '#10B981',
    history: '#F59E0B',
    civics: '#06B6D4',
    commerce: '#EC4899',
    agriculture: '#84CC16',
    computerStudies: '#8B5CF6',
    islamicKnowledge: '#F7C52E',
  },
} as const;

export const GRADIENTS = {
  background: ['#0A0E27', '#131936', '#1A2040'] as string[],
  primary: ['#7B6FF2', '#5A50CC'] as string[],
  gold: ['#F7C52E', '#D4A017'] as string[],
  success: ['#4ECDC4', '#2EAF9F'] as string[],
  card: ['rgba(28, 35, 71, 0.95)', 'rgba(19, 25, 54, 0.95)'] as string[],
  premium: ['#F7C52E', '#FF8C42'] as string[],
  splash: ['#0A0E27', '#1A0E3F', '#0D1B5E'] as string[],
  hero: ['#1C2347', '#0A0E27'] as string[],
} as const;
