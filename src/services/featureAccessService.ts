import type { FeatureKey } from '../types/subscription';
import { isPremiumUser, canAccessFeature } from './subscriptionService';

export const PREMIUM_FEATURES: FeatureKey[] = [
  'summary',
  'hoq',
  'exam_mode',
  'advanced_analytics',
  'past_papers',
  'ai_tutor',
];

export async function checkFeatureAccess(
  userId: string,
  featureKey: FeatureKey,
): Promise<boolean> {
  if (!PREMIUM_FEATURES.includes(featureKey)) return true;
  return canAccessFeature(userId, featureKey);
}

export async function checkPremium(userId: string): Promise<boolean> {
  return isPremiumUser(userId);
}
