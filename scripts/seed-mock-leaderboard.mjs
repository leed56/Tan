/**
 * Seeds realistic mock entries into leaderboard_scores for demo/testing.
 * Uses fake userIds (mock_1, mock_2, ...) that never collide with real
 * students, so they're trivially identifiable and safe to delete later.
 *
 * Run:
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> \
 *   node --experimental-strip-types scripts/seed-mock-leaderboard.mjs
 *
 * Remove later with:
 *   node --experimental-strip-types scripts/seed-mock-leaderboard.mjs --clean
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(fileURLToPath(new URL('../functions/noop.js', import.meta.url)));
const admin = require('firebase-admin');

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS first (same as golive.sh requires).');
  process.exit(1);
}
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

// ── same algorithm as src/utils/date.ts, so mock entries land in this
//    week's/month's real buckets and actually show up on those tabs ──
function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function monthKey(d = new Date()) {
  return localDateStr(d).slice(0, 7);
}
function weekKey(d = new Date()) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayNum + 3);
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(
    ((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7,
  );
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const AVATARS = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5', 'avatar_6', 'avatar_7', 'avatar_8'];

function schoolSlug(school) {
  return school.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// 30 realistic Tanzanian student names, forms, and schools, spanning a
// believable XP curve (top ~5200 down to ~120).
const STUDENTS = [
  ['Amara Diallo', 4, 'Azania Secondary'], ['Juma Mwangi', 3, "St. Joseph's School"],
  ['Fatuma Hassan', 4, 'Kibasila Secondary'], ['Baraka Otieno', 2, 'Dar es Salaam Academy'],
  ['Neema Kimaro', 3, 'Mwalimu Nyerere High'], ['Salim Bakari', 1, 'Mikocheni Secondary'],
  ['Zawadi Msafiri', 4, 'Tanga Girls School'], ['Omari Shaban', 2, 'Arusha Secondary'],
  ['Grace Mushi', 3, 'Marian Girls Secondary'], ['Iddi Rashid', 4, 'Feza Boys School'],
  ['Consolata Massawe', 1, 'Mzumbe Secondary'], ['Hamisi Juma', 2, 'Kibaha Secondary'],
  ['Rehema Kilonzo', 3, 'Ilboru Secondary'], ['Emmanuel Lyimo', 4, 'Moshi Secondary'],
  ['Suzana Ngowi', 2, 'Loyola High School'], ['Ally Chum', 1, 'Tambaza Secondary'],
  ['Winnie Malisa', 3, 'Jangwani Girls'], ['Deo Rugambwa', 4, 'Ihungo Secondary'],
  ['Halima Said', 2, 'Zanzibar Secondary'], ['Peter Kessy', 1, 'Weruweru High School'],
  ['Anitha Mbwana', 3, 'Bunju Secondary'], ['Kelvin Massaba', 4, 'Kilakala Secondary'],
  ['Lightness Method', 2, 'Same Secondary'], ['Yusuph Nchimbi', 1, 'Kondoa Secondary'],
  ['Betrida Komba', 3, 'Songea Girls'], ['Frank Mrema', 4, 'Old Moshi Secondary'],
  ['Aisha Bakar', 2, 'Chake Chake Secondary'], ['Godfrey Sanga', 1, 'Korogwe Secondary'],
  ['Mariam Juma', 3, 'Kigoma Secondary'], ['Erick Massawe', 4, 'Njombe Secondary'],
];

const CLEAN = process.argv.includes('--clean');

if (CLEAN) {
  // Firestore has no native "starts with" — the standard prefix-range trick
  // is bounding by the prefix itself up to the highest possible Unicode
  // continuation (), so this only matches ids starting with "mock_".
  const snap = await db.collection('leaderboard_scores')
    .where(admin.firestore.FieldPath.documentId(), '>=', 'mock_')
    .where(admin.firestore.FieldPath.documentId(), '<=', 'mock_')
    .get();
  const batch = db.batch();
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`Removed ${snap.size} mock leaderboard entries.`);
  process.exit(0);
}

const wk = weekKey();
const mk = monthKey();
const batch = db.batch();
let totalXp = 5200;

STUDENTS.forEach(([name, form, school], i) => {
  const id = `mock_${i + 1}`;
  const xp = Math.max(120, totalXp - Math.round(Math.random() * 60));
  totalXp = xp - (150 + Math.round(Math.random() * 120)); // next entry is lower
  const weeklyXp = Math.round(xp * (0.04 + Math.random() * 0.03));
  const monthlyXp = Math.round(weeklyXp * (2.5 + Math.random() * 1.5));
  batch.set(db.collection('leaderboard_scores').doc(id), {
    userId: id,
    name,
    avatarId: AVATARS[i % AVATARS.length],
    form,
    school,
    schoolId: schoolSlug(school),
    totalXp: xp,
    weeklyXp,
    monthlyXp,
    weekKey: wk,
    monthKey: mk,
    updatedAt: Date.now(),
  });
});

await batch.commit();
console.log(`✓ Seeded ${STUDENTS.length} mock leaderboard entries (weekKey=${wk}, monthKey=${mk}).`);
console.log('Remove later with: node --experimental-strip-types scripts/seed-mock-leaderboard.mjs --clean');
process.exit(0);
