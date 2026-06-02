import { create } from 'zustand';
import type { UserSubscription, FeatureKey, PlanId } from '../types/subscription';
import {
  getUserSubscription,
  activateDemoPremium,
  isDemoActive,
} from '../services/subscriptionService';
import { SEED_PLANS } from '../utils/seedPlans';

interface SubscriptionStore {
  subscription: UserSubscription | null;
  loading: boolean;

  // Derived helpers (synchronous, uses local state)
  isPremium: () => boolean;
  canAccess: (featureKey: FeatureKey) => boolean;
  planMaxProfiles: () => number;

  // Actions
  fetchSubscription: (userId: string) => Promise<void>;
  setSubscription: (sub: UserSubscription) => void;
  enableDemo: (planId?: PlanId) => void;
  clear: () => void;
}

function isSubActive(sub: UserSubscription | null): boolean {
  if (!sub) return false;
  return (sub.status === 'active' || sub.status === 'demo') && sub.expiresAt > Date.now();
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: null,
  loading: false,

  isPremium: () => isSubActive(get().subscription) || isDemoActive(),

  canAccess: (featureKey) => {
    if (!get().isPremium()) return false;
    const sub = get().subscription;
    if (!sub) return false;
    const plan = SEED_PLANS.find((p) => p.id === sub.planId);
    return plan?.features.includes(featureKey) ?? false;
  },

  planMaxProfiles: () => {
    const sub = get().subscription;
    if (!sub) return 1;
    return SEED_PLANS.find((p) => p.id === sub.planId)?.maxProfiles ?? 1;
  },

  fetchSubscription: async (userId) => {
    set({ loading: true });
    try {
      const sub = await getUserSubscription(userId);
      set({ subscription: sub, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSubscription: (sub) => set({ subscription: sub }),

  enableDemo: (planId = 'single') => {
    const sub = activateDemoPremium(planId);
    set({ subscription: sub });
  },

  clear: () => set({ subscription: null }),
}));
