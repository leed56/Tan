import type { GeminiExplanationResponse } from '../types/explanation';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const FUNCTIONS_BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL ?? '';

// Thrown when the AI provider returns 429 / resource-exhausted so callers can
// surface a "daily limit reached" message instead of a generic failure.
export class RateLimitError extends Error {
  constructor(message = "You've reached today's explanation limit. Please try again tomorrow.") {
    super(message);
    this.name = 'RateLimitError';
  }
}

// The direct Gemini API key is a secret and must never ship in a production
// bundle. Production always proxies through the Cloud Function; the direct key
// path is only honoured in development for local testing.
function directKeyAllowed(): boolean {
  return __DEV__ && (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').length > 0;
}

export function isGeminiConfigured(): boolean {
  // Cloud Function proxy takes priority; fall back to direct API key in dev only
  return FUNCTIONS_BASE_URL.length > 0 || directKeyAllowed();
}

// ─── Cloud Function proxy call (production path) ──────────────────────────────

export interface ExplanationCallParams {
  questionId: string;
  questionText: string;
  questionType: 'MCQ' | 'FIB' | 'TF' | 'HOQ';
  correctAnswer: string;
  userAnswer: string;
  subject: string;
  topic: string;
  form: string;
  options?: string[];
}

export async function callExplanationFunction(
  params: ExplanationCallParams,
  idToken: string
): Promise<GeminiExplanationResponse> {
  const url = `${FUNCTIONS_BASE_URL}/generateExplanation`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: params }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError();
    throw new Error(`Cloud Function error ${response.status}`);
  }

  const body = await response.json();
  const explanation = body?.result?.explanation ?? body?.explanation ?? {};

  return {
    simpleExplanation: explanation.simpleExplanation ?? '',
    whyCorrect: explanation.whyCorrect ?? '',
    whyWrong: (typeof explanation.whyWrong === 'object' && explanation.whyWrong !== null ? explanation.whyWrong : {}) as Record<string, string>,
    examTip: explanation.examTip ?? '',
    memoryTrick: explanation.memoryTip ?? '',
    stepByStep: [],
    finalSummary: explanation.keyConcept ?? '',
    latexBlocks: [],
  };
}

function stripMarkdownFences(text: string): string {
  // Strip ```json ... ``` or ``` ... ``` wrapping
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  return text.trim();
}

export async function callGemini(prompt: string): Promise<GeminiExplanationResponse> {
  if (!directKeyAllowed()) {
    throw new Error('Direct Gemini calls are disabled outside development; use the Cloud Function proxy.');
  }
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    if (response.status === 429) throw new RateLimitError();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!rawText) {
    throw new Error('Gemini returned empty response');
  }

  let parsed: GeminiExplanationResponse;
  try {
    parsed = JSON.parse(rawText) as GeminiExplanationResponse;
  } catch {
    // Try stripping markdown fences as fallback
    const stripped = stripMarkdownFences(rawText);
    try {
      parsed = JSON.parse(stripped) as GeminiExplanationResponse;
    } catch {
      throw new Error(`Failed to parse Gemini JSON response: ${rawText.slice(0, 200)}`);
    }
  }

  // Ensure all required fields exist with fallback defaults
  return {
    simpleExplanation: parsed.simpleExplanation ?? '',
    whyCorrect: parsed.whyCorrect ?? '',
    whyWrong: parsed.whyWrong ?? {},
    examTip: parsed.examTip ?? '',
    memoryTrick: parsed.memoryTrick ?? '',
    stepByStep: Array.isArray(parsed.stepByStep) ? parsed.stepByStep : [],
    finalSummary: parsed.finalSummary ?? '',
    latexBlocks: Array.isArray(parsed.latexBlocks) ? parsed.latexBlocks : [],
  };
}

// Legacy exports kept for backward compatibility — these are now superseded
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

export async function generateExplanation(
  _prompt: string,
  _config: Partial<GeminiConfig> = {},
): Promise<string> {
  return callGemini(_prompt).then((r) => r.simpleExplanation);
}

export async function generateQuizHint(
  _questionText: string,
  _subjectContext: string,
): Promise<string> {
  throw new Error('generateQuizHint not implemented.');
}
