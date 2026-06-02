import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useGamificationStore } from '../store/gamificationStore';
import type { FirebaseUser } from '../types';

// TODO: Phase 2 — integrate Firebase Auth phone OTP flow
// TODO: Phase 2 — persist auth state with AsyncStorage / SecureStore

export function useAuth() {
  const { user, isAuthenticated, loading, error, setUser, setLoading, setError, logout } =
    useAuthStore();
  const { clearProfile } = useProfileStore();

  const loginDemo = useCallback(async () => {
    setLoading(true);
    // Simulate network delay for demo
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const demoUser: FirebaseUser = {
      uid: 'demo_user_001',
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const demoUser: FirebaseUser = {
      uid: 'demo_user_001',
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
