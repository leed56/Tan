import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseUser } from '../types';

interface AuthStore {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;

  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      hasHydrated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null, error: null }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),

      setHasHydrated: (v) => set({ hasHydrated: v }),

      logout: () =>
        set({ user: null, isAuthenticated: false, loading: false, error: null }),
    }),
    {
      name: 'soma-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the session identity is durable; transient flags are not persisted.
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
