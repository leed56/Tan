import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  persistentLocalCache,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// `isFirebaseConfigured()` (checked by every service before touching
// Firestore/Auth/Storage) reads this exact env var, so leaving it unset is
// the supported way to run the app fully offline against local seed data —
// e.g. for local dev/testing without real credentials. But the Firebase SDK
// itself validates `apiKey`'s format at `getAuth()`/`initializeApp()` time and
// throws synchronously on an empty string, which would crash the whole app
// before a single screen renders. Substitute a syntactically-valid dummy
// config in that case so the SDK objects construct cleanly; every real
// network call downstream still stays gated on the real env var below.
const hasRealCredentials = !!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Enable offline persistence with unlimited cache size
  firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
  });
} else {
  app = getApps()[0];
  firestore = getFirestore(app);
}

auth = getAuth(app);
storage = getStorage(app);

// Ensure a real Firebase Auth session exists so Firestore reads satisfy the
// `isSignedIn()` security rules. The phone/OTP flow is still demo-only, so until
// real auth is wired we sign in anonymously; otherwise every curriculum read is
// permission-denied and the app silently falls back to local seed data.
// Gated on the real env var, not `firebaseConfig.projectId` (which is always
// truthy now thanks to the dummy fallback above).
if (hasRealCredentials) {
  onAuthStateChanged(auth, (user) => {
    if (!user) signInAnonymously(auth).catch(() => {});
  });
}

// One-time startup diagnostic so it's unambiguous which data source the app is
// using. Without a real EXPO_PUBLIC_FIREBASE_PROJECT_ID (e.g. a fresh clone
// with no .env — .env is gitignored) every service silently falls back to the
// local seed dataset, which reads as "mock data / only 4 topics" with no error.
if (hasRealCredentials) {
  console.log(
    `%c[Soma] LIVE MODE — Firestore project "${firebaseConfig.projectId}". Real curriculum will load if it's been seeded there.`,
    'color:#4ECDC4;font-weight:bold',
  );
} else {
  console.warn(
    '%c[Soma] OFFLINE SEED MODE — no EXPO_PUBLIC_FIREBASE_PROJECT_ID found. ' +
      'The app is showing LOCAL SEED DATA (this is why you see only the demo topics/questions). ' +
      'Create a .env from .env.example with your Firebase keys and restart with `expo start -c` to load real data.',
    'color:#F7C52E;font-weight:bold',
  );
}

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
  familyChildren: 'family_children',
  devices: 'devices',
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
  // Phase 6 — AI explanations
  aiExplanations: 'ai_explanations',
  aiPromptTemplates: 'ai_prompt_templates',
  aiQualityLogs: 'ai_quality_logs',
  explanationFeedback: 'ai_feedback',
} as const;
