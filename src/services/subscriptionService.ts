import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestore, COLLECTIONS } from './firebaseConfig';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}
import type {
  UserSubscription,
  PaymentRequest,
  PaymentProvider,
  FamilyProfile,
  PlanId,
  FeatureKey,
} from '../types/subscription';
import { SEED_PLANS } from '../utils/seedPlans';

// ─── Demo helper ──────────────────────────────────────────────────────────────

let _demoActive = false;
let _demoPlanId: PlanId = 'single';

export function activateDemoPremium(planId: PlanId = 'single'): UserSubscription {
  _demoActive = true;
  _demoPlanId = planId;
  const now = Date.now();
  return buildDemoSubscription(planId, now);
}

export function isDemoActive(): boolean {
  return _demoActive;
}

function buildDemoSubscription(planId: PlanId, now: number): UserSubscription {
  return {
    id: 'demo_subscription',
    userId: 'demo_user',
    planId,
    status: 'demo',
    startedAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
    paymentProvider: null,
    familyOwnerId: null,
    autoRenew: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Core subscription queries ────────────────────────────────────────────────

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  if (_demoActive) return buildDemoSubscription(_demoPlanId, Date.now());

  if (!isFirebaseConfigured()) return null;
  try {
    const ref = doc(firestore, COLLECTIONS.subscriptions, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserSubscription;
  } catch {
    return null;
  }
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  if (_demoActive) return true;
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  const isActive = sub.status === 'active' || sub.status === 'demo';
  const notExpired = sub.expiresAt > Date.now();
  return isActive && notExpired;
}

export async function canAccessFeature(
  userId: string,
  featureKey: FeatureKey,
): Promise<boolean> {
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) return false;
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  const plan = SEED_PLANS.find((p) => p.id === sub.planId);
  return plan?.features.includes(featureKey) ?? false;
}

// ─── Payment request creation ─────────────────────────────────────────────────

export async function createPaymentRequest(
  userId: string,
  planId: PlanId,
  provider: PaymentProvider,
  phoneNumber: string | null,
): Promise<PaymentRequest> {
  const plan = SEED_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error('Invalid plan');

  const payload: Omit<PaymentRequest, 'id'> = {
    userId,
    planId,
    provider,
    amount: plan.priceMonthly,
    phoneNumber,
    status: 'pending',
    referenceCode: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (!isFirebaseConfigured()) {
    return { id: `local_${Date.now()}`, ...payload };
  }

  try {
    const ref = await addDoc(
      collection(firestore, COLLECTIONS.paymentRequests),
      payload,
    );
    return { id: ref.id, ...payload };
  } catch {
    return { id: `local_${Date.now()}`, ...payload };
  }
}

// ─── Activate subscription after payment ─────────────────────────────────────

export async function activateSubscription(
  userId: string,
  planId: PlanId,
  provider: PaymentProvider,
): Promise<UserSubscription> {
  const now = Date.now();
  const sub: UserSubscription = {
    id: userId,
    userId,
    planId,
    status: 'active',
    startedAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
    paymentProvider: provider,
    familyOwnerId: null,
    autoRenew: false,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    await setDoc(doc(firestore, COLLECTIONS.subscriptions, userId), sub).catch(() => {});
  }

  return sub;
}

// ─── Family profiles ──────────────────────────────────────────────────────────

export async function getFamilyProfiles(ownerId: string): Promise<FamilyProfile[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(
      collection(firestore, COLLECTIONS.familyProfiles),
      where('familyOwnerId', '==', ownerId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyProfile));
  } catch {
    return [];
  }
}

export async function addFamilyMember(
  ownerId: string,
  memberName: string,
  memberPhone: string | null,
  memberForm: number | null,
): Promise<FamilyProfile> {
  const now = Date.now();
  const profile: Omit<FamilyProfile, 'id'> = {
    familyOwnerId: ownerId,
    memberId: null,
    memberName,
    memberPhone,
    memberForm,
    inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    joinedAt: null,
    createdAt: now,
  };

  if (!isFirebaseConfigured()) {
    return { id: `local_${Date.now()}`, ...profile };
  }

  try {
    const ref = await addDoc(collection(firestore, COLLECTIONS.familyProfiles), profile);
    return { id: ref.id, ...profile };
  } catch {
    return { id: `local_${Date.now()}`, ...profile };
  }
}
