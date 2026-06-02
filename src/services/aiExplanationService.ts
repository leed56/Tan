// TODO: Phase 2 — connect to Gemini API for AI-powered explanations
// TODO: Phase 2 — cache explanations in Firestore to minimize API calls
// TODO: Phase 2 — support Swahili + English explanations
// TODO: Phase 2 — streaming responses for real-time display
// TODO: Phase 3 — personalized AI tutor with conversation history

export interface ExplanationRequest {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  studentAnswer: string;
  subjectId: string;
  language: 'en' | 'sw';
}

export interface ExplanationResponse {
  explanation: string;
  tip: string | null;
  relatedTopics: string[];
}

export async function getAIExplanation(
  _request: ExplanationRequest,
): Promise<ExplanationResponse> {
  // TODO: Phase 2 — call geminiService.generateExplanation()
  throw new Error('AI explanations not implemented yet. Coming in Phase 2.');
}

export async function getTopicSummary(
  _topicId: string,
  _language: 'en' | 'sw',
): Promise<string> {
  // TODO: Phase 2 — generate concise topic summary using Gemini
  throw new Error('AI topic summaries not implemented yet. Coming in Phase 2.');
}
