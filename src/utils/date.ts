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
