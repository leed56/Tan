/**
 * Google Sign-In — web implementation.
 *
 * The deployed student app runs on the web (Firebase Hosting), so Google
 * sign-in uses Firebase Auth's popup flow. Native (Expo) Google sign-in needs
 * a custom dev build + platform OAuth clients; until that's set up, calling
 * this on native throws a clear, catchable error so the UI can explain.
 *
 * Firebase Console requirement: Authentication -> Sign-in method -> enable
 * "Google". The web OAuth client and *.web.app authorized domains are created
 * automatically.
 */
import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig';
import type { FirebaseUser } from '../types';

export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (Platform.OS !== 'web') {
    throw new Error(
      'Google sign-in is available on the web app for now. The Android/iOS build will add it soon.',
    );
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const u = cred.user;
  return {
    uid: u.uid,
    phoneNumber: u.phoneNumber ?? null,
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    photoURL: u.photoURL ?? null,
  };
}
