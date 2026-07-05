import './global.css';
import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebPhoneFrame } from './src/components/WebPhoneFrame';
import { DevDataModeBanner } from './src/components/DevDataModeBanner';
import { initCrashReporting } from './src/services/crashReportingService';
import { initOfflineSupport } from './src/services/offlineService';
import { useAuthStore } from './src/store/authStore';
import { useSubscriptionStore } from './src/store/subscriptionStore';
import { useFamilyStore } from './src/store/familyStore';
import { registerDevice } from './src/services/deviceService';
import { notify } from './src/utils/confirm';

// Keep the native splash visible until persisted state is rehydrated
SplashScreen.preventAutoHideAsync();

export default function App() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  // Fonts are bundled assets, so this resolves almost instantly; fontError
  // still releases the splash so a (near-impossible) load failure degrades to
  // the system font instead of blanking the app.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const uid = useAuthStore((s) => s.user?.uid);
  const startSubscriptionListening = useSubscriptionStore((s) => s.startListening);
  const stopSubscriptionListening = useSubscriptionStore((s) => s.stopListening);
  const startFamilyListening = useFamilyStore((s) => s.startListening);
  const stopFamilyListening = useFamilyStore((s) => s.stopListening);
  const subscription = useSubscriptionStore((s) => s.subscription);
  const planMaxDevices = useSubscriptionStore((s) => s.planMaxDevices);

  const onReady = useCallback(async () => {
    await SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // Initialize crash reporting and offline support (both no-op gracefully when
    // their native modules are unavailable, e.g. in Expo Go).
    initCrashReporting().catch(() => {});
    initOfflineSupport().catch(() => {});
    // TODO: Phase 2 — initialize Firebase Analytics, FCM token registration
    // TODO: Phase 2 — check for app updates (expo-updates)
  }, []);

  useEffect(() => {
    // Hide the native splash once the persisted session has rehydrated AND
    // fonts are ready; a timeout fallback guarantees we never get stuck.
    if (hasHydrated && (fontsLoaded || fontError)) SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 3000);
    return () => clearTimeout(t);
  }, [hasHydrated, fontsLoaded, fontError]);

  // Real-time subscription + family-profile listeners, app-wide — this is what
  // makes admin-panel activation reflect instantly (no manual refresh needed),
  // and keeps isPremium()/child profiles accurate on every screen, not just
  // the ones that happen to fetch them on mount.
  useEffect(() => {
    if (!uid) {
      stopSubscriptionListening();
      stopFamilyListening();
      return;
    }
    startSubscriptionListening(uid);
    startFamilyListening(uid);
    return () => {
      stopSubscriptionListening();
      stopFamilyListening();
    };
  }, [uid, startSubscriptionListening, stopSubscriptionListening, startFamilyListening, stopFamilyListening]);

  // Device-limit registration — everyone is capped: Free 2, Standard 2,
  // Family 5. Runs on real (Google) sign-in, where the uid is stable per user
  // so the count is meaningful. Free users (no active/demo subscription) get 2.
  useEffect(() => {
    if (!uid) return;
    const isPaid = subscription?.status === 'active' || subscription?.status === 'demo';
    const maxDevices = isPaid ? planMaxDevices() : 2;
    registerDevice(uid, maxDevices)
      .then(({ blocked }) => {
        if (blocked) {
          notify(
            'Device limit reached',
            `This account is signed in on ${maxDevices} device${maxDevices > 1 ? 's' : ''} already. Remove one in Profile → Subscription → Manage Devices to use this one.`,
          );
        }
      })
      .catch(() => {});
  }, [uid, subscription, planMaxDevices]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <WebPhoneFrame>
          <NavigationContainer onReady={onReady}>
            <RootNavigator />
          </NavigationContainer>
          <DevDataModeBanner />
        </WebPhoneFrame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
