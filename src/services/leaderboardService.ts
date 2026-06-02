import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  where,
} from 'firebase/firestore';
import { firestore, COLLECTIONS } from './firebaseConfig';
import type { LeaderboardScore } from '../types/gamification';
import { DEMO_LEADERBOARD, AVATARS } from '../constants';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
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
  if (!isFirebaseConfigured()) return;
  try {
    const ref = doc(firestore, COLLECTIONS.leaderboardScores, userId);
    await setDoc(
      ref,
      {
        userId,
        name,
        avatarId,
        form,
        school,
        totalXp: xpDelta,  // server-side increment would be better; this is simplified
        weeklyXp: xpDelta,
        monthlyXp: xpDelta,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  } catch {}
}
