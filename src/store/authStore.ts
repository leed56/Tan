import { create } from 'zustand';
import type { FirebaseUser } from '../types';

interface AuthStore {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null, error: null }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  logout: () =>
    set({ user: null, isAuthenticated: false, loading: false, error: null }),
}));
