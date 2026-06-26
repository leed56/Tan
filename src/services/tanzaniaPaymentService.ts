import {
  doc,
  updateDoc,
  addDoc,
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

interface SelcomOrderResponse {
  resultcode: string;
  result: string;
  message: string;
  data: {
    order_id: string;
    reference: string;
    qr: string;
    payment_gateway_url: string;
  };
}

export interface InitiatedPayment {
  orderId: string;
  reference: string;
  paymentUrl: string;
  qrCode?: string;
  provider: PaymentProvider;
}

export async function initiateSelcomPayment(params: {
  userId: string;
  planId: string;
  amount: number;
  msisdn: string;
  name: string;
  email: string;
}): Promise<InitiatedPayment> {
  const apiKey = process.env.EXPO_PUBLIC_SELCOM_API_KEY ?? '';
  const baseUrl = process.env.EXPO_PUBLIC_SELCOM_BASE_URL ?? 'https://apigw.selcom.net';

  if (!apiKey) throw new Error('Selcom not configured');

  const timestamp = new Date().toISOString();
  const orderId = `SOMA${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const payload = {
    vendor: process.env.EXPO_PUBLIC_SELCOM_VENDOR_ID,
    order_id: orderId,
    buyer_email: params.email,
    buyer_name: params.name,
    buyer_phone: params.msisdn,
    amount: params.amount,
    currency: 'TZS',
    webhook: `${process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL}/selcomWebhook`,
    cancel_url: 'soma-ai://payment/cancel',
    redirect_url: 'soma-ai://payment/success',
    header_colour: '#7B6FF2',
    no_of_items: 1,
  };

  const response = await fetch(`${baseUrl}/v1/checkout/create-order-minimal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `SELCOM ${apiKey}`,
      'Timestamp': timestamp,
      'Signed-Fields': 'timestamp',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Selcom API error: ${response.status}`);
  }

  const data: SelcomOrderResponse = await response.json();
  if (data.resultcode !== '000') {
    throw new Error(`Selcom error: ${data.message}`);
  }

  if (isFirebaseConfigured()) {
    await addDoc(collection(firestore, COLLECTIONS.paymentRequests), {
      userId: params.userId,
      planId: params.planId,
      planType: params.planId,
      provider: 'selcom' as PaymentProvider,
      amount: params.amount,
      phoneNumber: params.msisdn,
      status: 'pending',
      orderId,
      referenceCode: data.data.reference,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return {
    orderId,
    reference: data.data.reference,
    paymentUrl: data.data.payment_gateway_url,
    qrCode: data.data.qr,
    provider: 'selcom',
  };
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
