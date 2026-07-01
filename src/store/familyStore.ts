import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChildProfile } from '../types/subscription';
import {
  subscribeToChildProfiles,
  addChildProfile,
  removeChildProfile,
  awardChildXp,
} from '../services/familyService';

interface FamilyStore {
  profiles: ChildProfile[];
  loading: boolean;
  activeChildId: string | null;
  unsubscribe: (() => void) | null;

  startListening: (rootUid: string) => void;
  stopListening: () => void;
  addProfile: (
    rootUid: string,
    name: string,
    avatarId: string,
    form: number | null,
  ) => Promise<void>;
  removeProfile: (childId: string) => Promise<void>;
  /** "Playing as" — switches the active profile without a second login. */
  switchToChild: (childId: string) => void;
  switchToPrimary: () => void;
  activeChild: () => ChildProfile | null;
  /** Routes quiz XP to the active child's aggregate record instead of the
   * parent's own gamification profile, keeping each family member's progress
   * distinct. No-op when playing as the primary account. */
  creditXp: (xpEarned: number) => Promise<void>;
  clear: () => void;
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      loading: false,
      activeChildId: null,
      unsubscribe: null,

      startListening: (rootUid) => {
        get().unsubscribe?.();
        set({ loading: true });
        const unsubscribe = subscribeToChildProfiles(rootUid, (profiles) => {
          set({ profiles, loading: false });
        });
        set({ unsubscribe });
      },

      stopListening: () => {
        get().unsubscribe?.();
        set({ unsubscribe: null });
      },

      addProfile: async (rootUid, name, avatarId, form) => {
        // Optimistic: the family_children onSnapshot listener will reconcile
        // this once the write reaches Firestore, but updating local state
        // immediately means the new profile shows up even on a slow/offline
        // connection instead of waiting indefinitely on the listener.
        const profile = await addChildProfile(rootUid, name, avatarId, form);
        set((s) => (s.profiles.some((p) => p.id === profile.id) ? s : { profiles: [...s.profiles, profile] }));
      },

      removeProfile: async (childId) => {
        set((s) => ({ profiles: s.profiles.filter((p) => p.id !== childId) }));
        await removeChildProfile(childId);
        if (get().activeChildId === childId) set({ activeChildId: null });
      },

      switchToChild: (childId) => set({ activeChildId: childId }),
      switchToPrimary: () => set({ activeChildId: null }),

      activeChild: () => {
        const { profiles, activeChildId } = get();
        return profiles.find((p) => p.id === activeChildId) ?? null;
      },

      creditXp: async (xpEarned) => {
        const child = get().activeChild();
        if (child) await awardChildXp(child, xpEarned);
      },

      clear: () => {
        get().unsubscribe?.();
        set({ profiles: [], activeChildId: null, unsubscribe: null });
      },
    }),
    {
      name: 'soma-family',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ activeChildId: s.activeChildId }),
    },
  ),
);
