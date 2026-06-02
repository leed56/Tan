import { create } from 'zustand';

interface AppThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
}

export const useAppThemeStore = create<AppThemeStore>((set) => ({
  isDark: true,

  toggle: () => set((state) => ({ isDark: !state.isDark })),

  setDark: (isDark) => set({ isDark }),
}));
