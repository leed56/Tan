import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { COLORS } from '../theme';
import type { RootStackParamList } from '../types';

const Root = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Wait for the persisted session to rehydrate before choosing a stack, so a
  // logged-in user isn't briefly bounced to the auth flow on cold start.
  if (!hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bgDark }} />;
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
      {isAuthenticated ? (
        <Root.Screen name="App" component={AppNavigator} />
      ) : (
        <Root.Screen name="Auth" component={AuthNavigator} />
      )}
    </Root.Navigator>
  );
}
