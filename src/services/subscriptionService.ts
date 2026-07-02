import {
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  collection,
  Timestamp,
} from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';

import type {
  UserSubscription,
  PaymentRequest,
  PaymentProvider,
  PlanId,
  BillingCycle,
  FeatureKey,
} from '../types/subscription';
import { SEED_PLANS } from '../utils/seedPlans';

// ─── Demo helper (dev only — "Try Demo Premium" button) ───────────────────────

let _demoActive = false;
let _demoPlanId: PlanId = 'standard';

export function activateDemoPremium(planId: PlanId = 'standard'): UserSubscription {
  _demoActive = true;
  _demoPlanId = planId;
  return buildDemoSubscription(planId);
}

export function isDemoActive(): boolean {
  return _demoActive;
}

function buildDemoSubscription(planId: PlanId): UserSubscription {
  return {
    userId: 'demo_user',
    status: 'demo',
    planId,
    billingCycle: 'monthly',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
}

function freeSubscription(userId: string): UserSubscription {
  return { userId, status: 'free', planId: null, billingCycle: null, expiresAt: null };
}

function toMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return null;
}

/**
 * The single canonical read path for subscription state: `users/{uid}`.
 * Admin activation (from the admin panel) writes directly to this doc, so a
 * real-time listener here is what makes activation reflect instantly in the
 * app — no polling, no manual refresh.
 */
export function subscribeToSubscription(
  userId: string,
  callback: (sub: UserSubscription) => void,
): () => void {
  if (_demoActive) {
    callback(buildDemoSubscription(_demoPlanId));
    return () => {};
  }
  if (!isFirebaseConfigured()) {
    callback(freeSubscription(userId));
    return () => {};
  }

  const ref = doc(firestore, COLLECTIONS.users, userId);
  return onSnapshot(
    ref,
    (snap) => {
      const data = snap.data();
      if (!data) {
        callback(freeSubscription(userId));
        return;
      }
      const expiresAt = toMillis(data.subscriptionExpiry);
      const active = data.subscriptionStatus === 'active';
      const status: UserSubscription['status'] =
        active && expiresAt !== null && expiresAt > Date.now()
          ? 'active'
          : active
          ? 'expired'
          : 'free';
      callback({
        userId,
        status,
        planId: (data.subscriptionPlan as PlanId | undefined) ?? null,
        billingCycle: (data.billingCycle as BillingCycle | undefined) ?? null,
        expiresAt,
      });
    },
    () => callback(freeSubscription(userId)),
  );
}

async function getUserSubscriptionOnce(userId: string): Promise<UserSubscription> {
  if (_demoActive) return buildDemoSubscription(_demoPlanId);
  if (!isFirebaseConfigured()) return freeSubscription(userId);
  try {
    const snap = await getDoc(doc(firestore, COLLECTIONS.users, userId));
    const data = snap.data();
    if (!data) return freeSubscription(userId);
    const expiresAt = toMillis(data.subscriptionExpiry);
    const active = data.subscriptionStatus === 'active';
    return {
      userId,
      status: active && expiresAt !== null && expiresAt > Date.now() ? 'active' : 'free',
      planId: (data.subscriptionPlan as PlanId | undefined) ?? null,
      billingCycle: (data.billingCycle as BillingCycle | undefined) ?? null,
      expiresAt,
    };
  } catch {
    return freeSubscription(userId);
  }
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const sub = await getUserSubscriptionOnce(userId);
  return sub.status === 'active' || sub.status === 'demo';
}

export async function canAccessFeature(
  userId: string,
  featureKey: FeatureKey,
): Promise<boolean> {
  const sub = await getUserSubscriptionOnce(userId);
  if (sub.status !== 'active' && sub.status !== 'demo') return false;
  const plan = SEED_PLANS.find((p) => p.id === sub.planId);
  return plan?.features.includes(featureKey) ?? false;
}

// ─── Payment requests ──────────────────────────────────────────────────────
// Every payment method — including WhatsApp — creates a payment_requests doc
// so the admin panel has full visibility. Activation ONLY happens when an
// admin verifies the request from the admin panel (writes users/{uid}
// directly); there is no client-side self-activation path.

export function planAmount(planId: PlanId, billingCycle: BillingCycle): number {
  const plan = SEED_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error('Invalid plan');
  return billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
}

export async function createPaymentRequest(
  userId: string,
  planId: PlanId,
  billingCycle: BillingCycle,
  provider: PaymentProvider,
  studentPhone: string | null,
  transactionRef: string | null = null,
): Promise<PaymentRequest> {
  const payload: Omit<PaymentRequest, 'id'> = {
    userId,
    studentPhone,
    planId,
    billingCycle,
    provider,
    amount: planAmount(planId, billingCycle),
    transactionRef,
    status: 'pending',
    submittedAt: Date.now(),
    verifiedAt: null,
    verifiedBy: null,
    rejectionReason: null,
  };

  if (!isFirebaseConfigured()) {
    return { id: `local_${Date.now()}`, ...payload };
  }

  try {
    const ref = await addDoc(collection(firestore, COLLECTIONS.paymentRequests), payload);
    return { id: ref.id, ...payload };
  } catch {
    return { id: `local_${Date.now()}`, ...payload };
  }
}
