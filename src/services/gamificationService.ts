import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { firestore, COLLECTIONS } from './firebaseConfig';
import type { GamificationProfile, XPSource, CoinSource, BadgeId } from '../types/gamification';
import { XP_REWARDS, COIN_REWARDS, STREAK_MILESTONES } from '../types/gamification';
import { getLevelFromXp } from '../utils/xpUtils';
import { SEED_BADGES } from '../utils/seedBadges';
import { localDateStr } from '../utils/date';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

function todayStr(): string {
  return localDateStr();
}

function emptyProfile(uid: string): GamificationProfile {
  return {
    uid,
    xp: 0,
    level: 1,
    coins: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalQuizzes: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    updatedAt: Date.now(),
  };
}

export async function getGamificationProfile(uid: string): Promise<GamificationProfile> {
  if (!isFirebaseConfigured()) return emptyProfile(uid);
  try {
    const ref = doc(firestore, COLLECTIONS.gamification, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const profile = emptyProfile(uid);
      await setDoc(ref, profile).catch(() => {});
      return profile;
    }
    return snap.data() as GamificationProfile;
  } catch {
    return emptyProfile(uid);
  }
}

export async function saveGamificationProfile(profile: GamificationProfile): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(doc(firestore, COLLECTIONS.gamification, profile.uid), {
      ...profile,
      updatedAt: Date.now(),
    });
  } catch {}
}

// Returns new XP total and whether a level-up occurred
export function applyXP(
  profile: GamificationProfile,
  source: XPSource,
): { profile: GamificationProfile; leveledUp: boolean; newLevel: number } {
  const amount = XP_REWARDS[source];
  const oldLevel = profile.level;
  const newXp = profile.xp + amount;
  const newLevel = getLevelFromXp(newXp);
  return {
    profile: { ...profile, xp: newXp, level: newLevel, updatedAt: Date.now() },
    leveledUp: newLevel > oldLevel,
    newLevel,
  };
}

export function applyCoins(
  profile: GamificationProfile,
  source: CoinSource,
): GamificationProfile {
  return { ...profile, coins: profile.coins + COIN_REWARDS[source], updatedAt: Date.now() };
}

export function applyCustomXP(
  profile: GamificationProfile,
  amount: number,
): { profile: GamificationProfile; leveledUp: boolean; newLevel: number } {
  const oldLevel = profile.level;
  const newXp = profile.xp + amount;
  const newLevel = getLevelFromXp(newXp);
  return {
    profile: { ...profile, xp: newXp, level: newLevel, updatedAt: Date.now() },
    leveledUp: newLevel > oldLevel,
    newLevel,
  };
}

// Returns the updated profile + any streak milestone hit
export function updateStreak(
  profile: GamificationProfile,
): { profile: GamificationProfile; milestonesHit: number[] } {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let currentStreak = profile.currentStreak;
  if (profile.lastStudyDate === today) {
    // Already studied today, no change
    return { profile, milestonesHit: [] };
  } else if (profile.lastStudyDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const longestStreak = Math.max(currentStreak, profile.longestStreak);
  const milestonesHit = STREAK_MILESTONES.filter(
    (m) => currentStreak === m,
  );

  let updated: GamificationProfile = {
    ...profile,
    currentStreak,
    longestStreak,
    lastStudyDate: today,
    updatedAt: Date.now(),
  };

  // Apply streak milestone rewards
  for (const _ of milestonesHit) {
    updated = { ...updated, xp: updated.xp + XP_REWARDS.streak_milestone, coins: updated.coins + COIN_REWARDS.streak_milestone };
    updated = { ...updated, level: getLevelFromXp(updated.xp) };
  }

  return { profile: updated, milestonesHit };
}

// Check which badges the user just earned
export function checkBadgeUnlocks(
  profile: GamificationProfile,
  earnedBadgeIds: BadgeId[],
  context: {
    quizScorePercent?: number;
    subjectKey?: string;
    isPremium?: boolean;
  },
): BadgeId[] {
  const newlyEarned: BadgeId[] = [];

  if (!earnedBadgeIds.includes('first_quiz') && profile.totalQuizzes >= 1) {
    newlyEarned.push('first_quiz');
  }
  if (!earnedBadgeIds.includes('first_perfect') && (context.quizScorePercent ?? 0) === 100) {
    newlyEarned.push('first_perfect');
  }
  if (!earnedBadgeIds.includes('streak_3') && profile.currentStreak >= 3) {
    newlyEarned.push('streak_3');
  }
  if (!earnedBadgeIds.includes('streak_7') && profile.currentStreak >= 7) {
    newlyEarned.push('streak_7');
  }
  if (!earnedBadgeIds.includes('math_starter') && context.subjectKey === 'mathematics') {
    newlyEarned.push('math_starter');
  }
  if (!earnedBadgeIds.includes('premium_learner') && context.isPremium) {
    newlyEarned.push('premium_learner');
  }

  return newlyEarned;
}

export async function saveUserBadges(uid: string, badgeIds: BadgeId[]): Promise<void> {
  if (!isFirebaseConfigured() || badgeIds.length === 0) return;
  try {
    for (const badgeId of badgeIds) {
      await addDoc(collection(firestore, COLLECTIONS.userBadges), {
        userId: uid,
        badgeId,
        earnedAt: Date.now(),
      });
    }
  } catch {}
}

export { SEED_BADGES };
