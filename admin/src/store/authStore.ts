import { create } from 'zustand';
import type { AdminUser } from '../types';

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
