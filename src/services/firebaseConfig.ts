import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// TODO: Phase 1 — populate from EXPO_PUBLIC_FIREBASE_* env vars
// TODO: Phase 2 — enable phone auth, app check
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

// Guard against double-init in hot reload
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

export { app, auth, firestore, storage };

// ─── Firestore Collection Keys ─────────────────────────────────────────────
export const COLLECTIONS = {
  // Phase 1
  users: 'users',
  profiles: 'profiles',
  roles: 'roles',
  schools: 'schools',
  subscriptions: 'subscriptions',
  settings: 'settings',
  leaderboard: 'leaderboard',
  gamification: 'gamification',
  // Phase 2 — curriculum data
  forms: 'forms',
  subjects: 'subjects',
  topics: 'topics',
  learningPacks: 'learning_packs',
  studentProgress: 'student_progress',
  // Phase 3 — quiz engine
  questions: 'questions',
  quizAttempts: 'quiz_attempts',
  quizAnswers: 'quiz_answers',
  dailyUsage: 'daily_usage',
  // Phase 4 — subscription & payments
  subscriptionPlans: 'subscription_plans',
  paymentRequests: 'payment_requests',
  familyProfiles: 'family_profiles',
  premiumUnlockEvents: 'premium_unlock_events',
  // Phase 5 — gamification
  gamificationProfiles: 'gamification_profiles',
  xpLogs: 'xp_logs',
  coinLogs: 'coin_logs',
  streaks: 'streaks',
  badges: 'badges',
  userBadges: 'user_badges',
  dailyMissions: 'daily_missions',
  userDailyMissions: 'user_daily_missions',
  leaderboardScores: 'leaderboard_scores',
  rewardBoxes: 'reward_boxes',
} as const;
