/**
 * Quiz Service — Phase 3
 * Firestore-first with local seed data fallback.
 * TODO: Phase 4 — add real-time listeners for live question bank updates
 */

import { firestore, isFirebaseConfigured, waitForAuthReady } from './firebaseConfig';
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
    await waitForAuthReady();
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.questions),
        where('learningPackId', '==', learningPackId),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    );
    if (snap.empty) {
      console.warn(
        `[quizService] getQuestionsByLearningPack: Firestore query for learningPackId="${learningPackId}" succeeded but matched 0 real docs — falling back to local seed data.`,
      );
      return getSeedQuestionsByPack(learningPackId);
    }
    return snap.docs.map((d) => {
      // DB docs store type UPPERCASE ('MCQ' — enforced by rules); the app's
      // QuizType union and every comparison downstream (prompt building, TF
      // answer rendering, attempt records) are lowercase. Normalize here so
      // no consumer has to care.
      const data = d.data() as Question;
      return { ...data, type: String(data.type).toLowerCase() as Question['type'] };
    });
  } catch (e) {
    console.warn(
      `[quizService] getQuestionsByLearningPack: Firestore query for learningPackId="${learningPackId}" threw — falling back to local seed data. Error:`,
      e,
    );
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
