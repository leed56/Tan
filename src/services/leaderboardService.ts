import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  where,
  runTransaction,
} from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';
import type { LeaderboardScore } from '../types/gamification';
import { DEMO_LEADERBOARD, AVATARS } from '../constants';
import { weekKey, monthKey } from '../utils/date';

/** Stable school id derived from the free-text school name (no schools table yet). */
function schoolSlug(school: string): string {
  return school.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function demoScores(tab: 'national' | 'school' | 'weekly' | 'monthly'): LeaderboardScore[] {
  return DEMO_LEADERBOARD.map((entry, i) => ({
    id: entry.uid,
    userId: entry.uid,
    name: entry.name,
    avatarId: entry.avatarId,
    form: entry.form,
    school: entry.school,
    totalXp: entry.xp,
    weeklyXp: entry.weeklyXp,
    monthlyXp: entry.weeklyXp * 4,
    rank: i + 1,
    rankChange: Math.floor(Math.random() * 5) - 2,
  }));
}

export type LeaderboardTab = 'national' | 'school' | 'weekly' | 'monthly' | 'friends';

export async function getLeaderboard(
  tab: LeaderboardTab,
  schoolId?: string,
): Promise<LeaderboardScore[]> {
  if (!isFirebaseConfigured()) return demoScores(tab === 'friends' ? 'national' : tab);

  try {
    const sortField =
      tab === 'weekly' ? 'weeklyXp' : tab === 'monthly' ? 'monthlyXp' : 'totalXp';

    let q = query(
      collection(firestore, COLLECTIONS.leaderboardScores),
      orderBy(sortField, 'desc'),
      limit(50),
    );

    if (tab === 'school' && schoolId) {
      q = query(
        collection(firestore, COLLECTIONS.leaderboardScores),
        where('schoolId', '==', schoolId),
        orderBy(sortField, 'desc'),
        limit(30),
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ id: d.id, ...d.data(), rank: i + 1 } as LeaderboardScore));
  } catch {
    return demoScores(tab === 'friends' ? 'national' : tab);
  }
}

export async function updateLeaderboardScore(
  userId: string,
  name: string,
  avatarId: string,
  form: number,
  school: string,
  xpDelta: number,
): Promise<void> {
  if (!isFirebaseConfigured() || xpDelta <= 0) return;
  const ref = doc(firestore, COLLECTIONS.leaderboardScores, userId);
  const wk = weekKey();
  const mk = monthKey();
  try {
    // Transaction so totalXp accumulates and weekly/monthly buckets reset when
    // the week/month rolls over (no scheduled Cloud Function needed).
    await runTransaction(firestore, async (tx) => {
      const snap = await tx.get(ref);
      const d = snap.exists() ? snap.data() : {};
      const totalXp = ((d.totalXp as number) ?? 0) + xpDelta;
      const weeklyXp = (d.weekKey === wk ? ((d.weeklyXp as number) ?? 0) : 0) + xpDelta;
      const monthlyXp = (d.monthKey === mk ? ((d.monthlyXp as number) ?? 0) : 0) + xpDelta;
      tx.set(
        ref,
        {
          userId,
          name,
          avatarId,
          form,
          school,
          schoolId: schoolSlug(school),
          totalXp,
          weeklyXp,
          monthlyXp,
          weekKey: wk,
          monthKey: mk,
          updatedAt: Date.now(),
        },
        { merge: true },
      );
    });
  } catch {}
}
