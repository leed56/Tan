import './global.css';
import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initCrashReporting } from './src/services/crashReportingService';
import { initOfflineSupport } from './src/services/offlineService';
import { useAuthStore } from './src/store/authStore';

// Keep the native splash visible until persisted state is rehydrated
SplashScreen.preventAutoHideAsync();

export default function App() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

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

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer onReady={onReady}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
