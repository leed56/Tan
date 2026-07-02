/**
 * Family Hub — lightweight, Netflix-style child profiles for the Family plan.
 *
 * Design: the paying parent keeps the ONE real phone-verified login (rootUid
 * never changes, so every rules-protected collection keyed on the real
 * `request.auth.uid` — quiz_progress, gamification, daily_usage, etc. — is
 * completely untouched). Child profiles are lightweight aggregate records
 * (name/avatar/form + XP/streak) owned by rootUid, not separate accounts —
 * no phone/OTP, no per-question history. This keeps the feature genuinely
 * game-like (switch, earn XP, weekly Family MVP) without re-architecting the
 * rest of the app's per-uid data model.
 */
import {
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured, waitForAuthReady } from './firebaseConfig';
import type { ChildProfile } from '../types/subscription';
import { getLevelFromXp } from '../utils/xpUtils';
import { localDateStr, weekKey } from '../utils/date';

export function subscribeToChildProfiles(
  rootUid: string,
  callback: (profiles: ChildProfile[]) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    callback([]);
    return () => {};
  }
  // Deferred start — same rationale as subscribeToSubscription: this fires
  // from App.tsx before the startup sign-in finishes, and one pre-auth
  // permission-denied kills the listener permanently, emptying the Family
  // Hub (and silently reverting a "playing as child" session to the parent).
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;

  (async () => {
    await waitForAuthReady();
    if (cancelled) return;
    const q = query(
      collection(firestore, COLLECTIONS.familyChildren),
      where('rootUid', '==', rootUid),
    );
    unsubscribe = onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChildProfile))),
      () => callback([]),
    );
  })();

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

export async function addChildProfile(
  rootUid: string,
  name: string,
  avatarId: string,
  form: number | null,
): Promise<ChildProfile> {
  const now = Date.now();
  const payload: Omit<ChildProfile, 'id'> = {
    rootUid,
    name,
    avatarId,
    form,
    xp: 0,
    level: 1,
    weekXp: 0,
    weekKey: weekKey(),
    streakDays: 0,
    lastActiveDate: null,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured()) {
    return { id: `local_${now}`, ...payload };
  }
  const ref = await addDoc(collection(firestore, COLLECTIONS.familyChildren), payload);
  return { id: ref.id, ...payload };
}

export async function removeChildProfile(childId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(firestore, COLLECTIONS.familyChildren, childId)).catch(() => {});
}

/** Call after a child profile completes a quiz — awards XP, rolls the streak
 * and weekly-XP bucket forward for the "Family MVP of the week" widget. */
export async function awardChildXp(profile: ChildProfile, xpDelta: number): Promise<void> {
  if (!isFirebaseConfigured() || xpDelta <= 0) return;
  const today = localDateStr();
  const currentWeek = weekKey();

  const sameWeek = profile.weekKey === currentWeek;
  const newXp = profile.xp + xpDelta;
  const isConsecutiveDay =
    profile.lastActiveDate !== null &&
    Date.now() - new Date(profile.lastActiveDate).getTime() <= 2 * 24 * 60 * 60 * 1000;
  const newStreak =
    profile.lastActiveDate === today
      ? profile.streakDays
      : isConsecutiveDay
      ? profile.streakDays + 1
      : 1;

  await updateDoc(doc(firestore, COLLECTIONS.familyChildren, profile.id), {
    xp: newXp,
    level: getLevelFromXp(newXp),
    weekXp: sameWeek ? increment(xpDelta) : xpDelta,
    weekKey: currentWeek,
    streakDays: newStreak,
    lastActiveDate: today,
    updatedAt: Date.now(),
  }).catch(() => {});
}
