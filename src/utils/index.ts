import type { FormLevel } from '../types';
import { getLevelProgress as _getLevelProgress } from './xpUtils';
// Phase 5 — re-export new level functions
export { getLevelFromXp, getLevelProgress } from './xpUtils';

export function getXpProgressInLevel(xp: number): number {
  return _getLevelProgress(xp).current;
}

export function getXpProgressPercent(xp: number): number {
  return _getLevelProgress(xp).percent;
}

export function formatXp(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export function getFormLabel(form: FormLevel): string {
  return `Form ${form}`;
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('255') && digits.length === 12) {
    return `+255 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

export function validateTanzaniaPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Tanzania mobile: +255 7xx or +255 6xx (10 digits after country code)
  return /^255[67]\d{8}$/.test(digits);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getRandomMotivation(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s}s`;
}
