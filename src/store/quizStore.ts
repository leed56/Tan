import { create } from 'zustand';
import type { Question, QuizSessionResult } from '../types/quiz';
import {
  getQuestionsByLearningPack,
  startQuizAttempt,
  completeQuizAttempt,
  saveQuizAnswer,
} from '../services/quizService';

interface AnswerRecord {
  answer: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
}

interface QuizSession {
  attemptId: string;
  packId: string;
  userId: string;
  formId: string;
  subjectId: string;
  topicId: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, AnswerRecord>;
  startedAt: number;
}

interface QuizStore {
  currentSession: QuizSession | null;
  loadingQuestions: boolean;
  error: string | null;

  // Actions
  initSession: (
    packId: string,
    formId: string,
    subjectId: string,
    topicId: string,
    userId: string,
  ) => Promise<void>;
  submitAnswer: (questionId: string, answer: string, isCorrect: boolean, timeTakenSeconds: number) => void;
  advance: () => void;
  resetSession: () => void;

  // Selectors
  currentQuestion: () => Question | null;
  isLastQuestion: () => boolean;
  sessionResults: () => QuizSessionResult;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentSession: null,
  loadingQuestions: false,
  error: null,

  initSession: async (packId, formId, subjectId, topicId, userId) => {
    set({ loadingQuestions: true, error: null, currentSession: null });
    try {
      const questions = await getQuestionsByLearningPack(packId, formId, subjectId, topicId);
      const attemptId = `attempt_${Date.now()}_${packId}`;
      const session: QuizSession = {
        attemptId,
        packId,
        userId,
        formId,
        subjectId,
        topicId,
        questions,
        currentIndex: 0,
        answers: {},
        startedAt: Date.now(),
      };
      set({ currentSession: session, loadingQuestions: false });

      // Persist attempt start to Firestore (fire-and-forget)
      const q0 = questions[0];
      startQuizAttempt({
        id: attemptId,
        userId,
        formId,
        subjectId,
        topicId,
        learningPackId: packId,
        quizType: q0?.type ?? 'mcq',
        totalQuestions: questions.length,
        startedAt: session.startedAt,
      }).catch(() => {});
    } catch (e) {
      set({ loadingQuestions: false, error: String(e) });
    }
  },

  submitAnswer: (questionId, answer, isCorrect, timeTakenSeconds) => {
    const session = get().currentSession;
    if (!session) return;

    const record: AnswerRecord = { answer, isCorrect, timeTakenSeconds };
    set({
      currentSession: {
        ...session,
        answers: { ...session.answers, [questionId]: record },
      },
    });

    // Persist answer to Firestore (fire-and-forget)
    const question = session.questions.find((q) => q.id === questionId);
    saveQuizAnswer({
      id: `${session.attemptId}_${questionId}`,
      attemptId: session.attemptId,
      userId: session.userId,
      questionId,
      selectedAnswer: answer,
      isCorrect,
      timeTakenSeconds,
      createdAt: Date.now(),
    }).catch(() => {});

    // TODO: Phase 5 — award XP via gamificationStore on correct answer
  },

  advance: () => {
    const session = get().currentSession;
    if (!session) return;
    set({
      currentSession: {
        ...session,
        currentIndex: session.currentIndex + 1,
      },
    });
  },

  resetSession: () => set({ currentSession: null, error: null }),

  currentQuestion: () => {
    const s = get().currentSession;
    if (!s) return null;
    return s.questions[s.currentIndex] ?? null;
  },

  isLastQuestion: () => {
    const s = get().currentSession;
    if (!s) return false;
    return s.currentIndex >= s.questions.length - 1;
  },

  sessionResults: () => {
    const s = get().currentSession;
    if (!s) return { correctCount: 0, wrongCount: 0, scorePercent: 0, xpEarned: 0, totalQuestions: 0, durationSeconds: 0 };

    const answers = Object.entries(s.answers);
    const correct = answers.filter(([, r]) => r.isCorrect).length;
    const total = s.questions.length;
    const wrong = answers.length - correct;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const xp = s.questions
      .filter((q) => s.answers[q.id]?.isCorrect)
      .reduce((sum, q) => sum + q.xpReward, 0);
    const duration = Math.round((Date.now() - s.startedAt) / 1000);

    // Persist completion to Firestore (fire-and-forget)
    if (s.attemptId) {
      completeQuizAttempt(s.attemptId, {
        correctCount: correct,
        wrongCount: wrong,
        scorePercent: score,
        xpEarned: xp,
        completedAt: Date.now(),
        durationSeconds: duration,
      }).catch(() => {});
    }

    return { correctCount: correct, wrongCount: wrong, scorePercent: score, xpEarned: xp, totalQuestions: total, durationSeconds: duration };
  },
}));
