// ─── User & Auth ────────────────────────────────────────────────────────────

export interface FirebaseUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AuthState = 'unauthenticated' | 'authenticated' | 'loading';

// ─── Profile ─────────────────────────────────────────────────────────────────

export type FormLevel = 1 | 2 | 3 | 4;

export type AvatarId =
  | 'avatar_1'
  | 'avatar_2'
  | 'avatar_3'
  | 'avatar_4'
  | 'avatar_5'
  | 'avatar_6'
  | 'avatar_7'
  | 'avatar_8';

export interface UserProfile {
  uid: string;
  name: string;
  form: FormLevel;
  school: string | null;
  avatarId: AvatarId;
  selectedSubjectIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'premium' | 'school';

export interface Subscription {
  uid: string;
  tier: SubscriptionTier;
  expiresAt: number | null;
  schoolId: string | null;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  coins: number;
  badges: Badge[];
  lastActiveDate: string | null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt: number | null;
  isEarned: boolean;
}

// ─── Subjects & Content ──────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  iconName: string;
  color: string;
  gradientColors: string[];
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  isPremium: boolean;
  form: FormLevel[];
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  packCount: number;
  completedPacks: number;
  progressPercent: number;
  estimatedMinutes: number;
  form: FormLevel;
}

export type PackType = 'mcq' | 'fib' | 'tf' | 'hoq' | 'summary';

export interface LearningPack {
  id: string;
  topicId: string;
  subjectId: string;
  title: string;
  description: string;
  type: PackType;
  questionCount: number;
  xpReward: number;
  isPremium: boolean;
  isCompleted: boolean;
  completionPercent: number;
  estimatedMinutes: number;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export type LeaderboardTab = 'national' | 'school' | 'friends';

export interface LeaderboardEntry {
  uid: string;
  name: string;
  avatarId: AvatarId;
  form: FormLevel;
  school: string;
  xp: number;
  rank: number;
  weeklyXp: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface SubjectMastery {
  subjectId: string;
  subjectName: string;
  masteryPercent: number;
  color: string;
}

export interface AnalyticsSummary {
  totalXp: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
  studyStreakDays: number;
  consistencyPercent: number;
  strongSubjects: SubjectMastery[];
  weakSubjects: SubjectMastery[];
  weeklyActivity: number[];
}

// ─── Navigation Params ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  OTPLogin: undefined;
  OTPVerify: { phoneNumber: string };
  CreateProfile: undefined;
  SubjectSelection: undefined;
};

export type QuizStackSharedParams = {
  QuizIntro: { packId: string; packTitle: string; topicId: string; subjectColor: string; formId: string; subjectId: string; quizType: 'mcq' | 'fib' | 'tf' };
  MCQQuiz: { packId: string; packTitle: string; topicId: string; subjectColor: string; formId: string; subjectId: string };
  FIBQuiz: { packId: string; packTitle: string; topicId: string; subjectColor: string; formId: string; subjectId: string };
  TFQuiz:  { packId: string; packTitle: string; topicId: string; subjectColor: string; formId: string; subjectId: string };
  QuizResult: { xpEarned: number; scorePercent: number; correctCount: number; wrongCount: number; totalQuestions: number; packTitle: string; packId: string; topicId: string; subjectColor: string; formId: string; subjectId: string; quizType: 'mcq' | 'fib' | 'tf' };
  // Phase 4 — subscription screens
  SubscriptionScreen: undefined;
  PaymentMethodScreen: { planId: string; planTitle: string; priceMonthly: number };
  LockedFeaturePreview: { featureKey: string; featureTitle: string; featureDescription: string };
  // Phase 5 — gamification screens
  GamificationProfile: undefined;
  DailyMissions: undefined;
  Rewards: undefined;
  Badges: undefined;
  Achievements: undefined;
  WeeklyLeaderboard: undefined;
  MonthlyLeaderboard: undefined;
  // Phase 6 — AI explanation screens
  ExplanationScreen: {
    questionId: string;
    questionText: string;
    quizType: 'mcq' | 'fib' | 'tf';
    subjectId: string;
    formId: string;
    correctAnswer: string;
    options: Array<{ id: string; text: string }>;
    packTitle: string;
    subjectColor: string;
    fallbackExplanation: string;
  };
  LearningPackReview: {
    packId: string;
    packTitle: string;
    subjectId: string;
    formId: string;
    topicId: string;
    subjectColor: string;
  };
  WrongAnswerReview: {
    packId: string;
    packTitle: string;
    subjectId: string;
    formId: string;
    topicId: string;
    subjectColor: string;
  };
  ExplanationFeedback: {
    questionId: string;
    explanationId: string;
    packTitle: string;
  };
};

export type HomeStackParamList = QuizStackSharedParams & {
  Home: undefined;
  // formId is optional for backward compat — falls back to curriculumStore.selectedFormId
  Topics: { subjectId: string; subjectName: string; color: string; formId?: string };
  LearningPackDetail: { packId: string; packTitle: string; topicId: string; subjectColor: string; formId?: string; subjectId?: string };
  PackCompletion: { xpEarned: number; packTitle: string; streakDays: number };
};

export type SubjectsStackParamList = QuizStackSharedParams & {
  Subjects: undefined;
  Topics: { subjectId: string; subjectName: string; color: string; formId?: string };
  LearningPackDetail: { packId: string; packTitle: string; topicId: string; subjectColor: string; formId?: string; subjectId?: string };
  PackCompletion: { xpEarned: number; packTitle: string; streakDays: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  SubscriptionStatus: undefined;
  FamilyProfiles: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  SubjectsTab: undefined;
  LeaderboardTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

// Phase 2 — root modal stack wrapping the Tab navigator
export type AppRootStackParamList = {
  MainTabs: undefined;
  FormSelectorModal: undefined;
};
