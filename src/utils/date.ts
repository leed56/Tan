/**
 * Local calendar date as YYYY-MM-DD.
 *
 * Uses the device's local timezone (EAT/UTC+3 for Tanzania) rather than UTC, so
 * streaks and daily missions roll over at local midnight — `toISOString()` would
 * bucket study sessions between 00:00–03:00 EAT into the previous UTC day and
 * break streak continuity.
 */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local month bucket, e.g. "2026-06" — for monthly leaderboard reset. */
export function monthKey(d: Date = new Date()): string {
  return localDateStr(d).slice(0, 7);
}

/** Local ISO-ish week bucket, e.g. "2026-W26" — for weekly leaderboard reset. */
export function weekKey(d: Date = new Date()): string {
  // Thursday-based ISO week number computed from the local date.
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = (date.getDay() + 6) % 7; // Mon=0..Sun=6
  date.setDate(date.getDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    );
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
