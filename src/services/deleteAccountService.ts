/**
 * Account deletion — permanently removes the signed-in user's data and revokes
 * their Firebase Auth record.
 *
 * Design notes:
 * - Best-effort per collection (Promise.allSettled): a single rules-denied
 *   delete must not abort the rest.
 * - The Auth-account deletion is the legally meaningful "delete me" and runs
 *   LAST, while the user is still authenticated for the Firestore writes.
 * - Denormalized analytics rows keyed only by uid (quiz_attempts, ai_feedback,
 *   etc.) are intentionally left for a server-side (Cloud Function) sweep once
 *   the project is on the Blaze plan — they carry no PII beyond an orphaned uid
 *   once the Auth record and users/{uid} doc are gone.
 */
import {
  doc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { GoogleAuthProvider, deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { firestore, auth, COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';

async function deleteWhere(collectionName: string, field: string, uid: string): Promise<void> {
  const snap = await getDocs(query(collection(firestore, collectionName), where(field, '==', uid)));
  if (snap.empty) return;
  const batch = writeBatch(firestore);
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

async function deleteSubcollection(parent: string, uid: string, sub: string): Promise<void> {
  const snap = await getDocs(collection(firestore, parent, uid, sub));
  if (snap.empty) return;
  const batch = writeBatch(firestore);
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/**
 * Delete the current user's account. Throws only if the final Auth-account
 * deletion fails (so callers can surface a retry/re-auth message); Firestore
 * cleanup is best-effort and never throws.
 */
export async function deleteAccount(uid: string): Promise<void> {
  if (!isFirebaseConfigured()) return;

  // 1) Wipe user-owned Firestore data (best-effort — never throws).
  await Promise.allSettled([
    deleteDoc(doc(firestore, COLLECTIONS.users, uid)),
    deleteDoc(doc(firestore, COLLECTIONS.gamification, uid)),
    deleteDoc(doc(firestore, COLLECTIONS.leaderboardScores, uid)),
    deleteDoc(doc(firestore, COLLECTIONS.leaderboard, uid)),
    deleteSubcollection(COLLECTIONS.users, uid, COLLECTIONS.devices),
    deleteWhere(COLLECTIONS.familyChildren, 'rootUid', uid),
    deleteWhere(COLLECTIONS.studentProgress, 'userId', uid),
    deleteWhere(COLLECTIONS.dailyUsage, 'userId', uid),
    deleteWhere(COLLECTIONS.userBadges, 'userId', uid),
  ]);

  // 2) Revoke the Auth account — the real deletion. Firebase requires a recent
  // login for this; if it's stale, re-authenticate via Google popup and retry.
  const current = auth.currentUser;
  if (!current) return;
  try {
    await deleteUser(current);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/requires-recent-login') {
      await reauthenticateWithPopup(current, new GoogleAuthProvider());
      await deleteUser(current);
    } else {
      throw e;
    }
  }
}
