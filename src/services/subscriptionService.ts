// TODO: Phase 2 — integrate mobile payment (e.g., M-Pesa, Stripe)
// TODO: Phase 2 — verify subscription status from Firestore on app launch
// TODO: Phase 2 — school bulk subscription management
// TODO: Phase 2 — free trial logic (7-day premium trial)

import type { Subscription, SubscriptionTier } from '../types';

export async function getSubscription(_uid: string): Promise<Subscription | null> {
  // TODO: Phase 2 — fetch from Firestore /subscriptions/{uid}
  return null;
}

export async function upgradeToPremium(_uid: string): Promise<void> {
  // TODO: Phase 2 — initiate payment flow, then write subscription doc
  throw new Error('Subscription upgrade not implemented yet. Coming in Phase 2.');
}

export function isPremiumFeatureLocked(tier: SubscriptionTier, featureTier: SubscriptionTier): boolean {
  const tierOrder: SubscriptionTier[] = ['free', 'premium', 'school'];
  return tierOrder.indexOf(tier) < tierOrder.indexOf(featureTier);
}

export function getSubscriptionLabel(tier: SubscriptionTier): string {
  switch (tier) {
    case 'premium': return '⭐ Premium';
    case 'school': return '🏫 School Plan';
    default: return 'Free Plan';
  }
}
