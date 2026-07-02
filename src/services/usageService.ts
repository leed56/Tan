/**
 * Usage Service — Phase 3
 * Tracks daily free-tier question usage per user.
 * TODO: Phase 4 — integrate with subscription status for premium bypass
 */

import { firestore, isFirebaseConfigured } from './firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  increment,
} from 'firebase/firestore';
import { COLLECTIONS } from './firebaseConfig';
import type { DailyUsage, QuizType, FREE_DAILY_LIMITS } from '../types/quiz';
import { FREE_DAILY_LIMITS as LIMITS } from '../types/quiz';
import { localDateStr } from '../utils/date';

// Local (EAT) calendar day, matching the rest of the app's streak/mission
// bucketing — using UTC here would reset free-tier limits up to 3 hours
// early or late relative to the student's actual midnight.
function todayDate(): string {
  return localDateStr();
}

function makeUsageId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

function emptyUsage(userId: string): DailyUsage {
  const date = todayDate();
  return {
    id: makeUsageId(userId, date),
    userId,
    date,
    mcqUsed: 0,
    fibUsed: 0,
    tfUsed: 0,
    summaryUsed: 0,
    hoqUsed: 0,
  };
}

// ─── Get today's usage ────────────────────────────────────────────────────────

export async function getTodayUsage(userId: string): Promise<DailyUsage> {
  if (!isFirebaseConfigured()) return emptyUsage(userId);
  const id = makeUsageId(userId, todayDate());
  try {
    const snap = await getDoc(doc(firestore, COLLECTIONS.dailyUsage, id));
    if (!snap.exists()) return emptyUsage(userId);
    return snap.data() as DailyUsage;
  } catch {
    return emptyUsage(userId);
  }
}

// ─── Increment usage ──────────────────────────────────────────────────────────

export async function incrementUsage(userId: string, type: QuizType): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const date = todayDate();
  const id = makeUsageId(userId, date);
  const field = `${type}Used` as 'mcqUsed' | 'fibUsed' | 'tfUsed';
  try {
    // Single merge-write, no get-then-set: reading a NONEXISTENT doc is
    // rules-denied (the read rule dereferences resource.data), so the old
    // getDoc threw before the create ever ran — usage was never persisted
    // and free-tier daily limits reset on every app restart. Only identity
    // fields plus the ONE incremented counter are written — spreading a full
    // zeroed template into a merge would reset the other counters. Readers
    // already coalesce missing counter fields to 0.
    const ref = doc(firestore, COLLECTIONS.dailyUsage, id);
    await setDoc(ref, { id, userId, date, [field]: increment(1) }, { merge: true });
  } catch {
    // Fire-and-forget
  }
}

// ─── Check limit ──────────────────────────────────────────────────────────────

export function checkDailyLimit(usage: DailyUsage, type: QuizType): boolean {
  const used = (usage[`${type}Used` as keyof DailyUsage] as number | undefined) ?? 0;
  return used < (LIMITS[type] ?? 0);
}
