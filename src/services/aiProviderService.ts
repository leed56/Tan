import type { GeminiExplanationResponse } from '../types/explanation';
import { isGeminiConfigured, callGemini } from './geminiService';
import { buildExplanationPrompt } from './promptTemplateService';

export type { ExplanationGenerationParams } from './promptTemplateService';
export { OPTION_LABELS } from './promptTemplateService';

export function isAIAvailable(): boolean {
  return isGeminiConfigured();
}

export async function generateExplanation(
  params: import('./promptTemplateService').ExplanationGenerationParams,
): Promise<GeminiExplanationResponse> {
  const prompt = buildExplanationPrompt(params);
  return callGemini(prompt);
}
