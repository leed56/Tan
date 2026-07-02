// TODO: Phase 2 — log custom events to Firebase Analytics

import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore, COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';
import type { AnalyticsSummary, SubjectMastery } from '../types';
import type { QuizAttempt } from '../types/quiz';
import { getGamificationProfile } from './gamificationService';
import { getStudentProgress, aggregateSubjectProgress } from './progressService';
import { SUBJECTS } from '../constants/subjects';

export type AnalyticsPeriod = '7d' | '30d' | '3m';

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = { '7d': 7, '30d': 30, '3m': 90 };
// Bars per period — daily for a week, ~3-day buckets for a month, weekly
// buckets for 3 months, so the chart stays readable at every zoom level.
const PERIOD_BUCKETS: Record<AnalyticsPeriod, number> = { '7d': 7, '30d': 10, '3m': 13 };

async function getAttemptsSince(uid: string, sinceMs: number): Promise<QuizAttempt[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.quizAttempts),
        where('userId', '==', uid),
        where('completedAt', '>=', sinceMs),
      ),
    );
    return snap.docs.map((d) => d.data() as QuizAttempt);
  } catch {
    return [];
  }
}

// Buckets real quiz-attempt activity (questions answered) into `n` equal
// windows spanning the period, most recent bucket last, for the bar chart.
async function getActivityBars(uid: string, period: AnalyticsPeriod): Promise<number[]> {
  const days = PERIOD_DAYS[period];
  const buckets = PERIOD_BUCKETS[period];
  const now = Date.now();
  const since = now - days * 86400000;
  const attempts = await getAttemptsSince(uid, since);
  const bucketMs = (days * 86400000) / buckets;
  const bars = new Array(buckets).fill(0);
  for (const a of attempts) {
    if (!a.completedAt) continue;
    const age = now - a.completedAt;
    const fromEnd = Math.min(buckets - 1, Math.floor(age / bucketMs));
    bars[buckets - 1 - fromEnd] += a.totalQuestions;
  }
  return bars;
}

function subjectMeta(rawSubjectId: string) {
  const bareId = rawSubjectId.replace(/^form_\d+_/, '');
  return SUBJECTS.find((s) => s.id === bareId);
}

async function getSubjectMastery(
  uid: string,
): Promise<{ strong: SubjectMastery[]; weak: SubjectMastery[] }> {
  const records = await getStudentProgress(uid);
  const subjectIds = Array.from(new Set(records.map((r) => r.subjectId)));
  const entries = subjectIds
    .map((subjectId) => {
      const meta = subjectMeta(subjectId);
      const summary = aggregateSubjectProgress(subjectId, records);
      if (!meta || summary.totalPacks === 0) return null;
      return { subjectId, subjectName: meta.name, masteryPercent: summary.progressPercent, color: meta.color };
    })
    .filter((x): x is SubjectMastery => x !== null)
    .sort((a, b) => b.masteryPercent - a.masteryPercent);

  const strong = entries.slice(0, 3);
  // Only show "needs work" once there are enough distinct subjects that it
  // wouldn't just repeat the strengths list.
  const weak = entries.length > 3 ? entries.slice(-3).reverse() : [];
  return { strong, weak };
}

export async function getUserAnalytics(
  uid: string,
  period: AnalyticsPeriod = '7d',
): Promise<AnalyticsSummary> {
  if (!isFirebaseConfigured()) return DEMO_ANALYTICS;
  try {
    const [profile, weeklyActivity, mastery] = await Promise.all([
      getGamificationProfile(uid),
      getActivityBars(uid, period),
      getSubjectMastery(uid),
    ]);
    const accuracyPercent =
      profile.totalQuestions > 0
        ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
        : 0;
    return {
      totalXp: profile.xp,
      totalQuestions: profile.totalQuestions,
      correctAnswers: profile.totalCorrect,
      accuracyPercent,
      studyStreakDays: profile.currentStreak,
      // A streak-based proxy for cadence — real consecutive-day data, not a
      // fabricated number, though it's a simplification of "consistency".
      consistencyPercent: Math.min(100, Math.round((profile.currentStreak / 7) * 100)),
      weeklyActivity,
      strongSubjects: mastery.strong,
      weakSubjects: mastery.weak,
    };
  } catch {
    return DEMO_ANALYTICS;
  }
}

export function logEvent(_eventName: string, _params?: Record<string, unknown>): void {
  // TODO: Phase 2 — call Firebase Analytics logEvent
  if (__DEV__) {
    console.log('[Analytics]', _eventName, _params);
  }
}

// Fallback shown only when Firebase isn't configured (local dev) or a query
// genuinely fails — a real signed-in user with zero activity gets real
// zeros from getUserAnalytics above, not this.
export const DEMO_ANALYTICS: AnalyticsSummary = {
  totalXp: 1240,
  totalQuestions: 87,
  correctAnswers: 68,
  accuracyPercent: 78,
  studyStreakDays: 5,
  consistencyPercent: 71,
  weeklyActivity: [30, 45, 20, 60, 40, 75, 55],
  strongSubjects: [
    { subjectId: 'mathematics', subjectName: 'Mathematics', masteryPercent: 82, color: '#4ECDC4' },
    { subjectId: 'english', subjectName: 'English', masteryPercent: 76, color: '#4A90D9' },
    { subjectId: 'geography', subjectName: 'Geography', masteryPercent: 71, color: '#10B981' },
  ],
  weakSubjects: [
    { subjectId: 'chemistry', subjectName: 'Chemistry', masteryPercent: 34, color: '#7B6FF2' },
    { subjectId: 'physics', subjectName: 'Physics', masteryPercent: 41, color: '#5C6BC0' },
    { subjectId: 'history', subjectName: 'History', masteryPercent: 52, color: '#F59E0B' },
  ],
};
