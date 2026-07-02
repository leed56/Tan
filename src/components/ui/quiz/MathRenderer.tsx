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

/** Strip \( \) / \[ \] delimiters and \text{...} wrappers for contexts that
 *  need a plain string (e.g. "Correct answer: …" labels). */
export function stripMathMarkup(raw: string): string {
  return unwrapTextCommands(raw.replace(/\\[[\]()]/g, ''))
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

  const pushMath = (type: 'block' | 'inline', rawContent: string) => {
    const content = unwrapTextCommands(rawContent).trim();
    segments.push(isProse(content) ? { type: 'text', content } : { type, content });
  };

  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: raw.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      pushMath('block', match[1]);
    } else if (match[2] !== undefined) {
      pushMath('inline', match[2]);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < raw.length) {
    segments.push({ type: 'text', content: raw.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', content: raw }];
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
