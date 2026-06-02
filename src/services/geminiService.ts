// TODO: Phase 2 — integrate Google Gemini API (gemini-1.5-flash for speed)
// TODO: Phase 2 — store API key securely, NOT in client bundle (use Cloud Function)
// TODO: Phase 2 — rate limiting + quota management per user tier
// TODO: Phase 3 — fine-tune prompts for Tanzania O-Level curriculum context

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiConfig {
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
}

const DEFAULT_CONFIG: GeminiConfig = {
  temperature: 0.4,
  maxOutputTokens: 512,
  topP: 0.8,
  topK: 40,
};

export async function generateExplanation(
  _prompt: string,
  _config: Partial<GeminiConfig> = {},
): Promise<string> {
  // TODO: Phase 2 — call Gemini API via Cloud Function proxy
  void DEFAULT_CONFIG;
  throw new Error('Gemini service not implemented yet. Coming in Phase 2.');
}

export async function generateQuizHint(
  _questionText: string,
  _subjectContext: string,
): Promise<string> {
  // TODO: Phase 2 — generate contextual hint without revealing answer
  throw new Error('Gemini service not implemented yet. Coming in Phase 2.');
}
