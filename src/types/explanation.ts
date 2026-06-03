export type ExplanationFeedbackRating = 'helpful' | 'confusing' | 'wrong';
export type AIProvider = 'gemini' | 'fallback';

export interface AIExplanation {
  id: string;
  questionId: string;
  quizType: 'mcq' | 'fib' | 'tf';
  subjectId: string;
  formId: string;
  explanationText: string;   // simpleExplanation from Gemini
  whyCorrect: string;
  whyWrong: Record<string, string>;  // key = option label (A/B/C/D) or option id
  examTip: string;
  memoryTrick: string;
  stepByStep: string[];
  latexBlocks: string[];
  finalSummary: string;
  qualityScore: number;      // 0-1
  aiProvider: AIProvider;
  createdAt: number;
  updatedAt: number;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  subject: string;
  quizType: string;
  templateText: string;
  isActive: boolean;
  version: number;
}

export interface AIQualityLog {
  id: string;
  explanationId: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface ExplanationFeedback {
  id: string;
  userId: string;
  questionId: string;
  explanationId: string;
  rating: ExplanationFeedbackRating;
  comment: string;
  createdAt: number;
}

export interface GeminiExplanationResponse {
  simpleExplanation: string;
  whyCorrect: string;
  whyWrong: Record<string, string>;
  examTip: string;
  memoryTrick: string;
  stepByStep: string[];
  finalSummary: string;
  latexBlocks: string[];
}
