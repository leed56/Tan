import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../theme';
import type {
  AppTabParamList,
  HomeStackParamList,
  SubjectsStackParamList,
  ProfileStackParamList,
  AppRootStackParamList,
} from '../types';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SubjectsScreen } from '../screens/subjects/SubjectsScreen';
import { TopicsScreen } from '../screens/topics/TopicsScreen';
import { LearningPackDetailScreen } from '../screens/learningPack/LearningPackDetailScreen';
import { PackCompletionScreen } from '../screens/learningPack/PackCompletionScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { FormSelectorModal } from '../screens/curriculum/FormSelectorModal';
import { QuizIntroScreen } from '../screens/quiz/QuizIntroScreen';
import { MCQScreen } from '../screens/quiz/MCQScreen';
import { FIBScreen } from '../screens/quiz/FIBScreen';
import { TFScreen } from '../screens/quiz/TFScreen';
import { QuizResultScreen } from '../screens/quiz/QuizResultScreen';
// Phase 4 — subscription screens
import { SubscriptionScreen } from '../screens/subscription/SubscriptionScreen';
import { PaymentMethodScreen } from '../screens/subscription/PaymentMethodScreen';
import { LockedFeaturePreviewScreen } from '../screens/subscription/LockedFeaturePreviewScreen';
import { SubscriptionStatusScreen } from '../screens/subscription/SubscriptionStatusScreen';
import { FamilyProfilesScreen } from '../screens/subscription/FamilyProfilesScreen';
// Phase 5 — gamification screens
import { GamificationProfileScreen } from '../screens/gamification/GamificationProfileScreen';
import { DailyMissionsScreen } from '../screens/gamification/DailyMissionsScreen';
import { RewardsScreen } from '../screens/gamification/RewardsScreen';
import { BadgesScreen } from '../screens/gamification/BadgesScreen';
import { AchievementsScreen } from '../screens/gamification/AchievementsScreen';
import { WeeklyLeaderboardScreen } from '../screens/gamification/WeeklyLeaderboardScreen';
import { MonthlyLeaderboardScreen } from '../screens/gamification/MonthlyLeaderboardScreen';

const RootStack = createStackNavigator<AppRootStackParamList>();
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
      <HomeStack.Screen name="QuizIntro" component={QuizIntroScreen} />
      <HomeStack.Screen name="MCQQuiz"   component={MCQScreen} />
      <HomeStack.Screen name="FIBQuiz"   component={FIBScreen} />
      <HomeStack.Screen name="TFQuiz"    component={TFScreen} />
      <HomeStack.Screen name="QuizResult" component={QuizResultScreen} />
      <HomeStack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
      <HomeStack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <HomeStack.Screen name="LockedFeaturePreview" component={LockedFeaturePreviewScreen} />
      <HomeStack.Screen name="GamificationProfile" component={GamificationProfileScreen} />
      <HomeStack.Screen name="DailyMissions" component={DailyMissionsScreen} />
      <HomeStack.Screen name="Rewards" component={RewardsScreen} />
      <HomeStack.Screen name="Badges" component={BadgesScreen} />
      <HomeStack.Screen name="Achievements" component={AchievementsScreen} />
      <HomeStack.Screen name="WeeklyLeaderboard" component={WeeklyLeaderboardScreen} />
      <HomeStack.Screen name="MonthlyLeaderboard" component={MonthlyLeaderboardScreen} />
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
      <SubjectsStack.Screen name="QuizIntro" component={QuizIntroScreen} />
      <SubjectsStack.Screen name="MCQQuiz"   component={MCQScreen} />
      <SubjectsStack.Screen name="FIBQuiz"   component={FIBScreen} />
      <SubjectsStack.Screen name="TFQuiz"    component={TFScreen} />
      <SubjectsStack.Screen name="QuizResult" component={QuizResultScreen} />
      <SubjectsStack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
      <SubjectsStack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <SubjectsStack.Screen name="LockedFeaturePreview" component={LockedFeaturePreviewScreen} />
      <SubjectsStack.Screen name="GamificationProfile" component={GamificationProfileScreen} />
      <SubjectsStack.Screen name="DailyMissions" component={DailyMissionsScreen} />
      <SubjectsStack.Screen name="Rewards" component={RewardsScreen} />
      <SubjectsStack.Screen name="Badges" component={BadgesScreen} />
      <SubjectsStack.Screen name="Achievements" component={AchievementsScreen} />
      <SubjectsStack.Screen name="WeeklyLeaderboard" component={WeeklyLeaderboardScreen} />
      <SubjectsStack.Screen name="MonthlyLeaderboard" component={MonthlyLeaderboardScreen} />
    </SubjectsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="SubscriptionStatus" component={SubscriptionStatusScreen} />
      <ProfileStack.Screen name="FamilyProfiles" component={FamilyProfilesScreen} />
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

function MainTabsNavigator() {
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

export function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <RootStack.Screen
        name="FormSelectorModal"
        component={FormSelectorModal}
        options={{ presentation: 'transparentModal', cardOverlayEnabled: false }}
      />
    </RootStack.Navigator>
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
