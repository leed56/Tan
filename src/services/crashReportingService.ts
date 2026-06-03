/**
 * Unified crash reporting facade.
 * Wraps Firebase Crashlytics (@react-native-firebase/crashlytics)
 * and Sentry (@sentry/react-native) — both are optional native deps.
 *
 * Install for production builds:
 *   expo install @react-native-firebase/crashlytics @sentry/react-native
 */

import { Platform } from 'react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
const APP_ENV = process.env.APP_ENV ?? 'development';

interface CrashlyticsInstance {
  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void>;
  setUserId(userId: string): Promise<void>;
  setAttribute(name: string, value: string): Promise<void>;
  log(message: string): Promise<void>;
  recordError(error: Error): Promise<void>;
}

interface SentryBreadcrumb {
  category?: string;
  message?: string;
  level?: string;
}

interface SentryEvent {
  extra?: Record<string, unknown>;
}

interface SentryModule {
  init(options: Record<string, unknown>): void;
  captureException(error: Error, opts?: Record<string, unknown>): string;
  setUser(user: { id?: string } | null): void;
  setTag(key: string, value: string): void;
  addBreadcrumb(breadcrumb: SentryBreadcrumb): void;
}

// ─── lazy loaders ─────────────────────────────────────────────────────────────

function getCrashlytics(): CrashlyticsInstance | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@react-native-firebase/crashlytics');
    return (m.default ?? m)();
  } catch {
    return null;
  }
}

function getSentry(): SentryModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@sentry/react-native') as SentryModule;
  } catch {
    return null;
  }
}

// ─── init ────────────────────────────────────────────────────────────────────

export async function initCrashReporting(): Promise<void> {
  const sentry = getSentry();
  if (sentry && SENTRY_DSN) {
    sentry.init({
      dsn: SENTRY_DSN,
      environment: APP_ENV,
      enableNative: true,
      tracesSampleRate: APP_ENV === 'production' ? 0.2 : 1.0,
      attachStacktrace: true,
      beforeSend(event: SentryEvent) {
        if (event.extra) {
          const sanitized = { ...event.extra };
          delete sanitized['password'];
          delete sanitized['phoneNumber'];
          delete sanitized['token'];
          event.extra = sanitized;
        }
        return event;
      },
    });
  }

  const crashlytics = getCrashlytics();
  if (crashlytics) {
    await crashlytics.setCrashlyticsCollectionEnabled(APP_ENV === 'production');
  }
}

// ─── set user context ─────────────────────────────────────────────────────────

export async function setUserContext(userId: string, subscriptionStatus: string): Promise<void> {
  const crashlytics = getCrashlytics();
  const sentry = getSentry();

  if (crashlytics) {
    await Promise.all([
      crashlytics.setUserId(userId),
      crashlytics.setAttribute('subscription_status', subscriptionStatus),
      crashlytics.setAttribute('platform', Platform.OS),
      crashlytics.setAttribute('app_env', APP_ENV),
    ]);
  }

  if (sentry) {
    sentry.setUser({ id: userId });
    sentry.setTag('subscription_status', subscriptionStatus);
    sentry.setTag('app_env', APP_ENV);
  }
}

// ─── clear user on sign out ───────────────────────────────────────────────────

export async function clearUserContext(): Promise<void> {
  const crashlytics = getCrashlytics();
  const sentry = getSentry();

  if (crashlytics) await crashlytics.setUserId('');
  if (sentry) sentry.setUser(null);
}

// ─── log error ────────────────────────────────────────────────────────────────

export async function logError(
  error: Error,
  context?: Record<string, string>
): Promise<void> {
  const crashlytics = getCrashlytics();
  const sentry = getSentry();

  if (crashlytics) {
    if (context) {
      await Promise.all(
        Object.entries(context).map(([k, v]) => crashlytics.setAttribute(k, v))
      );
    }
    await crashlytics.recordError(error);
  }

  if (sentry) {
    sentry.captureException(error, { extra: context });
  }
}

// ─── log message ─────────────────────────────────────────────────────────────

export async function logMessage(
  message: string,
  level: 'log' | 'info' | 'warning' | 'error' = 'log'
): Promise<void> {
  const crashlytics = getCrashlytics();
  const sentry = getSentry();

  if (crashlytics) await crashlytics.log(message);
  if (sentry) sentry.addBreadcrumb({ message, level });
}

// ─── track screen view ────────────────────────────────────────────────────────

export async function trackScreenView(screenName: string): Promise<void> {
  const sentry = getSentry();
  if (sentry) {
    sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigate to ${screenName}`,
      level: 'info',
    });
  }
}
