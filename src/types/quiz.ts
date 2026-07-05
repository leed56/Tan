export type QuizType = 'mcq' | 'fib' | 'tf' | 'hoq';

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
  options: QuestionOption[];  // MCQ/FIB: 4 options; empty array for TF
  correctAnswer: string;      // MCQ/FIB: correct option id | TF: 'true'|'false'
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

export interface QuizSessionResult {
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  xpEarned: number;
  totalQuestions: number;
  durationSeconds: number;
}
