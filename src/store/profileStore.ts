import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, FormLevel, AvatarId } from '../types';

interface ProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  setProfile: (profile: UserProfile | null) => void;
  updateName: (name: string) => void;
  updateForm: (form: FormLevel) => void;
  updateSchool: (school: string | null) => void;
  updateAvatar: (avatarId: AvatarId) => void;
  updateSelectedSubjects: (subjectIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (profile) => set({ profile, loading: false, error: null }),

  updateName: (name) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, name, updatedAt: Date.now() } }
        : state,
    ),

  updateForm: (form) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, form, updatedAt: Date.now() } }
        : state,
    ),

  updateSchool: (school) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, school, updatedAt: Date.now() } }
        : state,
    ),

  updateAvatar: (avatarId) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, avatarId, updatedAt: Date.now() } }
        : state,
    ),

  updateSelectedSubjects: (selectedSubjectIds) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, selectedSubjectIds, updatedAt: Date.now() } }
        : state,
    ),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  clearProfile: () => set({ profile: null, loading: false, error: null }),
    }),
    {
      name: 'soma-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profile: s.profile }),
    },
  ),
);
