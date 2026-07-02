import './global.css';
import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebPhoneFrame } from './src/components/WebPhoneFrame';
import { DevDataModeBanner } from './src/components/DevDataModeBanner';
import { initCrashReporting } from './src/services/crashReportingService';
import { initOfflineSupport } from './src/services/offlineService';
import { useAuthStore } from './src/store/authStore';
import { useSubscriptionStore } from './src/store/subscriptionStore';
import { useFamilyStore } from './src/store/familyStore';
import { registerDevice } from './src/services/deviceService';

// Keep the native splash visible until persisted state is rehydrated
SplashScreen.preventAutoHideAsync();

export default function App() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
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
    // Hide the native splash once the persisted session has rehydrated; a
    // timeout fallback guarantees we never get stuck on the native splash.
    if (hasHydrated) SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 3000);
    return () => clearTimeout(t);
  }, [hasHydrated]);

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

  // Device-limit registration — only meaningfully capped for paying plans;
  // free accounts get a generous, effectively unlimited allowance here.
  useEffect(() => {
    if (!uid || !subscription) return;
    const isPaid = subscription.status === 'active' || subscription.status === 'demo';
    const maxDevices = isPaid ? planMaxDevices() : 99;
    registerDevice(uid, maxDevices).catch(() => {});
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
