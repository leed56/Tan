import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import type { AdminUser } from '../types';

async function resolveAdminUser(firebaseUser: User): Promise<AdminUser | null> {
  const snap = await getDoc(doc(db, 'admin_users', firebaseUser.uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.isActive) return null;
  await updateDoc(doc(db, 'admin_users', firebaseUser.uid), {
    lastLoginAt: serverTimestamp(),
  });
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: data.displayName ?? firebaseUser.email ?? '',
    role: data.role,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    lastLoginAt: new Date(),
    isActive: data.isActive,
  };
}

export async function signIn(email: string, password: string): Promise<AdminUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const admin = await resolveAdminUser(cred.user);
  if (!admin) throw new Error('Access denied: not an admin account');
  useAuthStore.getState().setUser(admin);
  return admin;
}

export async function signOut() {
  await firebaseSignOut(auth);
  useAuthStore.getState().setUser(null);
}

export function initAuthListener() {
  const { setUser, setLoading } = useAuthStore.getState();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const admin = await resolveAdminUser(firebaseUser);
      setUser(admin);
    } else {
      setUser(null);
    }
    setLoading(false);
  });
}
