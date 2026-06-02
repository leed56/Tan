/**
 * Progress Service — Phase 2
 * Reads/writes student_progress documents keyed by `${userId}_${learningPackId}`.
 *
 * TODO: Phase 3 — Firestore real-time listener via onSnapshot
 * TODO: Phase 3 — batch updates for offline queuing
 * TODO: Phase 3 — aggregate stats (accuracy, time spent) into a summary doc
 */

import { firestore } from './firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import type { StudentProgress, SubjectProgressSummary, TopicProgressSummary } from '../types/curriculum';
import { COLLECTIONS } from './firebaseConfig';

function progressId(userId: string, learningPackId: string): string {
  return `${userId}_${learningPackId}`;
}

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getStudentProgress(userId: string): Promise<StudentProgress[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.studentProgress),
        where('userId', '==', userId),
      ),
    );
    return snap.docs.map((d) => d.data() as StudentProgress);
  } catch {
    return [];
  }
}

export async function getSubjectProgress(
  userId: string,
  subjectId: string,
): Promise<SubjectProgressSummary | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.studentProgress),
        where('userId', '==', userId),
        where('subjectId', '==', subjectId),
      ),
    );
    const records = snap.docs.map((d) => d.data() as StudentProgress);
    return aggregateSubjectProgress(subjectId, records);
  } catch {
    return null;
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface ProgressUpdate {
  formId: string;
  subjectId: string;
  topicId: string;
  progressPercent: number;
  xpEarned: number;
  isCompleted: boolean;
}

export async function updateLearningPackProgress(
  userId: string,
  learningPackId: string,
  data: ProgressUpdate,
): Promise<void> {
  const id = progressId(userId, learningPackId);
  const record: StudentProgress = {
    id,
    userId,
    formId: data.formId,
    subjectId: data.subjectId,
    topicId: data.topicId,
    learningPackId,
    progressPercent: data.progressPercent,
    status: data.isCompleted ? 'completed' : data.progressPercent > 0 ? 'in_progress' : 'not_started',
    lastOpenedAt: Date.now(),
    completedAt: data.isCompleted ? Date.now() : null,
    xpEarned: data.xpEarned,
  };

  if (!isFirebaseConfigured()) {
    // TODO: Phase 3 — queue to AsyncStorage for later sync
    return;
  }
  try {
    await setDoc(doc(firestore, COLLECTIONS.studentProgress, id), record, { merge: true });
  } catch (e) {
    console.warn('[progressService] write failed', e);
  }
}

// ─── Aggregation helpers ──────────────────────────────────────────────────────

export function aggregateSubjectProgress(
  subjectId: string,
  records: StudentProgress[],
): SubjectProgressSummary {
  const mine = records.filter((r) => r.subjectId === subjectId);
  const completed = mine.filter((r) => r.status === 'completed').length;
  const inProgress = mine.filter((r) => r.status === 'in_progress').length;
  const totalXp = mine.reduce((sum, r) => sum + r.xpEarned, 0);
  const total = mine.length;
  return {
    subjectId,
    totalPacks: total,
    completedPacks: completed,
    inProgressPacks: inProgress,
    progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalXpEarned: totalXp,
  };
}

export function aggregateTopicProgress(
  topicId: string,
  records: StudentProgress[],
  totalPacks: number,
): TopicProgressSummary {
  const mine = records.filter((r) => r.topicId === topicId);
  const completed = mine.filter((r) => r.status === 'completed').length;
  return {
    topicId,
    totalPacks,
    completedPacks: completed,
    progressPercent: totalPacks > 0 ? Math.round((completed / totalPacks) * 100) : 0,
  };
}

export function aggregatePackProgress(
  learningPackId: string,
  records: StudentProgress[],
): { progressPercent: number; isCompleted: boolean } {
  const rec = records.find((r) => r.learningPackId === learningPackId);
  return {
    progressPercent: rec?.progressPercent ?? 0,
    isCompleted: rec?.status === 'completed',
  };
}
