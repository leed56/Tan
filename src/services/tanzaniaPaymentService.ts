import {
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, firestore, COLLECTIONS } from './firebaseConfig';
import type { PaymentProvider } from '../types/subscription';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

// ─── Selcom PayBox ────────────────────────────────────────────────────────────

export interface InitiatedPayment {
  orderId: string;
  reference: string;
  paymentUrl: string;
  qrCode?: string;
  provider: PaymentProvider;
}

// Selcom checkout requires the API key/secret to sign the request. Those are
// secrets and must NEVER ship in the client bundle, so the signed order is
// created by the `initiateSelcomPayment` Cloud Function (server-side secrets).
export async function initiateSelcomPayment(params: {
  userId: string;
  planId: string;
  amount: number;
  msisdn: string;
  name: string;
  email: string;
}): Promise<InitiatedPayment> {
  const functions = getFunctions(app);
  const callFn = httpsCallable<typeof params, InitiatedPayment>(functions, 'initiateSelcomPayment');
  const result = await callFn(params);
  return result.data;
}

// ─── Azampay ──────────────────────────────────────────────────────────────────

export type AzampayOperator = 'Airtel' | 'Tigo' | 'Halopesa' | 'Azampesa';

export async function initiateAzampayMnoPayment(params: {
  userId: string;
  planId: string;
  amount: number;
  msisdn: string;
  operator: AzampayOperator;
}): Promise<InitiatedPayment> {
  // Token exchange uses the server-side secret via Cloud Function — never expose it client-side
  const functions = getFunctions(app);
  const callFn = httpsCallable<typeof params, InitiatedPayment>(functions, 'initiateAzampayPayment');
  const result = await callFn(params);
  return result.data;
}

// ─── Mark as awaiting manual verification ─────────────────────────────────────

export async function markPaymentAwaitingManualVerification(
  orderId: string,
  provider: PaymentProvider
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const q = query(
    collection(firestore, COLLECTIONS.paymentRequests),
    where('orderId', '==', orderId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  await updateDoc(snap.docs[0].ref, {
    status: 'awaiting_verification',
    provider,
    updatedAt: serverTimestamp(),
  });
}

// ─── Check payment status ─────────────────────────────────────────────────────

export async function getPaymentStatus(orderId: string): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;

  const q = query(
    collection(firestore, COLLECTIONS.paymentRequests),
    where('orderId', '==', orderId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return (snap.docs[0].data().status as string) ?? null;
}
