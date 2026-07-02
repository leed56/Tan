import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured, waitForAuthReady } from './firebaseConfig';
import type { UserDailyMission, MissionType } from '../types/gamification';
import { DAILY_MISSIONS } from '../utils/seedBadges';
import { localDateStr } from '../utils/date';

function todayStr(): string {
  return localDateStr();
}

function buildMissions(userId: string, date: string): UserDailyMission[] {
  return DAILY_MISSIONS.map((m) => ({
    id: `${userId}_${date}_${m.id}`,
    userId,
    missionId: m.id,
    date,
    progress: 0,
    isCompleted: false,
    claimedAt: null,
  }));
}

export async function getTodayMissions(userId: string): Promise<UserDailyMission[]> {
  const today = todayStr();
  if (!isFirebaseConfigured()) return buildMissions(userId, today);
  try {
    await waitForAuthReady();
    const q = query(
      collection(firestore, COLLECTIONS.userDailyMissions),
      where('userId', '==', userId),
      where('date', '==', today),
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      const missions = buildMissions(userId, today);
      for (const m of missions) {
        await setDoc(doc(firestore, COLLECTIONS.userDailyMissions, m.id), m).catch(() => {});
      }
      return missions;
    }
    return snap.docs.map((d) => d.data() as UserDailyMission);
  } catch {
    return buildMissions(userId, today);
  }
}

export async function updateMissionProgress(
  userId: string,
  type: MissionType,
  incrementBy: number,
): Promise<UserDailyMission[]> {
  const today = todayStr();
  if (!isFirebaseConfigured()) return buildMissions(userId, today);
  try {
    await waitForAuthReady();
    const q = query(
      collection(firestore, COLLECTIONS.userDailyMissions),
      where('userId', '==', userId),
      where('date', '==', today),
    );
    const snap = await getDocs(q);
    const missions = snap.docs.map((d) => d.data() as UserDailyMission);

    for (const mission of missions) {
      const def = DAILY_MISSIONS.find((m) => m.id === mission.missionId);
      if (!def || def.type !== type || mission.isCompleted) continue;

      const newProgress = Math.min(mission.progress + incrementBy, def.targetCount);
      const isCompleted = newProgress >= def.targetCount;
      const updated: UserDailyMission = {
        ...mission,
        progress: newProgress,
        isCompleted,
      };
      await setDoc(doc(firestore, COLLECTIONS.userDailyMissions, mission.id), updated).catch(() => {});
    }

    return getTodayMissions(userId);
  } catch {
    return buildMissions(userId, today);
  }
}

export async function claimMission(userId: string, missionId: string): Promise<void> {
  const today = todayStr();
  const docId = `${userId}_${today}_${missionId}`;
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(
      doc(firestore, COLLECTIONS.userDailyMissions, docId),
      { claimedAt: Date.now() },
      { merge: true },
    );
  } catch {}
}

export { DAILY_MISSIONS };
