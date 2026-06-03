/**
 * RevenueCat integration for Google Play Billing / App Store IAP.
 * Install: expo install react-native-purchases
 * Android entitlement: 'soma_ai_premium'
 * Product IDs: 'soma_ai_single_monthly', 'soma_ai_family_monthly'
 */

import { Platform } from 'react-native';

const ENTITLEMENT_ID = 'soma_ai_premium';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

interface RCEntitlementInfo {
  isActive: boolean;
  productIdentifier: string;
}

interface RCCustomerInfo {
  entitlements: {
    active: Record<string, RCEntitlementInfo>;
  };
}

interface RCPackage {
  identifier: string;
  product: {
    productIdentifier: string;
    priceString: string;
    price: number;
  };
  packageType: string;
}

interface RCOfferings {
  current: {
    identifier: string;
    availablePackages: RCPackage[];
  } | null;
}

interface RCStatic {
  configure(config: { apiKey: string; appUserID?: string }): void;
  setDisplayName(name: string): Promise<void>;
  getOfferings(): Promise<RCOfferings>;
  purchasePackage(pkg: RCPackage): Promise<{ customerInfo: RCCustomerInfo }>;
  restorePurchases(): Promise<RCCustomerInfo>;
  getCustomerInfo(): Promise<RCCustomerInfo>;
  logOut(): Promise<RCCustomerInfo>;
}

function getPurchases(): RCStatic | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('react-native-purchases');
    return m.default ?? m;
  } catch {
    return null;
  }
}

export type { RCPackage as PurchasesPackage, RCCustomerInfo as CustomerInfo };

export async function initRevenueCat(userId: string): Promise<void> {
  const rc = getPurchases();
  if (!rc) return;

  const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  if (!apiKey) return;

  rc.configure({ apiKey, appUserID: userId });
  await rc.setDisplayName(`User_${userId.slice(0, 8)}`);
}

export async function getOfferings(): Promise<RCPackage[]> {
  const rc = getPurchases();
  if (!rc) return [];

  try {
    const offerings = await rc.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

export async function purchasePackage(pkg: RCPackage): Promise<{
  success: boolean;
  customerInfo?: RCCustomerInfo;
  error?: string;
}> {
  const rc = getPurchases();
  if (!rc) return { success: false, error: 'RevenueCat not available' };

  try {
    const { customerInfo } = await rc.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (err: unknown) {
    if (
      err !== null &&
      typeof err === 'object' &&
      'userCancelled' in err &&
      (err as { userCancelled: boolean }).userCancelled
    ) {
      return { success: false, error: 'cancelled' };
    }
    const message = err instanceof Error ? err.message : 'Purchase failed';
    return { success: false, error: message };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
}> {
  const rc = getPurchases();
  if (!rc) return { success: false, isPremium: false };

  try {
    const customerInfo = await rc.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPremium };
  } catch {
    return { success: false, isPremium: false };
  }
}

export async function checkEntitlement(): Promise<boolean> {
  const rc = getPurchases();
  if (!rc) return false;

  try {
    const customerInfo = await rc.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getCustomerInfo(): Promise<RCCustomerInfo | null> {
  const rc = getPurchases();
  if (!rc) return null;

  try {
    return await rc.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function logOutRevenueCat(): Promise<void> {
  const rc = getPurchases();
  if (!rc) return;
  try {
    await rc.logOut();
  } catch {
    // ignore
  }
}
