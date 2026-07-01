import { useCallback } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useGamificationStore } from '../store/gamificationStore';
import type { FirebaseUser } from '../types';

// TODO: Phase 2 — integrate Firebase Auth phone OTP flow
// TODO: Phase 2 — persist auth state with AsyncStorage / SecureStore

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

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
  const { clearProfile } = useProfileStore();

  const loginDemo = useCallback(async () => {
    setLoading(true);
    const uid = await ensureFirebaseUid();
    const demoUser: FirebaseUser = {
      uid,
      phoneNumber: '+255712345678',
      displayName: 'Amara Student',
      photoURL: null,
    };
    setUser(demoUser);
    setLoading(false);
  }, [setUser, setLoading]);

  // __DEV__-only test-mode bypass (see WelcomeScreen's "Enter Test Mode"
  // button). Deliberately skips ensureFirebaseUid()/signInAnonymously — test
  // mode must resolve instantly and work with no network reachable at all,
  // not just no real OTP. Firestore writes made under this uid will be
  // rejected by rules (no matching auth.uid token), which is fine: it's for
  // exercising every screen's UI, not persisting real data.
  const enterTestMode = useCallback(() => {
    setUser({
      uid: 'dev_test_user',
      phoneNumber: '+255700000000',
      displayName: 'Test Student',
      photoURL: null,
    });
  }, [setUser]);

  const handleLogout = useCallback(async () => {
    // TODO: Phase 2 — call Firebase Auth signOut()
    logout();
    clearProfile();
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
    loginDemo,
    enterTestMode,
    logout: handleLogout,
    sendOtp,
    verifyOtp,
  };
}
