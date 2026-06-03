/**
 * Real Firebase Phone Authentication.
 * Uses @react-native-firebase/auth for native phone auth (reCAPTCHA-less).
 * Falls back to Expo Firebase SDK when native module is unavailable.
 *
 * Install for production: expo install @react-native-firebase/app @react-native-firebase/auth
 */

import { Platform } from 'react-native';
import { signInWithPhoneNumber, signOut, type ApplicationVerifier } from 'firebase/auth';
import { auth } from './firebaseConfig';

export type PhoneAuthConfirmation = {
  confirm: (code: string) => Promise<void>;
};

interface NativeAuthInstance {
  currentUser: {
    uid: string;
    metadata: { creationTime?: string; lastSignInTime?: string };
    getIdToken(): Promise<string>;
  } | null;
  signInWithPhoneNumber(phone: string): Promise<{ confirm(code: string): Promise<void> }>;
  signOut(): Promise<void>;
}

function getNativeAuth(): NativeAuthInstance | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@react-native-firebase/auth');
    return (m.default ?? m)();
  } catch {
    return null;
  }
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(
  phoneNumber: string,
  recaptchaVerifier?: ApplicationVerifier
): Promise<PhoneAuthConfirmation> {
  const e164 = normalizeToE164(phoneNumber);
  const nativeAuth = getNativeAuth();

  if (nativeAuth) {
    const confirmation = await nativeAuth.signInWithPhoneNumber(e164);
    return {
      confirm: async (code: string) => {
        await confirmation.confirm(code);
      },
    };
  }

  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA verifier required for web phone auth');
  }

  const confirmation = await signInWithPhoneNumber(auth, e164, recaptchaVerifier);
  return {
    confirm: async (code: string) => {
      await confirmation.confirm(code);
    },
  };
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtp(
  confirmation: PhoneAuthConfirmation,
  code: string
): Promise<{ uid: string; isNewUser: boolean }> {
  const nativeAuth = getNativeAuth();

  await confirmation.confirm(code);

  if (nativeAuth) {
    const user = nativeAuth.currentUser;
    if (!user) throw new Error('No user after OTP confirmation');
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
    return { uid: user.uid, isNewUser };
  }

  const user = auth.currentUser;
  if (!user) throw new Error('No user after OTP confirmation');
  const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
  return { uid: user.uid, isNewUser };
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  const nativeAuth = getNativeAuth();

  if (nativeAuth) {
    await nativeAuth.signOut();
    return;
  }

  await signOut(auth);
}

// ─── Get current user ─────────────────────────────────────────────────────────

export function getCurrentUserId(): string | null {
  const nativeAuth = getNativeAuth();
  if (nativeAuth) return nativeAuth.currentUser?.uid ?? null;
  return auth.currentUser?.uid ?? null;
}

export async function getIdToken(): Promise<string | null> {
  const nativeAuth = getNativeAuth();
  if (nativeAuth) return nativeAuth.currentUser?.getIdToken() ?? null;
  return auth.currentUser?.getIdToken() ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function normalizeToE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('255') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+255${digits.slice(1)}`;
  if (digits.length === 9) return `+255${digits}`;
  return `+${digits}`;
}

export function isValidTanzaniaPhone(phone: string): boolean {
  const e164 = normalizeToE164(phone);
  return /^\+255[67]\d{8}$/.test(e164);
}

export function detectOperator(phone: string): string {
  const e164 = normalizeToE164(phone);
  const prefix = e164.slice(4, 6);
  if (['62', '63', '68', '69', '71', '74', '75', '76'].includes(prefix)) return 'Vodacom M-Pesa';
  if (['65', '67', '73', '77'].includes(prefix)) return 'Tigo Pesa';
  if (['78', '79'].includes(prefix)) return 'Airtel Money';
  if (['61'].includes(prefix)) return 'Halotel Halopesa';
  if (Platform.OS !== 'web' && prefix.startsWith('6')) return 'Azampesa';
  return 'Unknown';
}
