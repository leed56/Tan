import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export async function logAudit(
  action: string,
  resource: string,
  resourceId: string,
  details: Record<string, unknown> = {}
) {
  const user = useAuthStore.getState().user;
  if (!user) return;
  await addDoc(collection(db, 'admin_audit_logs'), {
    adminId: user.id,
    adminEmail: user.email,
    action,
    resource,
    resourceId,
    details,
    timestamp: serverTimestamp(),
  });
}
