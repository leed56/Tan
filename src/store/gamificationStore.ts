import { create } from 'zustand';
import { getLevelFromXp } from '../utils';
import { XP_PER_CORRECT_ANSWER, XP_PER_PACK_COMPLETION, STREAK_BONUS_XP } from '../constants';

interface GamificationStore {
  xp: number;
  level: number;
  streak: number;
  coins: number; // TODO: Phase 2 — implement coin economy & shop

  addXp: (amount: number) => void;
  completePackXp: () => void;
  correctAnswerXp: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addCoins: (amount: number) => void;
  setGamification: (xp: number, streak: number, coins: number) => void;
}

export const useGamificationStore = create<GamificationStore>((set) => ({
  xp: 1240,
  level: getLevelFromXp(1240),
  streak: 5,
  coins: 120,

  addXp: (amount) =>
    set((state) => {
      const newXp = state.xp + amount;
      return { xp: newXp, level: getLevelFromXp(newXp) };
    }),

  completePackXp: () =>
    set((state) => {
      const newXp = state.xp + XP_PER_PACK_COMPLETION;
      return { xp: newXp, level: getLevelFromXp(newXp) };
    }),

  correctAnswerXp: () =>
    set((state) => {
      const newXp = state.xp + XP_PER_CORRECT_ANSWER;
      return { xp: newXp, level: getLevelFromXp(newXp) };
    }),

  incrementStreak: () =>
    set((state) => {
      const newStreak = state.streak + 1;
      const bonusXp = newStreak % 7 === 0 ? STREAK_BONUS_XP * 2 : STREAK_BONUS_XP;
      const newXp = state.xp + bonusXp;
      return { streak: newStreak, xp: newXp, level: getLevelFromXp(newXp) };
    }),

  resetStreak: () => set({ streak: 0 }),

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  setGamification: (xp, streak, coins) =>
    set({ xp, level: getLevelFromXp(xp), streak, coins }),
}));
