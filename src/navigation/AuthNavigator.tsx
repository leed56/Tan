import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types';
import { VIEWPORT_CARD } from './stackCardStyle';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OTPLoginScreen } from '../screens/auth/OTPLoginScreen';
import { OTPVerifyScreen } from '../screens/auth/OTPVerifyScreen';
import { CreateProfileScreen } from '../screens/onboarding/CreateProfileScreen';
import { SubjectSelectionScreen } from '../screens/onboarding/SubjectSelectionScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true, ...VIEWPORT_CARD }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OTPLogin" component={OTPLoginScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
    </Stack.Navigator>
  );
}
