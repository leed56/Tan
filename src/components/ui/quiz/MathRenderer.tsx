/**
 * MathRenderer — renders text with inline and block LaTeX markers.
 * Splits on \( … \) for inline math and \[ … \] for display math.
 * Renders LaTeX content in a styled monospace block (no KaTeX — TODO Phase 4).
 * TODO: Phase 4 — replace with react-native-katex or mathjax-react-native for proper rendering.
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface MathRendererProps {
  text: string;
  style?: object;
  displayMode?: boolean;
}

type Segment = { type: 'text' | 'inline' | 'block'; content: string };

// Content authors often wrap ordinary words in LaTeX text commands
// ("\( \text{Mathema} \)") — unwrap them so readers see the word, not markup.
const unwrapTextCommands = (s: string) =>
  s.replace(/\\text(?:bf|it|rm|sf|tt)?\s*\{([^{}]*)\}/g, '$1');

// After unwrapping, content with no math syntax left (just words/punctuation)
// reads as prose — rendering it in the monospace math chip would be noise.
const isProse = (s: string) => /[A-Za-z]/.test(s) && !/[\\^_{}=<>+|~]|\d\s*[*/]/.test(s);

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};
const toSuperscript = (s: string) => s.split('').map((c) => SUPERSCRIPTS[c] ?? c).join('');
const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};
const toSubscript = (s: string) => s.split('').map((c) => SUBSCRIPTS[c] ?? c).join('');

// LaTeX operator commands → the symbol students should see.
const LATEX_SYMBOLS: Array<[RegExp, string]> = [
  [/\\times\b/g, '×'],
  [/\\div\b/g, '÷'],
  [/\\pm\b/g, '±'],
  [/\\cdot\b/g, '·'],
  [/\\(?:rightarrow|to)\b/g, '→'],
  [/\\leq\b/g, '≤'],
  [/\\geq\b/g, '≥'],
  [/\\neq\b/g, '≠'],
  [/\\approx\b/g, '≈'],
  [/\\degree\b|\^\{?\\circ\}?/g, '°'],
  [/\\%/g, '%'],
  [/\\,|\\;|\\!|\\ /g, ' '],
  [/\\left|\\right/g, ''],
];

// Question authors write math in plain ASCII ("sqrt(50)", "2^3") as often as
// in LaTeX ("\sqrt{50}", "\frac{P R T}{100}") — render all of it as real math
// symbols. Simple radicands drop their parentheses; compound ones keep them.
const prettifyMath = (s: string) => {
  let out = s;
  for (const [re, sym] of LATEX_SYMBOLS) out = out.replace(re, sym);
  out = out
    // \frac{a}{b} → a/b, wrapping compound numerators/denominators in parens
    .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, num, den) => {
      const wrap = (x: string) => (/^[A-Za-z0-9.°%]+$/.test(x.trim()) ? x.trim() : `(${x.trim()})`);
      return `${wrap(num)}/${wrap(den)}`;
    })
    .replace(/\\sqrt\s*\{([^{}]*)\}|\bsqrt\s*\(([^()]*)\)/g, (_, a, b) => {
      const x = (a ?? b).trim();
      return '√' + (/^[A-Za-z0-9.]+$/.test(x) ? x : `(${x})`);
    })
    // exponents: x^2, x^{12} → superscripts
    .replace(/\^\{(-?\d+)\}/g, (_, exp) => toSuperscript(exp))
    .replace(/\^(-?\d+)\b/g, (_, exp) => toSuperscript(exp))
    // subscripts: x_1, H_{2}O → x₁, H₂O
    .replace(/_\{(\d+)\}/g, (_, sub) => toSubscript(sub))
    .replace(/([A-Za-z])_(\d+)/g, (_, ch, sub) => ch + toSubscript(sub));
  return out;
};

/** Strip \( \) / \[ \] delimiters and \text{...} wrappers for contexts that
 *  need a plain string (e.g. "Correct answer: …" labels). */
export function stripMathMarkup(raw: string): string {
  return prettifyMath(unwrapTextCommands(raw.replace(/\\[[\]()]/g, '')))
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  // Match \[ … \] first (block), then \( … \) (inline)
  const pattern = /\\\[(.+?)\\\]|\\\((.+?)\\\)/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushText = (content: string) => segments.push({ type: 'text', content: prettifyMath(content) });
  const pushMath = (type: 'block' | 'inline', rawContent: string) => {
    const content = prettifyMath(unwrapTextCommands(rawContent).trim());
    segments.push(isProse(content) ? { type: 'text', content } : { type, content });
  };

  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      pushText(raw.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      pushMath('block', match[1]);
    } else if (match[2] !== undefined) {
      pushMath('inline', match[2]);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < raw.length) {
    pushText(raw.slice(lastIndex));
  }
  return segments.length > 0 ? segments : [{ type: 'text', content: prettifyMath(raw) }];
}

export function MathRenderer({ text, style, displayMode = false }: MathRendererProps) {
  const segments = parseSegments(text);
  const hasBlock = segments.some((s) => s.type === 'block');

  if (hasBlock) {
    // Block math → each segment on its own line
    return (
      <View style={styles.blockContainer}>
        {segments.map((seg, i) => {
          if (seg.type === 'block') {
            return (
              <View key={i} style={styles.mathBlock}>
                <Text style={styles.mathBlockText}>{seg.content}</Text>
              </View>
            );
          }
          if (seg.type === 'inline') {
            return (
              <Text key={i} style={[styles.inlineMath, style]}>{seg.content}</Text>
            );
          }
          return <Text key={i} style={[styles.plainText, style]}>{seg.content}</Text>;
        })}
      </View>
    );
  }

  // Inline-only → render as a single <Text> with mixed styles
  return (
    <Text style={[styles.plainText, style]}>
      {segments.map((seg, i) => {
        if (seg.type === 'inline') {
          return (
            <Text key={i} style={styles.inlineMath}> {seg.content} </Text>
          );
        }
        return <Text key={i}>{seg.content}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  blockContainer: { gap: SPACING.sm },
  plainText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    lineHeight: TYPOGRAPHY.sizes.lg * 1.55,
  },
  inlineMath: {
    fontFamily: 'monospace',
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    backgroundColor: 'rgba(123,111,242,0.12)',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  mathBlock: {
    backgroundColor: 'rgba(123,111,242,0.1)',
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignSelf: 'stretch',
  },
  mathBlockText: {
    fontFamily: 'monospace',
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
  },
});
