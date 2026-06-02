import { create } from 'zustand';
import type { UserDailyMission, MissionType } from '../types/gamification';
import { getTodayMissions, updateMissionProgress, claimMission, DAILY_MISSIONS } from '../services/missionService';

interface MissionStore {
  missions: UserDailyMission[];
  loading: boolean;

  fetchMissions: (userId: string) => Promise<void>;
  updateProgress: (userId: string, type: MissionType, amount: number) => Promise<void>;
  claim: (userId: string, missionId: string) => Promise<void>;

  // Computed: how many missions completed today
  completedCount: () => number;
  progressFor: (missionId: string) => { progress: number; target: number; isCompleted: boolean; claimed: boolean };
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  missions: [],
  loading: false,

  fetchMissions: async (userId) => {
    set({ loading: true });
    try {
      const missions = await getTodayMissions(userId);
      set({ missions, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateProgress: async (userId, type, amount) => {
    // Optimistic local update
    set((s) => ({
      missions: s.missions.map((m) => {
        const def = DAILY_MISSIONS.find((d) => d.id === m.missionId);
        if (!def || def.type !== type || m.isCompleted) return m;
        const newProgress = Math.min(m.progress + amount, def.targetCount);
        return { ...m, progress: newProgress, isCompleted: newProgress >= def.targetCount };
      }),
    }));
    try {
      const updated = await updateMissionProgress(userId, type, amount);
      set({ missions: updated });
    } catch {}
  },

  claim: async (userId, missionId) => {
    set((s) => ({
      missions: s.missions.map((m) =>
        m.missionId === missionId ? { ...m, claimedAt: Date.now() } : m,
      ),
    }));
    await claimMission(userId, missionId).catch(() => {});
  },

  completedCount: () =>
    get().missions.filter((m) => m.isCompleted).length,

  progressFor: (missionId) => {
    const mission = get().missions.find((m) => m.missionId === missionId);
    const def = DAILY_MISSIONS.find((d) => d.id === missionId);
    if (!mission || !def) return { progress: 0, target: def?.targetCount ?? 1, isCompleted: false, claimed: false };
    return {
      progress: mission.progress,
      target: def.targetCount,
      isCompleted: mission.isCompleted,
      claimed: mission.claimedAt !== null,
    };
  },
}));
