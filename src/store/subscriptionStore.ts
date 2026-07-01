import { create } from 'zustand';
import type { UserSubscription, FeatureKey, PlanId } from '../types/subscription';
import {
  subscribeToSubscription,
  activateDemoPremium,
  isDemoActive,
} from '../services/subscriptionService';
import { SEED_PLANS } from '../utils/seedPlans';

interface SubscriptionStore {
  subscription: UserSubscription | null;
  loading: boolean;
  unsubscribe: (() => void) | null;

  // Derived helpers (synchronous, uses local state)
  isPremium: () => boolean;
  canAccess: (featureKey: FeatureKey) => boolean;
  planMaxProfiles: () => number;
  planMaxDevices: () => number;

  // Actions
  /** Starts a real-time users/{uid} listener — activation from the admin
   * panel is reflected here instantly, with no polling or manual refresh. */
  startListening: (userId: string) => void;
  stopListening: () => void;
  setSubscription: (sub: UserSubscription) => void;
  enableDemo: (planId?: PlanId) => void;
  clear: () => void;
}

function isSubActive(sub: UserSubscription | null): boolean {
  if (!sub) return false;
  return sub.status === 'active' || sub.status === 'demo';
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: null,
  loading: false,
  unsubscribe: null,

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

  planMaxDevices: () => {
    const sub = get().subscription;
    if (!sub) return 1;
    return SEED_PLANS.find((p) => p.id === sub.planId)?.maxDevices ?? 1;
  },

  startListening: (userId) => {
    get().unsubscribe?.();
    set({ loading: true });
    const unsubscribe = subscribeToSubscription(userId, (sub) => {
      set({ subscription: sub, loading: false });
    });
    set({ unsubscribe });
  },

  stopListening: () => {
    get().unsubscribe?.();
    set({ unsubscribe: null });
  },

  setSubscription: (sub) => set({ subscription: sub }),

  enableDemo: (planId = 'standard') => {
    const sub = activateDemoPremium(planId);
    set({ subscription: sub });
  },

  clear: () => {
    get().unsubscribe?.();
    set({ subscription: null, unsubscribe: null });
  },
}));
