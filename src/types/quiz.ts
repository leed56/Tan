export type QuizType = 'mcq' | 'fib' | 'tf';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  formId: string;
  subjectId: string;
  topicId: string;
  learningPackId: string;
  type: QuizType;
  questionText: string;
  options: QuestionOption[];  // MCQ only; empty array for FIB/TF
  correctAnswer: string;      // MCQ: correct option id | FIB: expected text | TF: 'true'|'false'
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  order: number;
  isActive: boolean;
  isPremium: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  formId: string;
  subjectId: string;
  topicId: string;
  learningPackId: string;
  quizType: QuizType;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  xpEarned: number;
  startedAt: number;
  completedAt: number | null;
  durationSeconds: number;
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  userId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
  createdAt: number;
}

export interface DailyUsage {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mcqUsed: number;
  fibUsed: number;
  tfUsed: number;
  summaryUsed: number;
  hoqUsed: number;
}

export const FREE_DAILY_LIMITS: Record<QuizType, number> = {
  mcq: 5,
  fib: 3,
  tf: 2,
};

export interface QuizSessionResult {
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  xpEarned: number;
  totalQuestions: number;
  durationSeconds: number;
}
