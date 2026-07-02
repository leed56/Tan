import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, firestore } from '../services/firebaseConfig';

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';
// .env.example ships placeholder values ("your_project_id" etc.), so a copied-
// but-not-edited .env passes the usual `length > 0` configured check while
// pointing at a nonexistent project.
const isPlaceholder = projectId.startsWith('your_');

type Probe = { state: 'pending' | 'ok' | 'fail'; detail: string };

/**
 * Dev-only strip pinned to the top of the app that runs a live end-to-end
 * self-test (env → anonymous sign-in → real Firestore topics query) and shows
 * each step's result. Exists because console diagnostics kept going unseen —
 * this puts the full diagnosis in every screenshot. Never renders in release.
 */
export function DevDataModeBanner() {
  const [authProbe, setAuthProbe] = useState<Probe>({ state: 'pending', detail: '…' });
  const [dbProbe, setDbProbe] = useState<Probe>({ state: 'pending', detail: '…' });

  useEffect(() => {
    if (!__DEV__ || !projectId || isPlaceholder) return;
    let cancelled = false;

    (async () => {
      try {
        // Reuses the current session when one exists; otherwise performs the
        // same sign-in the app relies on, surfacing its exact error code.
        const cred = auth.currentUser ?? (await signInAnonymously(auth)).user;
        if (cancelled) return;
        setAuthProbe({ state: 'ok', detail: `✓${cred.uid.slice(0, 4)}` });
      } catch (e: any) {
        if (cancelled) return;
        setAuthProbe({ state: 'fail', detail: `✗${e?.code ?? e?.message ?? 'unknown'}` });
        setDbProbe({ state: 'fail', detail: 'skipped' });
        return;
      }
      try {
        // The exact shape of the app's topics query, against known-seeded data.
        const snap = await getDocs(query(
          collection(firestore, 'topics'),
          where('formId', '==', 'form_1'),
          where('subjectId', '==', 'form_1_mathematics'),
          where('isActive', '==', true),
          orderBy('order'),
        ));
        if (cancelled) return;
        setDbProbe({ state: 'ok', detail: `✓${snap.size} topics` });
      } catch (e: any) {
        if (cancelled) return;
        setDbProbe({ state: 'fail', detail: `✗${e?.code ?? e?.message ?? 'unknown'}` });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (!__DEV__) return null;

  let bg = '#1B7A4B';
  let text: string;
  if (!projectId) {
    bg = '#8A6D00';
    text = 'DEMO DATA — no .env found (create one next to package.json, then restart)';
  } else if (isPlaceholder) {
    bg = '#B3261E';
    text = '.env HAS PLACEHOLDER VALUES — edit .env with real Firebase keys, save, restart';
  } else {
    if (authProbe.state === 'fail' || dbProbe.state === 'fail') bg = '#B3261E';
    else if (authProbe.state === 'pending' || dbProbe.state === 'pending') bg = '#8A6D00';
    text = `${projectId} · auth ${authProbe.detail} · db ${dbProbe.detail}`;
  }

  return (
    <View pointerEvents="none" style={[styles.strip, { backgroundColor: bg }]}>
      <Text style={styles.text} numberOfLines={1}>{text}</Text>
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
