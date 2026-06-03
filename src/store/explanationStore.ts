import { create } from 'zustand';
import type { AIExplanation, ExplanationFeedbackRating } from '../types/explanation';
import { getOrGenerateExplanation } from '../services/explanationService';
import type { ExplanationGenerationParams } from '../services/promptTemplateService';

interface ExplanationStore {
  explanationsByQuestionId: Record<string, AIExplanation>;
  loadingIds: Record<string, boolean>;
  errors: Record<string, string>;
  feedbackByQuestionId: Record<string, ExplanationFeedbackRating>;

  fetchExplanation: (params: ExplanationGenerationParams & { userId?: string }) => Promise<void>;
  getExplanation: (questionId: string) => AIExplanation | null;
  isLoading: (questionId: string) => boolean;
  setFeedback: (questionId: string, rating: ExplanationFeedbackRating) => void;
}

export const useExplanationStore = create<ExplanationStore>((set, get) => ({
  explanationsByQuestionId: {},
  loadingIds: {},
  errors: {},
  feedbackByQuestionId: {},

  fetchExplanation: async (params) => {
    const { questionId } = params;
    // Skip if already fetched
    if (get().explanationsByQuestionId[questionId]) return;
    // Skip if already loading
    if (get().loadingIds[questionId]) return;

    set((s) => ({ loadingIds: { ...s.loadingIds, [questionId]: true } }));

    try {
      const explanation = await getOrGenerateExplanation(params);
      set((s) => ({
        explanationsByQuestionId: { ...s.explanationsByQuestionId, [questionId]: explanation },
        loadingIds: { ...s.loadingIds, [questionId]: false },
        errors: { ...s.errors, [questionId]: '' },
      }));
    } catch (e) {
      set((s) => ({
        loadingIds: { ...s.loadingIds, [questionId]: false },
        errors: { ...s.errors, [questionId]: String(e) },
      }));
    }
  },

  getExplanation: (questionId) => get().explanationsByQuestionId[questionId] ?? null,

  isLoading: (questionId) => get().loadingIds[questionId] ?? false,

  setFeedback: (questionId, rating) =>
    set((s) => ({ feedbackByQuestionId: { ...s.feedbackByQuestionId, [questionId]: rating } })),
}));
