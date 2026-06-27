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

// Keep the native splash visible until fonts/data are ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const onReady = useCallback(async () => {
    // TODO: Phase 2 — load fonts (expo-font), restore auth state, prefetch user data
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Initialize crash reporting and offline support (both no-op gracefully when
    // their native modules are unavailable, e.g. in Expo Go).
    initCrashReporting().catch(() => {});
    initOfflineSupport().catch(() => {});
    // TODO: Phase 2 — initialize Firebase Analytics, FCM token registration
    // TODO: Phase 2 — check for app updates (expo-updates)
  }, []);

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
