/**
 * Quiz Service — Phase 3
 * Firestore-first with local seed data fallback.
 * TODO: Phase 4 — add real-time listeners for live question bank updates
 */

import { firestore } from './firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from './firebaseConfig';
import type { Question, QuizAttempt, QuizAnswer } from '../types/quiz';
import { getSeedQuestionsByPack } from '../utils/seedQuestions';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getQuestionsByLearningPack(
  learningPackId: string,
  _formId: string,
  _subjectId: string,
  _topicId: string,
): Promise<Question[]> {
  if (!isFirebaseConfigured()) {
    return getSeedQuestionsByPack(learningPackId);
  }
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.questions),
        where('learningPackId', '==', learningPackId),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    );
    if (snap.empty) return getSeedQuestionsByPack(learningPackId);
    return snap.docs.map((d) => d.data() as Question);
  } catch {
    return getSeedQuestionsByPack(learningPackId);
  }
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export async function startQuizAttempt(attempt: Omit<QuizAttempt, 'completedAt' | 'correctCount' | 'wrongCount' | 'scorePercent' | 'xpEarned' | 'durationSeconds'>): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(doc(firestore, COLLECTIONS.quizAttempts, attempt.id), {
      ...attempt,
      correctCount: 0,
      wrongCount: 0,
      scorePercent: 0,
      xpEarned: 0,
      completedAt: null,
      durationSeconds: 0,
    });
  } catch {
    // Fire-and-forget; session state is in quizStore
  }
}

export async function completeQuizAttempt(
  attemptId: string,
  data: Pick<QuizAttempt, 'correctCount' | 'wrongCount' | 'scorePercent' | 'xpEarned' | 'completedAt' | 'durationSeconds'>,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await updateDoc(doc(firestore, COLLECTIONS.quizAttempts, attemptId), data as Record<string, unknown>);
  } catch {
    // Fire-and-forget
  }
}

// ─── Quiz Answers ─────────────────────────────────────────────────────────────

export async function saveQuizAnswer(answer: QuizAnswer): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(doc(firestore, COLLECTIONS.quizAnswers, answer.id), answer);
  } catch {
    // Fire-and-forget
  }
}
