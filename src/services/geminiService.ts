import type { GeminiExplanationResponse } from '../types/explanation';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export function isGeminiConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').length > 0;
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
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

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
