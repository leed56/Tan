/**
 * User Service — writes the canonical users/{uid} document.
 *
 * The firestore.rules `users` create constraint requires the doc to include
 * `phoneNumber`, `displayName`, `createdAt`, `subscriptionStatus == 'free'` and
 * `role == 'student'`. App-specific profile fields are stored alongside.
 */
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';
import type { FirebaseUser, UserProfile } from '../types';

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

// Fields a signed-in user is allowed to self-edit after profile creation —
// the `users` update rule forbids touching role/subscriptionStatus/
// subscriptionExpiry/createdAt/phoneNumber, so only these may be patched here.
export async function updateUserProfileFields(
  uid: string,
  patch: Partial<Pick<UserProfile, 'name' | 'form' | 'school' | 'avatarId'>>,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const { name, ...rest } = patch;
    await setDoc(
      doc(firestore, COLLECTIONS.users, uid),
      {
        ...(name !== undefined ? { displayName: name } : {}),
        ...rest,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Swallow — persisted locally regardless.
  }
}
