import { create } from 'zustand';
import type { LeaderboardScore } from '../types/gamification';
import { getLeaderboard } from '../services/leaderboardService';
import type { LeaderboardTab } from '../services/leaderboardService';

interface LeaderboardStore {
  data: Record<LeaderboardTab, LeaderboardScore[]>;
  loading: boolean;
  activeTab: LeaderboardTab;

  fetchLeaderboard: (tab: LeaderboardTab, schoolId?: string) => Promise<void>;
  setTab: (tab: LeaderboardTab) => void;
}

const EMPTY: Record<LeaderboardTab, LeaderboardScore[]> = {
  national: [], school: [], weekly: [], monthly: [], friends: [],
};

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  data: EMPTY,
  loading: false,
  activeTab: 'national',

  fetchLeaderboard: async (tab, schoolId) => {
    if ((get().data[tab]?.length ?? 0) > 0) return; // cached
    set({ loading: true });
    try {
      const scores = await getLeaderboard(tab, schoolId);
      set((s) => ({ data: { ...s.data, [tab]: scores }, loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  setTab: (tab) => set({ activeTab: tab }),
}));
