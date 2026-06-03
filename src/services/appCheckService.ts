/**
 * Firebase App Check — Play Integrity (Android) + DeviceCheck (iOS).
 * Install: expo install @react-native-firebase/app-check
 * Requires native build (not compatible with Expo Go).
 */

import { Platform } from 'react-native';

interface AppCheckInstance {
  activate(provider: string, isTokenAutoRefreshEnabled?: boolean): Promise<void>;
  getToken(forceRefresh?: boolean): Promise<{ token: string }>;
}

function getAppCheck(): AppCheckInstance | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@react-native-firebase/app-check');
    return (m.default ?? m)();
  } catch {
    return null;
  }
}

export async function initAppCheck(): Promise<void> {
  const appCheck = getAppCheck();
  if (!appCheck) return;

  if (Platform.OS === 'android') {
    await appCheck.activate('PLAY_INTEGRITY', true);
  } else if (Platform.OS === 'ios') {
    await appCheck.activate('DEVICE_CHECK', true);
  }
}

export async function getAppCheckToken(): Promise<string | null> {
  const appCheck = getAppCheck();
  if (!appCheck) return null;

  try {
    const result = await appCheck.getToken(false);
    return result.token;
  } catch {
    return null;
  }
}
