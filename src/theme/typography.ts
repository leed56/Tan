import { Platform } from 'react-native';

const fontFamily = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: 'System',
});

// Inter, loaded at startup in App.tsx (@expo-google-fonts/inter). Custom
// fonts in React Native register one family name PER WEIGHT — pairing a
// generic family name with `fontWeight` would synthesize a fake bold — so
// styles opt in with `fontFamily: TYPOGRAPHY.families.<weight>` and omit
// fontWeight.
const families = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const TYPOGRAPHY = {
  fontFamily,
  families,

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 30,
    '4xl': 36,
    '5xl': 44,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;
