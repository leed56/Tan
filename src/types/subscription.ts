export type FeatureKey =
  | 'summary'
  | 'hoq'
  | 'exam_mode'
  | 'advanced_analytics'
  | 'past_papers'
  | 'ai_tutor';

export type PlanId = 'single' | 'family';

export type PaymentProvider =
  | 'google_play'
  | 'airtel'
  | 'mpesa'
  | 'tigo'
  | 'halopesa'
  | 'ttcl'
  | 'whatsapp';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface SubscriptionPlan {
  id: PlanId;
  title: string;
  priceMonthly: number;      // in TSH
  maxProfiles: number;
  features: FeatureKey[];
  isPopular?: boolean;
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: 'active' | 'expired' | 'cancelled' | 'demo';
  startedAt: number;
  expiresAt: number;
  paymentProvider: PaymentProvider | null;
  familyOwnerId: string | null;   // null = this IS the owner
  autoRenew: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  planId: PlanId;
  provider: PaymentProvider;
  amount: number;               // TSH
  phoneNumber: string | null;   // for mobile money
  status: PaymentStatus;
  referenceCode: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FamilyProfile {
  id: string;
  familyOwnerId: string;
  memberId: string | null;      // null = slot open
  memberName: string;
  memberPhone: string | null;
  memberForm: number | null;
  inviteCode: string;
  joinedAt: number | null;
  createdAt: number;
}

export interface PremiumUnlockEvent {
  id: string;
  userId: string;
  featureKey: FeatureKey;
  planId: PlanId;
  unlockedAt: number;
}
