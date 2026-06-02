// TODO: Phase 2 — log custom events to Firebase Analytics
// TODO: Phase 2 — track quiz sessions, subject engagement, premium conversions
// TODO: Phase 2 — build server-side analytics aggregation with Cloud Functions

import type { AnalyticsSummary } from '../types';

export async function getUserAnalytics(_uid: string): Promise<AnalyticsSummary> {
  // TODO: Phase 2 — aggregate from Firestore progress collection
  return DEMO_ANALYTICS;
}

export function logEvent(_eventName: string, _params?: Record<string, unknown>): void {
  // TODO: Phase 2 — call Firebase Analytics logEvent
  if (__DEV__) {
    console.log('[Analytics]', _eventName, _params);
  }
}

// Demo data for Phase 1 UI
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
