import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../theme';
import type { AppTabParamList, HomeStackParamList, SubjectsStackParamList, ProfileStackParamList } from '../types';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SubjectsScreen } from '../screens/subjects/SubjectsScreen';
import { TopicsScreen } from '../screens/topics/TopicsScreen';
import { LearningPackDetailScreen } from '../screens/learningPack/LearningPackDetailScreen';
import { PackCompletionScreen } from '../screens/learningPack/PackCompletionScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SubjectsStack = createStackNavigator<SubjectsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Topics" component={TopicsScreen} />
      <HomeStack.Screen name="LearningPackDetail" component={LearningPackDetailScreen} />
      <HomeStack.Screen name="PackCompletion" component={PackCompletionScreen} />
    </HomeStack.Navigator>
  );
}

function SubjectsStackNavigator() {
  return (
    <SubjectsStack.Navigator screenOptions={{ headerShown: false }}>
      <SubjectsStack.Screen name="Subjects" component={SubjectsScreen} />
      <SubjectsStack.Screen name="Topics" component={TopicsScreen} />
      <SubjectsStack.Screen name="LearningPackDetail" component={LearningPackDetailScreen} />
      <SubjectsStack.Screen name="PackCompletion" component={PackCompletionScreen} />
    </SubjectsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<
  keyof AppTabParamList,
  { label: string; icon: TabIconName; iconFocused: TabIconName }
> = {
  HomeTab: { label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  SubjectsTab: { label: 'Subjects', icon: 'book-outline', iconFocused: 'book' },
  LeaderboardTab: { label: 'Ranks', icon: 'trophy-outline', iconFocused: 'trophy' },
  AnalyticsTab: { label: 'Analytics', icon: 'bar-chart-outline', iconFocused: 'bar-chart' },
  ProfileTab: { label: 'Profile', icon: 'person-outline', iconFocused: 'person' },
};

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as keyof AppTabParamList];
        return {
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? config.iconFocused : config.icon}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color }]}>{config.label}</Text>
          ),
        };
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="SubjectsTab" component={SubjectsStackNavigator} />
      <Tab.Screen name="LeaderboardTab" component={LeaderboardScreen} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0E1330',
    borderTopColor: COLORS.glassBorder,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
});
