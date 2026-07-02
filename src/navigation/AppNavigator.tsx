import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../theme';
import type {
  AppTabParamList,
  HomeStackParamList,
  SubjectsStackParamList,
  ProfileStackParamList,
  AppRootStackParamList,
} from '../types';
import { VIEWPORT_CARD } from './stackCardStyle';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SubjectsScreen } from '../screens/subjects/SubjectsScreen';
import { TopicsScreen } from '../screens/topics/TopicsScreen';
import { LearningPackDetailScreen } from '../screens/learningPack/LearningPackDetailScreen';
import { PackCompletionScreen } from '../screens/learningPack/PackCompletionScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { FormSelectorModal } from '../screens/curriculum/FormSelectorModal';
import { QuizIntroScreen } from '../screens/quiz/QuizIntroScreen';
import { MCQScreen } from '../screens/quiz/MCQScreen';
import { FIBScreen } from '../screens/quiz/FIBScreen';
import { TFScreen } from '../screens/quiz/TFScreen';
import { HOQScreen } from '../screens/quiz/HOQScreen';
import { SummaryScreen } from '../screens/quiz/SummaryScreen';
import { QuizResultScreen } from '../screens/quiz/QuizResultScreen';
// Phase 4 — subscription screens
import { SubscriptionScreen } from '../screens/subscription/SubscriptionScreen';
import { PaymentMethodScreen } from '../screens/subscription/PaymentMethodScreen';
import { LockedFeaturePreviewScreen } from '../screens/subscription/LockedFeaturePreviewScreen';
import { SubscriptionStatusScreen } from '../screens/subscription/SubscriptionStatusScreen';
import { FamilyProfilesScreen } from '../screens/subscription/FamilyProfilesScreen';
import { ManageDevicesScreen } from '../screens/subscription/ManageDevicesScreen';
// Phase 5 — gamification screens
import { GamificationProfileScreen } from '../screens/gamification/GamificationProfileScreen';
import { DailyMissionsScreen } from '../screens/gamification/DailyMissionsScreen';
import { RewardsScreen } from '../screens/gamification/RewardsScreen';
import { BadgesScreen } from '../screens/gamification/BadgesScreen';
import { AchievementsScreen } from '../screens/gamification/AchievementsScreen';
import { WeeklyLeaderboardScreen } from '../screens/gamification/WeeklyLeaderboardScreen';
import { MonthlyLeaderboardScreen } from '../screens/gamification/MonthlyLeaderboardScreen';
// Phase 6 — AI explanation screens
import { ExplanationScreen } from '../screens/explanation/ExplanationScreen';
import { LearningPackReviewScreen } from '../screens/explanation/LearningPackReviewScreen';
import { WrongAnswerReviewScreen } from '../screens/explanation/WrongAnswerReviewScreen';
import { ExplanationFeedbackScreen } from '../screens/explanation/ExplanationFeedbackScreen';
// Dev tooling
import { DevTestMenuScreen } from '../screens/dev/DevTestMenuScreen';

const RootStack = createStackNavigator<AppRootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SubjectsStack = createStackNavigator<SubjectsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, ...VIEWPORT_CARD }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Topics" component={TopicsScreen} />
      <HomeStack.Screen name="LearningPackDetail" component={LearningPackDetailScreen} />
      <HomeStack.Screen name="PackCompletion" component={PackCompletionScreen} />
      <HomeStack.Screen name="QuizIntro" component={QuizIntroScreen} />
      <HomeStack.Screen name="MCQQuiz"   component={MCQScreen} />
      <HomeStack.Screen name="FIBQuiz"   component={FIBScreen} />
      <HomeStack.Screen name="TFQuiz"    component={TFScreen} />
      <HomeStack.Screen name="HOQQuiz"   component={HOQScreen} />
      <HomeStack.Screen name="SummaryPack" component={SummaryScreen} />
      <HomeStack.Screen name="QuizResult" component={QuizResultScreen} />
      <HomeStack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
      <HomeStack.Screen name="SubscriptionStatus" component={SubscriptionStatusScreen} />
      <HomeStack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <HomeStack.Screen name="LockedFeaturePreview" component={LockedFeaturePreviewScreen} />
      <HomeStack.Screen name="GamificationProfile" component={GamificationProfileScreen} />
      <HomeStack.Screen name="DailyMissions" component={DailyMissionsScreen} />
      <HomeStack.Screen name="Rewards" component={RewardsScreen} />
      <HomeStack.Screen name="Badges" component={BadgesScreen} />
      <HomeStack.Screen name="Achievements" component={AchievementsScreen} />
      <HomeStack.Screen name="WeeklyLeaderboard" component={WeeklyLeaderboardScreen} />
      <HomeStack.Screen name="MonthlyLeaderboard" component={MonthlyLeaderboardScreen} />
      <HomeStack.Screen name="ExplanationScreen" component={ExplanationScreen} />
      <HomeStack.Screen name="LearningPackReview" component={LearningPackReviewScreen} />
      <HomeStack.Screen name="WrongAnswerReview" component={WrongAnswerReviewScreen} />
      <HomeStack.Screen name="ExplanationFeedback" component={ExplanationFeedbackScreen} options={{ presentation: 'transparentModal', cardOverlayEnabled: true }} />
      {__DEV__ && <HomeStack.Screen name="DevTestMenu" component={DevTestMenuScreen} />}
    </HomeStack.Navigator>
  );
}

function SubjectsStackNavigator() {
  return (
    <SubjectsStack.Navigator screenOptions={{ headerShown: false, ...VIEWPORT_CARD }}>
      <SubjectsStack.Screen name="Subjects" component={SubjectsScreen} />
      <SubjectsStack.Screen name="Topics" component={TopicsScreen} />
      <SubjectsStack.Screen name="LearningPackDetail" component={LearningPackDetailScreen} />
      <SubjectsStack.Screen name="PackCompletion" component={PackCompletionScreen} />
      <SubjectsStack.Screen name="QuizIntro" component={QuizIntroScreen} />
      <SubjectsStack.Screen name="MCQQuiz"   component={MCQScreen} />
      <SubjectsStack.Screen name="FIBQuiz"   component={FIBScreen} />
      <SubjectsStack.Screen name="TFQuiz"    component={TFScreen} />
      <SubjectsStack.Screen name="HOQQuiz"   component={HOQScreen} />
      <SubjectsStack.Screen name="SummaryPack" component={SummaryScreen} />
      <SubjectsStack.Screen name="QuizResult" component={QuizResultScreen} />
      <SubjectsStack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
      <SubjectsStack.Screen name="SubscriptionStatus" component={SubscriptionStatusScreen} />
      <SubjectsStack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <SubjectsStack.Screen name="LockedFeaturePreview" component={LockedFeaturePreviewScreen} />
      <SubjectsStack.Screen name="GamificationProfile" component={GamificationProfileScreen} />
      <SubjectsStack.Screen name="DailyMissions" component={DailyMissionsScreen} />
      <SubjectsStack.Screen name="Rewards" component={RewardsScreen} />
      <SubjectsStack.Screen name="Badges" component={BadgesScreen} />
      <SubjectsStack.Screen name="Achievements" component={AchievementsScreen} />
      <SubjectsStack.Screen name="WeeklyLeaderboard" component={WeeklyLeaderboardScreen} />
      <SubjectsStack.Screen name="MonthlyLeaderboard" component={MonthlyLeaderboardScreen} />
      <SubjectsStack.Screen name="ExplanationScreen" component={ExplanationScreen} />
      <SubjectsStack.Screen name="LearningPackReview" component={LearningPackReviewScreen} />
      <SubjectsStack.Screen name="WrongAnswerReview" component={WrongAnswerReviewScreen} />
      <SubjectsStack.Screen name="ExplanationFeedback" component={ExplanationFeedbackScreen} options={{ presentation: 'transparentModal', cardOverlayEnabled: true }} />
    </SubjectsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, ...VIEWPORT_CARD }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="SubscriptionStatus" component={SubscriptionStatusScreen} />
      <ProfileStack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
      <ProfileStack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <ProfileStack.Screen name="FamilyProfiles" component={FamilyProfilesScreen} />
      <ProfileStack.Screen name="ManageDevices" component={ManageDevicesScreen} />
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

// __DEV__-only floating shortcut into the Dev Test Menu, visible from any
// tab — the alternative (a persistent extra tab item) would risk shipping
// visibly in a release build if the __DEV__ guard were ever missed.
function DevMenuFab() {
  const navigation = useNavigation<any>();
  if (!__DEV__) return null;
  return (
    <TouchableOpacity
      style={styles.devFab}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('HomeTab', { screen: 'DevTestMenu' })}
    >
      <Ionicons name="flask" size={20} color="#1A1A1A" />
    </TouchableOpacity>
  );
}

function MainTabsNavigator() {
  return (
    <View style={styles.tabsRoot}>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const config = TAB_CONFIG[route.name as keyof AppTabParamList];
          return {
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: styles.tabLabel,
            // Force the phone-style icon-above-label layout at every viewport
            // width. Left at its default, @react-navigation/bottom-tabs
            // switches to a side-by-side "beside-icon" layout above ~480px —
            // our custom tabBarIcon/tabBarLabel render functions are sized
            // and positioned for stacking, so on a wide desktop browser the
            // icon and label overlap instead of switching layouts cleanly.
            tabBarLabelPosition: 'below-icon',
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
      <DevMenuFab />
    </View>
  );
}

export function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, ...VIEWPORT_CARD }}>
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
  tabsRoot: { flex: 1 },
  devFab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
