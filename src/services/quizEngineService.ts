// TODO: Phase 2 — full quiz engine with MCQ, FIB, TF, HOQ question types
// TODO: Phase 2 — fetch questions from Firestore by packId + questionType
// TODO: Phase 2 — scoring engine with partial credit for FIB
// TODO: Phase 2 — timer per question with auto-advance
// TODO: Phase 2 — answer validation + explanation fetching via AI

export type QuestionType = 'mcq' | 'fib' | 'tf' | 'hoq';

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  packId: string;
  type: QuestionType;
  text: string;
  imageUrl: string | null;
  options: MCQOption[] | null;
  correctAnswer: string | null;
  explanation: string | null;
  difficultyLevel: 1 | 2 | 3;
  xpReward: number;
}

export interface QuizSession {
  sessionId: string;
  packId: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  startedAt: number;
  finishedAt: number | null;
  xpEarned: number;
  correctCount: number;
}

export async function startQuizSession(_packId: string): Promise<QuizSession> {
  // TODO: Phase 2 — fetch questions from Firestore
  throw new Error('Quiz engine not implemented yet. Coming in Phase 2.');
}

export async function submitAnswer(
  _sessionId: string,
  _questionId: string,
  _answer: string,
): Promise<{ isCorrect: boolean; explanation: string | null; xpEarned: number }> {
  // TODO: Phase 2 — validate answer, return explanation from AI
  throw new Error('Quiz engine not implemented yet. Coming in Phase 2.');
}

export async function finishQuizSession(
  _sessionId: string,
): Promise<{ xpEarned: number; correctCount: number; totalCount: number }> {
  // TODO: Phase 2 — persist session results to Firestore, award XP
  throw new Error('Quiz engine not implemented yet. Coming in Phase 2.');
}
