import { useCallback } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebaseConfig';
import { signInWithGoogle as googleSignIn } from '../services/googleAuthService';
import { getUserProfile } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useGamificationStore } from '../store/gamificationStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useFamilyStore } from '../store/familyStore';
import { useQuizStore } from '../store/quizStore';
import type { FirebaseUser } from '../types';

// TODO: Phase 2 — integrate Firebase Auth phone OTP flow
// TODO: Phase 2 — persist auth state with AsyncStorage / SecureStore

// Until real phone auth is wired, back the demo session with a real Firebase
// (anonymous) uid so per-user writes satisfy `request.auth.uid == userId`.
// Skips the network call entirely when Firebase isn't configured — without
// this guard, `signInAnonymously` hangs for a long time against a nonexistent
// project (firebaseConfig.ts substitutes a syntactically-valid dummy config
// so the SDK itself doesn't throw on init, but that also means this call no
// longer fails fast).
async function ensureFirebaseUid(): Promise<string> {
  if (!isFirebaseConfigured()) return 'demo_user_001';
  try {
    if (auth.currentUser) return auth.currentUser.uid;
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch {
    return 'demo_user_001';
  }
}

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

  // __DEV__-only test-mode bypass (see WelcomeScreen's "Enter Test Mode"
  // button). Skips OTP, but still gets a REAL anonymous Firebase Auth token
  // when Firebase is configured and reachable — otherwise Firestore's
  // isSignedIn() rules reject every read, and content that genuinely exists
  // (real curriculum topics, questions, etc.) silently falls back to the
  // tiny local demo dataset instead, which looks like missing content.
  // Time-boxed to 4s so it still resolves instantly with no network at all
  // (this sandbox, CI, offline dev) — it just won't have real data either.
  const enterTestMode = useCallback(async () => {
    const fakeUser: FirebaseUser = {
      uid: 'dev_test_user',
      phoneNumber: '+255700000000',
      displayName: 'Test Student',
      photoURL: null,
    };

    if (!isFirebaseConfigured()) {
      setUser(fakeUser);
      return;
    }

    try {
      const uid = await Promise.race([
        signInAnonymously(auth).then((cred) => cred.user.uid),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]);
      setUser({ ...fakeUser, uid });
    } catch {
      setUser(fakeUser);
    }
  }, [setUser]);

  const handleLogout = useCallback(async () => {
    // TODO: Phase 2 — call Firebase Auth signOut()
    logout();
    clearProfile();
    // Every user-scoped store must reset, or the next account signing in on
    // this device inherits the previous one's premium status, family
    // profiles, XP/streak/badges, and any in-flight quiz session.
    useSubscriptionStore.getState().clear();
    useFamilyStore.getState().clear();
    useGamificationStore.getState().clear();
    useQuizStore.getState().resetSession();
  }, [logout, clearProfile]);

  const sendOtp = useCallback(async (_phoneNumber: string): Promise<void> => {
    // TODO: Phase 2 — call Firebase Auth signInWithPhoneNumber()
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  }, [setLoading]);

  const verifyOtp = useCallback(async (_otp: string): Promise<void> => {
    // TODO: Phase 2 — call Firebase Auth confirmationResult.confirm(otp)
    setLoading(true);
    const uid = await ensureFirebaseUid();
    const demoUser: FirebaseUser = {
      uid,
      phoneNumber: '+255712345678',
      displayName: null,
      photoURL: null,
    };
    setUser(demoUser);
    setLoading(false);
  }, [setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    setError,
    enterTestMode,
    signInWithGoogle,
    logout: handleLogout,
    sendOtp,
    verifyOtp,
  };
}
