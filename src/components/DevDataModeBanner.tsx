import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Mode = 'live' | 'placeholder' | 'missing';

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';
// .env.example ships placeholder values ("your_project_id" etc.), so a copied-
// but-not-edited .env passes the usual `length > 0` configured check while
// pointing at a nonexistent project — every query fails and the app silently
// shows seed data, which is indistinguishable from "not connecting."
const isPlaceholder = projectId.startsWith('your_');
const mode: Mode = !projectId ? 'missing' : isPlaceholder ? 'placeholder' : 'live';

const CONFIG: Record<Mode, { bg: string; text: string }> = {
  live: { bg: '#1B7A4B', text: `LIVE DATA · ${projectId}` },
  placeholder: {
    bg: '#B3261E',
    text: '.env HAS PLACEHOLDER VALUES — edit .env with real Firebase keys, save, restart',
  },
  missing: {
    bg: '#8A6D00',
    text: 'DEMO DATA — no .env found (create one next to package.json, then restart)',
  },
};

/**
 * Dev-only strip pinned to the top of the app showing which data source is
 * active. Exists because the console equivalent kept going unseen — this puts
 * the diagnosis in every screenshot instead. Never renders in release builds.
 */
export function DevDataModeBanner() {
  if (!__DEV__) return null;
  const c = CONFIG[mode];
  return (
    <View pointerEvents="none" style={[styles.strip, { backgroundColor: c.bg }]}>
      <Text style={styles.text} numberOfLines={1}>
        {c.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  text: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});
