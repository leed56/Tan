// Type shims for optional native modules not installed in this workspace.
// These are only used in production native builds (not Expo Go).

declare module '@react-native-firebase/auth' {
  interface User {
    uid: string;
    metadata: { creationTime?: string; lastSignInTime?: string };
    getIdToken(): Promise<string>;
  }
  interface ConfirmationResult {
    confirm(code: string): Promise<void>;
  }
  interface FirebaseAuthTypes {
    currentUser: User | null;
    signInWithPhoneNumber(phone: string): Promise<ConfirmationResult>;
    signOut(): Promise<void>;
  }
  function auth(): FirebaseAuthTypes;
  export = auth;
}

declare module '@react-native-firebase/app-check' {
  interface AppCheckToken { token: string }
  interface FirebaseAppCheckTypes {
    activate(provider: string, isTokenAutoRefreshEnabled?: boolean): Promise<void>;
    getToken(forceRefresh?: boolean): Promise<AppCheckToken>;
  }
  function appCheck(): FirebaseAppCheckTypes;
  export = appCheck;
}

declare module '@react-native-firebase/crashlytics' {
  interface FirebaseCrashlyticsTypes {
    setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void>;
    setUserId(userId: string): Promise<void>;
    setAttribute(name: string, value: string): Promise<void>;
    log(message: string): Promise<void>;
    recordError(error: Error): Promise<void>;
  }
  function crashlytics(): FirebaseCrashlyticsTypes;
  export = crashlytics;
}

declare module '@react-native-community/netinfo' {
  interface NetInfoState {
    isConnected: boolean | null;
    type: string;
  }
  type NetInfoChangeHandler = (state: NetInfoState) => void;
  interface NetInfoStatic {
    fetch(): Promise<NetInfoState>;
    addEventListener(listener: NetInfoChangeHandler): () => void;
  }
  const NetInfo: NetInfoStatic;
  export = NetInfo;
}

declare module 'react-native-purchases' {
  interface PurchasesEntitlementInfo {
    isActive: boolean;
    productIdentifier: string;
  }
  interface CustomerInfo {
    entitlements: {
      active: Record<string, PurchasesEntitlementInfo>;
    };
  }
  interface PurchasesStoreProduct {
    productIdentifier: string;
    priceString: string;
    price: number;
  }
  interface PurchasesPackage {
    identifier: string;
    product: PurchasesStoreProduct;
    packageType: string;
  }
  interface PurchasesOffering {
    identifier: string;
    availablePackages: PurchasesPackage[];
  }
  interface PurchasesOfferings {
    current: PurchasesOffering | null;
  }
  interface PurchasesConfiguration {
    apiKey: string;
    appUserID?: string;
  }
  interface PurchasesStatic {
    configure(config: PurchasesConfiguration): void;
    setDisplayName(name: string): Promise<void>;
    getOfferings(): Promise<PurchasesOfferings>;
    purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo }>;
    restorePurchases(): Promise<CustomerInfo>;
    getCustomerInfo(): Promise<CustomerInfo>;
    logOut(): Promise<CustomerInfo>;
  }
  const Purchases: PurchasesStatic;
  export = Purchases;
  // Named re-exports for type usage only
  export type { CustomerInfo, PurchasesPackage, PurchasesOffering, PurchasesOfferings };
}

declare module '@sentry/react-native' {
  interface SentryEvent {
    extra?: Record<string, unknown>;
  }
  type SentryLevel = 'log' | 'info' | 'warning' | 'error' | 'fatal' | 'debug';
  interface Breadcrumb {
    category?: string;
    message?: string;
    level?: SentryLevel;
  }
  interface SentryUser {
    id?: string;
  }
  interface InitOptions {
    dsn: string;
    environment?: string;
    enableNative?: boolean;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
    attachStacktrace?: boolean;
    beforeSend?: (event: SentryEvent) => SentryEvent | null;
  }
  export function init(options: InitOptions): void;
  export function captureException(error: Error, opts?: Record<string, unknown>): string;
  export function captureMessage(message: string): string;
  export function setUser(user: SentryUser | null): void;
  export function setTag(key: string, value: string): void;
  export function addBreadcrumb(breadcrumb: Breadcrumb): void;
  export function wrap<T>(component: T): T;
}

declare module '@react-native-async-storage/async-storage' {
  interface AsyncStorageStatic {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiGet(keys: string[]): Promise<[string, string | null][]>;
    multiSet(keyValuePairs: [string, string][]): Promise<void>;
    getAllKeys(): Promise<string[]>;
    clear(): Promise<void>;
  }
  const AsyncStorage: AsyncStorageStatic;
  export = AsyncStorage;
}
