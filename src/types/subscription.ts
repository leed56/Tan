export type FeatureKey =
  | 'summary'
  | 'hoq'
  | 'exam_mode'
  | 'advanced_analytics';

export type PlanId = 'standard' | 'family';

export type BillingCycle = 'monthly' | 'yearly';

export type PaymentProvider =
  | 'google_play'
  | 'airtel'
  | 'mpesa'
  | 'tigo'
  | 'halopesa'
  | 'ttcl'
  | 'whatsapp';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface SubscriptionPlan {
  id: PlanId;
  title: string;
  priceMonthly: number;      // in TSH
  priceYearly: number;       // in TSH
  maxDevices: number;
  maxProfiles: number;       // 1 for standard, 4 (1 primary + 3 secondary) for family
  features: FeatureKey[];
  isPopular?: boolean;
  description: string;
}

/**
 * Mirrors the fields the app reads off `users/{uid}` — the single canonical
 * source of truth for subscription state (also what firestore.rules'
 * isPremium() and the admin panel read/write). There is no separate
 * `subscriptions` collection anymore.
 */
export interface UserSubscription {
  userId: string;
  status: 'free' | 'active' | 'expired' | 'demo';
  planId: PlanId | null;
  billingCycle: BillingCycle | null;
  expiresAt: number | null;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  studentPhone: string | null;
  planId: PlanId;
  billingCycle: BillingCycle;
  provider: PaymentProvider;
  amount: number;                // TSH
  transactionRef: string | null; // mobile-money confirmation code, if any
  status: PaymentStatus;
  submittedAt: number;
  verifiedAt: number | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
}

/**
 * A Family-plan secondary student profile. Lives under the paying parent's
 * account (rootUid) — no separate phone/OTP login. Aggregate XP/streak only;
 * the parent's own account keeps the full, rules-protected quiz history.
 */
export interface ChildProfile {
  id: string;
  rootUid: string;
  name: string;
  avatarId: string;
  form: number | null;
  xp: number;
  level: number;
  weekXp: number;          // XP earned in the current weekKey — powers "Family MVP"
  weekKey: string;         // e.g. "2026-W27", reset boundary for weekXp
  streakDays: number;
  lastActiveDate: string | null; // YYYY-MM-DD, local
  createdAt: number;
  updatedAt: number;
}

export interface RegisteredDevice {
  id: string;             // stable per-install device id
  userId: string;
  deviceName: string;     // e.g. "iPhone 14 · Safari" / "SM-A125F · Android"
  platform: string;
  lastActiveAt: number;
  createdAt: number;
}
