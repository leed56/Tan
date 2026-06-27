import { useCallback } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useGamificationStore } from '../store/gamificationStore';
import type { FirebaseUser } from '../types';

// TODO: Phase 2 — integrate Firebase Auth phone OTP flow
// TODO: Phase 2 — persist auth state with AsyncStorage / SecureStore

// Until real phone auth is wired, back the demo session with a real Firebase
// (anonymous) uid so per-user writes satisfy `request.auth.uid == userId`.
async function ensureFirebaseUid(): Promise<string> {
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
  }, [setUser, setLoading]);

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
  }, [setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    setError,
    loginDemo,
    logout: handleLogout,
    sendOtp,
    verifyOtp,
  };
}
