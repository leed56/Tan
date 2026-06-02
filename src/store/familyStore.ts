import { create } from 'zustand';
import type { FamilyProfile } from '../types/subscription';
import { getFamilyProfiles, addFamilyMember } from '../services/subscriptionService';

interface FamilyStore {
  profiles: FamilyProfile[];
  loading: boolean;
  error: string | null;

  fetchProfiles: (ownerId: string) => Promise<void>;
  addMember: (
    ownerId: string,
    name: string,
    phone: string | null,
    form: number | null,
  ) => Promise<void>;
  clear: () => void;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  profiles: [],
  loading: false,
  error: null,

  fetchProfiles: async (ownerId) => {
    set({ loading: true, error: null });
    try {
      const profiles = await getFamilyProfiles(ownerId);
      set({ profiles, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addMember: async (ownerId, name, phone, form) => {
    set({ loading: true, error: null });
    try {
      const profile = await addFamilyMember(ownerId, name, phone, form);
      set((s) => ({ profiles: [...s.profiles, profile], loading: false }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  clear: () => set({ profiles: [], error: null }),
}));
