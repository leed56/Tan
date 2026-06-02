import { LEVEL_THRESHOLDS } from '../types/gamification';

export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXpForLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.max(0, level - 1)] ?? 0;
}

export function getXpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getLevelProgress(xp: number): { current: number; total: number; percent: number } {
  const level = getLevelFromXp(xp);
  const current = xp - getXpForLevel(level);
  const total = getXpForNextLevel(level) - getXpForLevel(level);
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 100;
  return { current, total, percent };
}

export function getLevelLabel(level: number): string {
  if (level <= 5) return ['Beginner', 'Explorer', 'Learner', 'Scholar', 'Advanced'][level - 1] ?? `L${level}`;
  if (level <= 10) return `Expert ${level - 5}`;
  if (level <= 20) return `Master ${level - 10}`;
  return `Legend ${level - 20}`;
}
