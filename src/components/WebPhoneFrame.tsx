import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { COLORS } from '../theme';

const MAX_CONTENT_WIDTH = 480;
// Below this window width, a desktop browser is already phone-sized (or this
// is a real mobile browser) — let content fill it edge to edge as normal.
const DESKTOP_BREAKPOINT = 560;

/**
 * Soma AI is designed mobile-first with no desktop layout of its own. Without
 * this, a wide desktop browser window stretches the app's flex:1 root across
 * the full viewport, leaving content pinned to the top-left corner and the
 * rest of the screen blank — it reads as broken, not "responsive." Centering
 * a fixed-width phone-sized column (matching how the app is actually
 * designed) reads as intentional instead, the same trick most mobile-first
 * web apps use for desktop visitors.
 */
export function WebPhoneFrame({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < DESKTOP_BREAKPOINT) {
    return <>{children}</>;
  }

  return (
    <View style={styles.backdrop}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05070f',
  },
  frame: {
    width: MAX_CONTENT_WIDTH,
    height: '100%',
    maxHeight: 900,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.glassBorder,
  },
});
