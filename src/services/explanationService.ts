import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { firestore, COLLECTIONS } from './firebaseConfig';
import type { AIExplanation, ExplanationFeedback, GeminiExplanationResponse } from '../types/explanation';
import { isAIAvailable, generateExplanation } from './aiProviderService';
import type { ExplanationGenerationParams } from './promptTemplateService';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

const MATH_SUBJECTS = new Set(['mathematics', 'physics', 'chemistry']);

function validateExplanation(
  response: GeminiExplanationResponse,
  params: ExplanationGenerationParams,
): number {
  let score = 0;

  // 1. simpleExplanation not empty
  if (response.simpleExplanation && response.simpleExplanation.trim().length > 0) score++;

  // 2. correct answer mentioned somewhere
  const combined = `${response.simpleExplanation} ${response.whyCorrect} ${response.finalSummary}`.toLowerCase();
  const correctLower = params.correctAnswer.toLowerCase();
  if (combined.includes(correctLower) || response.whyCorrect.trim().length > 10) score++;

  // 3. No obvious contradiction: whyCorrect doesn't say "wrong"
  const whyCorrectLower = response.whyCorrect.toLowerCase();
  if (!whyCorrectLower.includes('this is wrong') && !whyCorrectLower.includes('incorrect answer')) score++;

  // 4. For math subjects, has LaTeX (lenient: at least tries to explain)
  if (MATH_SUBJECTS.has(params.subjectId)) {
    const hasLatex =
      response.simpleExplanation.includes('\\(') ||
      response.simpleExplanation.includes('\\[') ||
      response.whyCorrect.includes('\\(') ||
      response.whyCorrect.includes('\\[') ||
      (response.stepByStep ?? []).some((s) => s.includes('\\(') || s.includes('\\['));
    // Still award point if explanation is detailed enough even without LaTeX
    if (hasLatex || response.whyCorrect.length > 30) score++;
  } else {
    score++; // Non-math always passes this check
  }

  // 5. No duplicate paragraphs
  const texts = [
    response.simpleExplanation,
    response.whyCorrect,
    response.finalSummary,
  ].filter(Boolean);
  const unique = new Set(texts);
  if (unique.size === texts.length) score++;

  // 6. Reasonable length (50-3000 chars)
  const totalLen =
    response.simpleExplanation.length +
    response.whyCorrect.length +
    response.finalSummary.length;
  if (totalLen >= 50 && totalLen <= 3000) score++;

  // 7. finalSummary present
  if (response.finalSummary && response.finalSummary.trim().length > 0) score++;

  return score;
}

function buildFallbackExplanation(
  params: ExplanationGenerationParams & { userId?: string },
): AIExplanation {
  const now = Date.now();
  return {
    id: `fallback_${params.questionId}_${now}`,
    questionId: params.questionId,
    quizType: params.quizType,
    subjectId: params.subjectId,
    formId: params.formId,
    explanationText: params.fallbackExplanation,
    whyCorrect: params.fallbackExplanation,
    whyWrong: {},
    examTip: 'Review this topic before your NECTA exam.',
    memoryTrick: '',
    stepByStep: [],
    latexBlocks: [],
    finalSummary: params.fallbackExplanation,
    qualityScore: 0,
    aiProvider: 'fallback',
    createdAt: now,
    updatedAt: now,
  };
}

function responseToExplanation(
  response: GeminiExplanationResponse,
  params: ExplanationGenerationParams,
  qualityScore: number,
  id: string,
): AIExplanation {
  const now = Date.now();
  return {
    id,
    questionId: params.questionId,
    quizType: params.quizType,
    subjectId: params.subjectId,
    formId: params.formId,
    explanationText: response.simpleExplanation,
    whyCorrect: response.whyCorrect,
    whyWrong: response.whyWrong ?? {},
    examTip: response.examTip ?? 'Review this topic before your NECTA exam.',
    memoryTrick: response.memoryTrick ?? '',
    stepByStep: response.stepByStep ?? [],
    latexBlocks: response.latexBlocks ?? [],
    finalSummary: response.finalSummary ?? '',
    qualityScore: qualityScore / 7,
    aiProvider: 'gemini',
    createdAt: now,
    updatedAt: now,
  };
}

async function saveExplanation(explanation: AIExplanation): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const docRef = doc(
      collection(firestore, COLLECTIONS.aiExplanations),
      explanation.id,
    );
    await setDoc(docRef, explanation);
  } catch {
    // Fire-and-forget — ignore errors
  }
}

async function fetchFromFirestore(questionId: string): Promise<AIExplanation | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const q = query(
      collection(firestore, COLLECTIONS.aiExplanations),
      where('questionId', '==', questionId),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as AIExplanation;
    }
  } catch {
    // Ignore Firestore errors
  }
  return null;
}

export async function getOrGenerateExplanation(
  params: ExplanationGenerationParams & { userId?: string },
): Promise<AIExplanation> {
  // 1. Check Firestore cache
  const cached = await fetchFromFirestore(params.questionId);
  if (cached) return cached;

  // 2. Check if AI is available
  if (!isAIAvailable()) {
    return buildFallbackExplanation(params);
  }

  // 3. Try generating from Gemini (up to 2 attempts)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await generateExplanation(params);
      const score = validateExplanation(response, params);

      if (score >= 4) {
        const id = `ai_${params.questionId}_${Date.now()}`;
        const explanation = responseToExplanation(response, params, score, id);
        // Save to Firestore (fire-and-forget)
        saveExplanation(explanation).catch(() => {});
        return explanation;
      }
      // Score too low — retry on next iteration
    } catch {
      // Generation failed — retry on next iteration
    }
  }

  // All retries exhausted
  return buildFallbackExplanation(params);
}

export async function saveExplanationFeedback(
  feedback: Omit<ExplanationFeedback, 'id' | 'createdAt'>,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const docData: ExplanationFeedback = {
      ...feedback,
      id: `feedback_${feedback.questionId}_${Date.now()}`,
      createdAt: Date.now(),
    };
    await addDoc(collection(firestore, COLLECTIONS.explanationFeedback), docData);
  } catch {
    // Ignore errors
  }
}
