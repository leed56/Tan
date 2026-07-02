import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { COLORS } from '../theme';
import type { RootStackParamList } from '../types';
import { VIEWPORT_CARD } from './stackCardStyle';

const Root = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const profile = useProfileStore((s) => s.profile);
  const profileHydrated = useProfileStore((s) => s.hasHydrated);

  // Wait for both persisted stores to rehydrate before choosing a stack, so a
  // logged-in user isn't briefly bounced to the auth flow on cold start.
  if (!authHydrated || !profileHydrated) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bgDark }} />;
  }

  // isAuthenticated flips true right after OTP verification, before the
  // profile/subject-selection steps run — gating on it alone would swap to
  // the main app mid-onboarding and skip both screens. Onboarding isn't done
  // until a profile exists with at least one selected subject.
  const isOnboarded =
    isAuthenticated && !!profile && profile.selectedSubjectIds.length > 0;

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animationEnabled: false, ...VIEWPORT_CARD }}>
      {isOnboarded ? (
        <Root.Screen name="App" component={AppNavigator} />
      ) : (
        <Root.Screen name="Auth" component={AuthNavigator} />
      )}
    </Root.Navigator>
  );
}
