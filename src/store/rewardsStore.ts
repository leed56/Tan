import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reward boxes are claimable on a cooldown, not once-per-mount: the daily box
// once per calendar day, the weekly/epic boxes once per ISO week. Claims are
// persisted so re-opening the screen (or alternating between boxes) can't be
// farmed for unlimited coins.
const dayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = () => {
  const d = new Date();
  // ISO week number
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${week}`;
};

const periodKeyFor = (boxId: string) => (boxId === 'daily_box' ? dayKey() : weekKey());

interface RewardsStore {
  // boxId -> period key it was last claimed in
  claimed: Record<string, string>;
  isClaimed: (boxId: string) => boolean;
  markClaimed: (boxId: string) => void;
}

export const useRewardsStore = create<RewardsStore>()(
  persist(
    (set, get) => ({
      claimed: {},
      isClaimed: (boxId) => get().claimed[boxId] === periodKeyFor(boxId),
      markClaimed: (boxId) =>
        set((s) => ({ claimed: { ...s.claimed, [boxId]: periodKeyFor(boxId) } })),
    }),
    {
      name: 'soma-rewards',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
