// Web-only crash reporting shim.
//
// Expo Web must not import React Native Firebase native modules because Metro
// resolves static require calls during bundling. This platform file is selected
// before crashReportingService.ts on web and keeps Firebase/Sentry native code
// out of the web bundle while preserving the same public API.

export async function initCrashReporting(): Promise<void> {
  return Promise.resolve();
}

export async function setUserContext(
  _userId: string,
  _subscriptionStatus: string,
): Promise<void> {
  return Promise.resolve();
}

export async function clearUserContext(): Promise<void> {
  return Promise.resolve();
}

export async function logError(
  error: Error,
  context?: Record<string, string>,
): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[CrashReporting:web] logError skipped', error, context);
  }
  return Promise.resolve();
}

export async function logMessage(
  message: string,
  level: 'log' | 'info' | 'warning' | 'error' = 'log',
): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console[level === 'warning' ? 'warn' : level](message);
  }
  return Promise.resolve();
}

export async function trackScreenView(_screenName: string): Promise<void> {
  return Promise.resolve();
}
