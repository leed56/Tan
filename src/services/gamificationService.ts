import { doc, getDoc, setDoc, collection, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured, waitForAuthReady } from './firebaseConfig';
import type { GamificationProfile, XPSource, CoinSource, BadgeId } from '../types/gamification';
import { XP_REWARDS, COIN_REWARDS, STREAK_MILESTONES } from '../types/gamification';
import { getLevelFromXp } from '../utils/xpUtils';
import { SEED_BADGES } from '../utils/seedBadges';
import { localDateStr } from '../utils/date';

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
  // No catch-all → emptyProfile here: this getter's result is cached by the
  // store and later persisted with a full-document write, so returning zeros
  // on a transient failure would eventually OVERWRITE the user's real
  // xp/coins/streak in Firestore. Let failures throw; the store keeps its
  // previous state and the hydration flag stays false.
  await waitForAuthReady();
  const ref = doc(firestore, COLLECTIONS.gamification, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile = emptyProfile(uid);
    await setDoc(ref, profile).catch(() => {});
    return profile;
  }
  return snap.data() as GamificationProfile;
}

export async function saveGamificationProfile(profile: GamificationProfile): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await waitForAuthReady();
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
  // Local calendar day, same as todayStr()/lastStudyDate — computing this in
  // UTC broke streak continuity for anyone studying between 00:00–03:00 EAT.
  const yesterday = localDateStr(new Date(Date.now() - 86400000));

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

// Accumulate lifetime quiz stats onto the profile — the source of truth for
// the 'first_quiz' badge and the Profile screen's Quick Stats.
export function recordQuizStats(
  profile: GamificationProfile,
  result: { totalQuestions: number; correctCount: number },
): GamificationProfile {
  return {
    ...profile,
    totalQuizzes: profile.totalQuizzes + 1,
    totalQuestions: profile.totalQuestions + result.totalQuestions,
    totalCorrect: profile.totalCorrect + result.correctCount,
    updatedAt: Date.now(),
  };
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
  await waitForAuthReady().catch(() => {});
  for (const badgeId of badgeIds) {
    // Deterministic id makes re-awards idempotent: user_badges rules forbid
    // updates, so a second attempt for the same badge is rejected instead of
    // creating a duplicate doc (which addDoc did whenever the earned-badge
    // list had been fetched pre-auth as empty).
    await setDoc(doc(firestore, COLLECTIONS.userBadges, `${uid}_${badgeId}`), {
      userId: uid,
      badgeId,
      earnedAt: Date.now(),
    }).catch(() => {});
  }
}

export async function getUserBadgeIds(uid: string): Promise<BadgeId[]> {
  if (!isFirebaseConfigured()) return [];
  // Throws on failure (no [] fallback): a cached-empty earned list makes
  // checkBadges re-award old badges — duplicate XP popups and inflated counts.
  await waitForAuthReady();
  const snap = await getDocs(
    query(collection(firestore, COLLECTIONS.userBadges), where('userId', '==', uid)),
  );
  return snap.docs.map((d) => d.data().badgeId as BadgeId);
}

export { SEED_BADGES };
