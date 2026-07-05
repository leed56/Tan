import { useCallback } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebaseConfig';
import { signInWithGoogle as googleSignIn } from '../services/googleAuthService';
import { getUserProfile } from '../services/userService';
import { resetDemoPremium } from '../services/subscriptionService';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useGamificationStore } from '../store/gamificationStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useFamilyStore } from '../store/familyStore';
import { useQuizStore } from '../store/quizStore';

// TODO: Phase 2 — persist auth state with AsyncStorage / SecureStore

export function useAuth() {
  const { user, isAuthenticated, loading, error, setUser, setLoading, setError, logout } =
    useAuthStore();
  const { clearProfile, setProfile } = useProfileStore();

  // Google sign-in (web). On success this also hydrates an existing profile so
  // returning users land straight in the app; new users get { isNewUser: true }
  // so the caller can route them to Create Profile.
  const signInWithGoogle = useCallback(async (): Promise<{ isNewUser: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const gUser = await googleSignIn();
      const existing = await getUserProfile(gUser.uid);
      setUser(gUser);
      if (existing && existing.selectedSubjectIds.length > 0) {
        setProfile(existing);
        return { isNewUser: false };
      }
      return { isNewUser: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed. Please try again.';
      // A user closing the popup isn't an error worth shouting about.
      if (!/popup-closed|cancelled|closed by user/i.test(msg)) setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [setUser, setProfile, setLoading, setError]);

  const handleLogout = useCallback(async () => {
    // Must actually end the Firebase session — Google sign-in creates a real,
    // persistent auth.currentUser. Without this, the app's own UI shows
    // "logged out" while Firestore rules (and re-picking the same Google
    // account) still resolve to the previous identity.
    if (isFirebaseConfigured()) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // Best-effort — don't block local logout on a network/SDK failure.
      }
    }
    logout();
    clearProfile();
    // Every user-scoped store must reset, or the next account signing in on
    // this device inherits the previous one's premium status, family
    // profiles, XP/streak/badges, and any in-flight quiz session.
    useSubscriptionStore.getState().clear();
    resetDemoPremium(); // module-level flag, not store state — clear() can't reach it
    useFamilyStore.getState().clear();
    useGamificationStore.getState().clear();
    useQuizStore.getState().resetSession();
  }, [logout, clearProfile]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    setError,
    signInWithGoogle,
    logout: handleLogout,
  };
}
