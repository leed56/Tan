/**
 * User Service — writes the canonical users/{uid} document.
 *
 * The firestore.rules `users` create constraint requires the doc to include
 * `phoneNumber`, `displayName`, `createdAt`, `subscriptionStatus == 'free'` and
 * `role == 'student'`. App-specific profile fields are stored alongside.
 */
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured, waitForAuthReady } from './firebaseConfig';
import type { FirebaseUser, UserProfile } from '../types';

/**
 * Load an existing users/{uid} profile (returning-user sign-in). Returns null
 * when the doc doesn't exist yet (first-time user → onboard) or on any error.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    await waitForAuthReady();
    const snap = await getDoc(doc(firestore, COLLECTIONS.users, uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    if (!d.form) return null; // profile row exists but onboarding never finished
    return {
      uid,
      name: d.displayName ?? '',
      form: d.form,
      school: d.school ?? null,
      avatarId: d.avatarId ?? 'avatar_1',
      selectedSubjectIds: Array.isArray(d.selectedSubjectIds) ? d.selectedSubjectIds : [],
      createdAt: typeof d.createdAt?.toMillis === 'function' ? d.createdAt.toMillis() : Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
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
