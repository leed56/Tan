import { normalizeContentText } from '../components/ui/quiz/MathRenderer';

export interface ParsedExplanation {
  /** Main explanation prose (markup normalized, inline section headers removed). */
  body: string;
  /** Exam tip / caution pulled out of the body, if the author embedded one. */
  tip: string | null;
}

// Authored explanations frequently embed a single inline sub-heading in bold —
// English "Exam Tip:" / "Caution:" or Kiswahili "Kidokezo cha Mtihani:" /
// "Tahadhari katika Mtihani:" — followed by a sentence or two of advice. We
// split that trailing tip into its own block so the main explanation reads
// clean and the tip gets a labelled card, instead of one run-on paragraph.
const TIP_MARKER =
  /\**\s*(?:Kidokezo\s+cha\s+Mtihani|Tahadhari(?:\s+katika\s+Mtihani)?|Exam\s+Tip|Caution|Note|Kumbuka)\s*:?\**\s*/i;

export function parseExplanation(raw: string): ParsedExplanation {
  const text = normalizeContentText(raw ?? '').trim();
  if (!text) return { body: '', tip: null };

  const m = text.match(TIP_MARKER);
  if (m && m.index !== undefined && m.index > 0) {
    const body = text.slice(0, m.index).trim();
    const tip = text.slice(m.index + m[0].length).trim();
    // Only split when both halves have real content — otherwise keep it whole.
    if (body.length > 20 && tip.length > 5) {
      return { body: stripLeadingEmoji(body), tip: stripLeadingEmoji(tip) };
    }
  }
  return { body: stripLeadingEmoji(text), tip: null };
}

// Leading decorative emoji ("📝 ", "💡 ") add noise to a titled card.
const stripLeadingEmoji = (s: string) =>
  s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}️\s]+/u, '').trim();
