/**
 * Usage Service — Phase 3
 * Tracks daily free-tier question usage per user.
 * TODO: Phase 4 — integrate with subscription status for premium bypass
 */

import { firestore } from './firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { COLLECTIONS } from './firebaseConfig';
import type { DailyUsage, QuizType, FREE_DAILY_LIMITS } from '../types/quiz';
import { FREE_DAILY_LIMITS as LIMITS } from '../types/quiz';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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
    const ref = doc(firestore, COLLECTIONS.dailyUsage, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { [field]: increment(1) });
    } else {
      const usage = emptyUsage(userId);
      usage[field] = 1;
      await setDoc(ref, usage);
    }
  } catch {
    // Fire-and-forget
  }
}

// ─── Check limit ──────────────────────────────────────────────────────────────

export function checkDailyLimit(usage: DailyUsage, type: QuizType): boolean {
  const used = (usage[`${type}Used` as keyof DailyUsage] as number | undefined) ?? 0;
  return used < (LIMITS[type] ?? 0);
}
