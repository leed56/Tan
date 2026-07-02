import { create } from 'zustand';
import type { GamificationProfile, BadgeId, XPSource } from '../types/gamification';
import { COIN_REWARDS } from '../types/gamification';
import { getLevelFromXp } from '../utils/xpUtils';
import {
  getGamificationProfile,
  saveGamificationProfile,
  applyXP,
  applyCoins,
  updateStreak,
  checkBadgeUnlocks,
  recordQuizStats,
  saveUserBadges,
  getUserBadgeIds,
} from '../services/gamificationService';
import { SEED_BADGES } from '../utils/seedBadges';
import type { BadgeDefinition } from '../types/gamification';
import { useAuthStore } from './authStore';

interface GamificationStore {
  // Core state — kept compatible with Phase 1–4 callers
  xp: number;
  level: number;
  streak: number;
  coins: number;
  badges: BadgeDefinition[];
  earnedBadgeIds: BadgeId[];

  // Pending notifications (level-up / badge unlock modals)
  pendingLevelUp: number | null;
  pendingBadges: BadgeDefinition[];

  loading: boolean;
  profile: GamificationProfile | null;
  // True only after a successful server fetch this session. Remote persists
  // are gated on it: writing a never-hydrated (zero-based) profile with a
  // full-document setDoc would destroy the user's accumulated xp/streak.
  hydrated: boolean;

  // Phase 1-compatible API
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  completePackXp: () => void;
  correctAnswerXp: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setGamification: (xp: number, streak: number, coins: number) => void;

  // Phase 5 API
  fetchProfile: (uid: string) => Promise<void>;
  awardXP: (uid: string, source: XPSource) => Promise<void>;
  awardCoins: (uid: string, source: keyof typeof COIN_REWARDS) => void;
  checkStreak: (uid: string) => Promise<number[]>;
  checkBadges: (
    uid: string,
    context: {
      quizScorePercent?: number;
      subjectKey?: string;
      isPremium?: boolean;
      totalQuestions?: number;
      correctCount?: number;
    },
  ) => BadgeId[];
  dismissLevelUp: () => void;
  dismissBadge: () => void;
  persistProfile: (uid: string) => Promise<void>;
  persistIfSignedIn: () => void;
  clear: () => void;
}

function buildLocal(xp: number, streak: number, coins: number): GamificationProfile {
  return {
    uid: 'local',
    xp, level: getLevelFromXp(xp), coins,
    currentStreak: streak, longestStreak: streak,
    lastStudyDate: null, totalQuizzes: 0,
    totalCorrect: 0, totalQuestions: 0,
    updatedAt: Date.now(),
  };
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  xp: 0,
  level: getLevelFromXp(0),
  streak: 0,
  coins: 0,
  badges: SEED_BADGES,
  earnedBadgeIds: [] as BadgeId[],
  pendingLevelUp: null,
  pendingBadges: [],
  loading: false,
  profile: null,
  hydrated: false,

  // ─── Phase 1-compatible ────────────────────────────────────────────────────
  addXp: (amount) => {
    set((s) => {
      const newXp = s.xp + amount;
      const newLevel = getLevelFromXp(newXp);
      const leveledUp = newLevel > s.level;
      const uid = useAuthStore.getState().user?.uid;
      const profile: GamificationProfile = {
        ...(s.profile ?? buildLocal(s.xp, s.streak, s.coins)),
        uid: uid ?? s.profile?.uid ?? 'local',
        xp: newXp,
        level: newLevel,
        updatedAt: Date.now(),
      };
      return {
        xp: newXp,
        level: newLevel,
        pendingLevelUp: leveledUp ? newLevel : s.pendingLevelUp,
        profile,
      };
    });
    get().persistIfSignedIn();
  },

  addCoins: (amount) => {
    set((s) => {
      const newCoins = s.coins + amount;
      const uid = useAuthStore.getState().user?.uid;
      const profile: GamificationProfile = {
        ...(s.profile ?? buildLocal(s.xp, s.streak, s.coins)),
        uid: uid ?? s.profile?.uid ?? 'local',
        coins: newCoins,
        updatedAt: Date.now(),
      };
      return { coins: newCoins, profile };
    });
    get().persistIfSignedIn();
  },

  completePackXp: () => {
    get().addXp(100);
    get().addCoins(COIN_REWARDS.pack_complete);
  },

  correctAnswerXp: () => get().addXp(10),

  incrementStreak: () =>
    set((s) => ({ streak: s.streak + 1 })),

  resetStreak: () => set({ streak: 0 }),

  setGamification: (xp, streak, coins) =>
    set({ xp, level: getLevelFromXp(xp), streak, coins }),

  // ─── Phase 5 ──────────────────────────────────────────────────────────────
  fetchProfile: async (uid) => {
    set({ loading: true });
    try {
      const [profile, earnedBadgeIds] = await Promise.all([
        getGamificationProfile(uid),
        getUserBadgeIds(uid),
      ]);
      set({
        xp: profile.xp, level: profile.level, streak: profile.currentStreak, coins: profile.coins,
        profile, earnedBadgeIds, loading: false, hydrated: true,
      });
    } catch {
      // Fetch failed (offline / pre-auth) — keep previous state and leave
      // hydrated false so nothing zero-based gets persisted over real data.
      set({ loading: false });
    }
  },

  awardXP: async (uid, source) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const { profile: updated, leveledUp, newLevel } = applyXP(base, source);
    set({ xp: updated.xp, level: updated.level, profile: updated, pendingLevelUp: leveledUp ? newLevel : s.pendingLevelUp });
    if (get().hydrated) await saveGamificationProfile({ ...updated, uid }).catch(() => {});
  },

  awardCoins: (uid, source) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const updated = applyCoins(base, source);
    set({ coins: updated.coins, profile: updated });
    if (get().hydrated) saveGamificationProfile({ ...updated, uid }).catch(() => {});
  },

  checkStreak: async (uid) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const { profile: updated, milestonesHit } = updateStreak(base);
    set({ xp: updated.xp, level: updated.level, streak: updated.currentStreak, coins: updated.coins, profile: updated });
    if (get().hydrated) await saveGamificationProfile({ ...updated, uid }).catch(() => {});
    return milestonesHit;
  },

  checkBadges: (uid, context) => {
    const s = get();
    let base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    if (context.totalQuestions !== undefined) {
      base = recordQuizStats(base, {
        totalQuestions: context.totalQuestions,
        correctCount: context.correctCount ?? 0,
      });
      set({ profile: base });
      if (get().hydrated) saveGamificationProfile({ ...base, uid }).catch(() => {});
    }
    const newIds = checkBadgeUnlocks(base, s.earnedBadgeIds, context);
    if (newIds.length === 0) return [];
    const newBadgeDefs = SEED_BADGES.filter((b) => newIds.includes(b.id));
    set((prev) => ({
      earnedBadgeIds: [...prev.earnedBadgeIds, ...newIds] as BadgeId[],
      pendingBadges: [...prev.pendingBadges, ...newBadgeDefs],
    }));
    saveUserBadges(uid, newIds).catch(() => {});
    return newIds;
  },

  dismissLevelUp: () => set({ pendingLevelUp: null }),
  dismissBadge: () => set((s) => ({ pendingBadges: s.pendingBadges.slice(1) })),

  persistProfile: async (uid) => {
    const s = get();
    if (!s.profile || !s.hydrated) return;
    await saveGamificationProfile({ ...s.profile, uid }).catch(() => {});
  },

  // Persist the current profile to Firestore when a real user is signed in.
  // Fire-and-forget so XP/coin awards in the quiz screens survive restart.
  persistIfSignedIn: () => {
    const uid = useAuthStore.getState().user?.uid;
    const s = get();
    if (!uid || !s.profile || !s.hydrated) return;
    saveGamificationProfile({ ...s.profile, uid }).catch(() => {});
  },

  // Drop everything user-scoped on logout so the next account doesn't
  // inherit this one's XP/streak/badges (hydrated=false re-arms the
  // zero-profile write guard for the next sign-in).
  clear: () =>
    set({
      xp: 0, level: getLevelFromXp(0), streak: 0, coins: 0,
      earnedBadgeIds: [] as BadgeId[], pendingLevelUp: null, pendingBadges: [],
      loading: false, profile: null, hydrated: false,
    }),
}));
