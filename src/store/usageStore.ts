import { create } from 'zustand';
import type { DailyUsage, QuizType } from '../types/quiz';
import { FREE_DAILY_LIMITS } from '../types/quiz';
import { getTodayUsage, incrementUsage, checkDailyLimit } from '../services/usageService';

interface UsageStore {
  usage: DailyUsage | null;
  loading: boolean;

  fetchUsage: (userId: string) => Promise<void>;
  // Returns true if user is within the daily limit for this quiz type
  isWithinLimit: (type: QuizType) => boolean;
  // Returns how many uses remain today
  remainingUses: (type: QuizType) => number;
  // Optimistically increments and then persists
  increment: (userId: string, type: QuizType) => Promise<void>;
}

function emptyUsage(): DailyUsage {
  const date = new Date().toISOString().slice(0, 10);
  return {
    id: `_${date}`,
    userId: '',
    date,
    mcqUsed: 0,
    fibUsed: 0,
    tfUsed: 0,
    summaryUsed: 0,
    hoqUsed: 0,
  };
}

export const useUsageStore = create<UsageStore>((set, get) => ({
  usage: null,
  loading: false,

  fetchUsage: async (userId) => {
    set({ loading: true });
    try {
      const usage = await getTodayUsage(userId);
      set({ usage, loading: false });
    } catch {
      set({ usage: emptyUsage(), loading: false });
    }
  },

  isWithinLimit: (type) => {
    const usage = get().usage ?? emptyUsage();
    return checkDailyLimit(usage, type);
  },

  remainingUses: (type) => {
    const usage = get().usage ?? emptyUsage();
    const field = `${type}Used` as 'mcqUsed' | 'fibUsed' | 'tfUsed';
    const used = usage[field];
    return Math.max(0, FREE_DAILY_LIMITS[type] - used);
  },

  increment: async (userId, type) => {
    // Optimistic local update
    set((s) => {
      const current = s.usage ?? emptyUsage();
      const field = `${type}Used` as 'mcqUsed' | 'fibUsed' | 'tfUsed';
      return {
        usage: { ...current, userId, [field]: current[field] + 1 },
      };
    });
    // Persist to Firestore
    await incrementUsage(userId, type).catch(() => {});
  },
}));
