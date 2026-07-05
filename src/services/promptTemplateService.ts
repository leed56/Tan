export const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export interface ExplanationGenerationParams {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  options: Array<{ id: string; text: string }>;
  quizType: 'mcq' | 'fib' | 'tf' | 'hoq';
  subjectId: string;
  subjectName: string;
  formId: string;
  fallbackExplanation: string;
}

export function buildExplanationPrompt(params: ExplanationGenerationParams): string {
  const { questionText, correctAnswer, options, quizType, subjectName, formId } = params;

  const formNumber = formId.replace(/\D/g, '') || formId;

  let optionsText = '';
  let whyWrongTemplate = '';

  if (quizType === 'mcq' && options.length > 0) {
    const optionLines = options.map((opt, i) => {
      const label = OPTION_LABELS[i] ?? String(i + 1);
      return `${label}. ${opt.text}`;
    });
    optionsText = `Options:\n${optionLines.join('\n')}`;

    const whyWrongEntries = options.map((opt, i) => {
      const label = OPTION_LABELS[i] ?? String(i + 1);
      return `"${label}": "why ${label} is wrong"`;
    });
    whyWrongTemplate = `{${whyWrongEntries.join(', ')}}`;
  } else if (quizType === 'tf') {
    optionsText = 'Options:\nA. True\nB. False';
    whyWrongTemplate = `{"alternative": "why the incorrect option is wrong"}`;
  } else {
    // FIB
    optionsText = '';
    whyWrongTemplate = `{"alternative": "why a common wrong answer would be incorrect"}`;
  }

  const optionsSectionText = optionsText ? `${optionsText}\n` : '';

  return `You are an expert Tanzania O-Level teacher. Student is in Form ${formNumber}.
Subject: ${subjectName}. Quiz type: ${quizType}.
Question: ${questionText}
${optionsSectionText}Correct Answer: ${correctAnswer}

Return ONLY valid JSON — no markdown, no backticks, no preamble:
{
  "simpleExplanation": "1-2 sentences, plain English, what this concept means",
  "whyCorrect": "why the correct answer is right",
  "whyWrong": ${whyWrongTemplate},
  "examTip": "NECTA exam tip for this topic",
  "memoryTrick": "memory trick or mnemonic",
  "stepByStep": ["step 1", "step 2", "step 3"],
  "finalSummary": "one sentence summary",
  "latexBlocks": []
}
Use simple English. For Math/Physics/Chemistry use proper LaTeX: \\\\( ... \\\\) inline, \\\\[ ... \\\\] display. No hallucination.`;
}
