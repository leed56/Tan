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
} from '../services/gamificationService';
import { SEED_BADGES } from '../utils/seedBadges';
import type { BadgeDefinition } from '../types/gamification';

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
  checkBadges: (context: { quizScorePercent?: number; subjectKey?: string; isPremium?: boolean }) => BadgeId[];
  dismissLevelUp: () => void;
  dismissBadge: () => void;
  persistProfile: (uid: string) => Promise<void>;
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
  xp: 1240,
  level: getLevelFromXp(1240),
  streak: 5,
  coins: 120,
  badges: SEED_BADGES,
  earnedBadgeIds: ['first_quiz', 'streak_3'] as BadgeId[],
  pendingLevelUp: null,
  pendingBadges: [],
  loading: false,
  profile: null,

  // ─── Phase 1-compatible ────────────────────────────────────────────────────
  addXp: (amount) =>
    set((s) => {
      const newXp = s.xp + amount;
      const newLevel = getLevelFromXp(newXp);
      const leveledUp = newLevel > s.level;
      return {
        xp: newXp,
        level: newLevel,
        pendingLevelUp: leveledUp ? newLevel : s.pendingLevelUp,
        profile: s.profile ? { ...s.profile, xp: newXp, level: newLevel } : null,
      };
    }),

  addCoins: (amount) =>
    set((s) => ({
      coins: s.coins + amount,
      profile: s.profile ? { ...s.profile, coins: s.coins + amount } : null,
    })),

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
      const profile = await getGamificationProfile(uid);
      set({ xp: profile.xp, level: profile.level, streak: profile.currentStreak, coins: profile.coins, profile, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  awardXP: async (uid, source) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const { profile: updated, leveledUp, newLevel } = applyXP(base, source);
    set({ xp: updated.xp, level: updated.level, profile: updated, pendingLevelUp: leveledUp ? newLevel : s.pendingLevelUp });
    await saveGamificationProfile({ ...updated, uid }).catch(() => {});
  },

  awardCoins: (uid, source) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const updated = applyCoins(base, source);
    set({ coins: updated.coins, profile: updated });
    saveGamificationProfile({ ...updated, uid }).catch(() => {});
  },

  checkStreak: async (uid) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const { profile: updated, milestonesHit } = updateStreak(base);
    set({ xp: updated.xp, level: updated.level, streak: updated.currentStreak, coins: updated.coins, profile: updated });
    await saveGamificationProfile({ ...updated, uid }).catch(() => {});
    return milestonesHit;
  },

  checkBadges: (context) => {
    const s = get();
    const base = s.profile ?? buildLocal(s.xp, s.streak, s.coins);
    const newIds = checkBadgeUnlocks(base, s.earnedBadgeIds, context);
    if (newIds.length === 0) return [];
    const newBadgeDefs = SEED_BADGES.filter((b) => newIds.includes(b.id));
    set((prev) => ({
      earnedBadgeIds: [...prev.earnedBadgeIds, ...newIds] as BadgeId[],
      pendingBadges: [...prev.pendingBadges, ...newBadgeDefs],
    }));
    return newIds;
  },

  dismissLevelUp: () => set({ pendingLevelUp: null }),
  dismissBadge: () => set((s) => ({ pendingBadges: s.pendingBadges.slice(1) })),

  persistProfile: async (uid) => {
    const s = get();
    if (!s.profile) return;
    await saveGamificationProfile({ ...s.profile, uid }).catch(() => {});
  },
}));
