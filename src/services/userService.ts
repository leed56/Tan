/**
 * User Service — writes the canonical users/{uid} document.
 *
 * The firestore.rules `users` create constraint requires the doc to include
 * `phoneNumber`, `displayName`, `createdAt`, `subscriptionStatus == 'free'` and
 * `role == 'student'`. App-specific profile fields are stored alongside.
 */
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, COLLECTIONS } from './firebaseConfig';
import type { FirebaseUser, UserProfile } from '../types';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

export async function createUserProfile(
  user: FirebaseUser,
  profile: UserProfile,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(
      doc(firestore, COLLECTIONS.users, user.uid),
      {
        // Required by the users create rule
        phoneNumber: user.phoneNumber ?? '',
        displayName: profile.name,
        subscriptionStatus: 'free',
        role: 'student',
        createdAt: serverTimestamp(),
        // App profile fields
        form: profile.form,
        school: profile.school,
        avatarId: profile.avatarId,
        selectedSubjectIds: profile.selectedSubjectIds,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Swallow — local persisted profile keeps the app usable if the write is
    // rejected (e.g. before real auth is wired). Surfaced upstream if needed.
  }
}

export async function updateSelectedSubjects(
  uid: string,
  selectedSubjectIds: string[],
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(
      doc(firestore, COLLECTIONS.users, uid),
      { selectedSubjectIds, updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch {
    // Swallow — persisted locally regardless.
  }
}
