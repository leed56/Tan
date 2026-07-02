/**
 * Content repair script — fixes the defects found by scripts/audit/census.mjs
 * that seeding alone can't fix (they live in the legacy Form 1 Mathematics
 * batch, which has no source files under scripts/content/):
 *
 *   1. Creates the 20 missing learning_packs referenced by ~190 existing
 *      Form 1 Math questions (topics 5-9) so that content becomes reachable.
 *   2. Deactivates MCQ/HOQ questions with fewer than 3 options (unanswerable
 *      in the app — 27 legacy HOQ items).
 *   3. Recomputes questionCount on every pack from the actual number of
 *      active questions, fixing the ~320 stale counts.
 *
 * Admin SDK (bypasses rules), idempotent. Run AFTER seed-content.mjs:
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> node scripts/audit/fix-content.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
// firebase-admin lives in functions/node_modules (run `npm install` there
// first); resolve it relative to this script so it runs from any OS.
const require = createRequire(fileURLToPath(new URL('../../functions/noop.js', import.meta.url)));
const admin = require('firebase-admin');

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';
admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  projectId: PROJECT,
});
const db = admin.firestore();
const NOW = Date.now();

// Same pack grammar as seed-content.mjs
const PACK_CFG = {
  1: { type: 'mcq', suffix: 'MCQ Quiz', xp: 15, premium: false, est: 12, desc: 'Test your knowledge with multiple choice questions.' },
  2: { type: 'tf', suffix: 'True or False', xp: 10, premium: false, est: 8, desc: 'Quickly verify key facts and correct misconceptions.' },
  3: { type: 'fib', suffix: 'Fill in the Blanks', xp: 10, premium: false, est: 10, desc: 'Complete sentences using the correct terms.' },
  4: { type: 'summary', suffix: 'Summary', xp: 10, premium: true, est: 5, desc: 'A concise overview of all key concepts.' },
  5: { type: 'hoq', suffix: 'Higher Order Questions', xp: 30, premium: true, est: 30, desc: 'NECTA-style questions requiring deep analysis.' },
};

console.log(`repairing content in ${PROJECT}…`);

// Load everything once.
const [packsSnap, questionsSnap, topicsSnap] = await Promise.all([
  db.collection('learning_packs').get(),
  db.collection('questions').get(),
  db.collection('topics').get(),
]);
const packs = new Map(packsSnap.docs.map((d) => [d.id, d.data()]));
const topics = new Map(topicsSnap.docs.map((d) => [d.id, d.data()]));

// ── 2. deactivate unanswerable MCQ/HOQ (do this first so counts exclude them) ──
let deactivated = 0;
{
  const batch = db.batch();
  for (const d of questionsSnap.docs) {
    const q = d.data();
    const type = String(q.type ?? '').toUpperCase();
    if ((type === 'MCQ' || type === 'HOQ') && (q.options?.length ?? 0) < 3 && q.isActive !== false) {
      batch.update(d.ref, { isActive: false, updatedAt: NOW });
      deactivated++;
    }
  }
  if (deactivated) await batch.commit();
}
console.log(`✓ deactivated ${deactivated} unanswerable MCQ/HOQ question(s)`);

// ── count ACTIVE questions per referenced pack ─────────────────────────────────
const activePerPack = new Map();
const anyPerPack = new Map();
for (const d of questionsSnap.docs) {
  const q = d.data();
  const pid = q.learningPackId ?? q.packId;
  if (!pid) continue;
  anyPerPack.set(pid, (anyPerPack.get(pid) ?? 0) + 1);
  const type = String(q.type ?? '').toUpperCase();
  const nowInactive = (type === 'MCQ' || type === 'HOQ') && (q.options?.length ?? 0) < 3;
  if (q.isActive !== false && !nowInactive) {
    activePerPack.set(pid, (activePerPack.get(pid) ?? 0) + 1);
  }
}

// ── 1. create missing packs that questions reference ───────────────────────────
let created = 0;
{
  const batch = db.batch();
  for (const [pid, count] of anyPerPack) {
    if (packs.has(pid)) continue;
    const m = pid.match(/^((form_(\d+))_(.+)_topic_\d+)_pack_(\d+)$/);
    if (!m) { console.warn(`  ! cannot parse orphan packId ${pid} — skipped`); continue; }
    const [, topicId, formId, , bareSubject, packNo] = m;
    const cfg = PACK_CFG[Number(packNo)];
    if (!cfg) { console.warn(`  ! unknown pack number in ${pid} — skipped`); continue; }
    const topicName = topics.get(topicId)?.name ?? topicId;
    batch.set(db.collection('learning_packs').doc(pid), {
      id: pid, formId, subjectId: `${formId}_${bareSubject}`, topicId,
      title: `${topicName} — ${cfg.suffix}`, description: cfg.desc,
      type: cfg.type, order: Number(packNo), estimatedMinutes: cfg.est,
      difficulty: 'medium', questionCount: activePerPack.get(pid) ?? 0,
      isPremium: cfg.premium, isActive: true,
      completionXP: cfg.xp, xpReward: cfg.xp, createdAt: NOW, updatedAt: NOW,
    }, { merge: true });
    created++;
    console.log(`  + pack ${pid} (${count} questions)`);
  }
  if (created) await batch.commit();
}
console.log(`✓ created ${created} missing pack(s)`);

// ── 3. recompute questionCount everywhere ──────────────────────────────────────
let fixedCounts = 0;
{
  let batch = db.batch();
  let inBatch = 0;
  for (const d of packsSnap.docs) {
    const p = d.data();
    if (String(p.type).toLowerCase() === 'summary') continue; // summaries carry no questions
    const actual = activePerPack.get(d.id) ?? 0;
    if ((p.questionCount ?? 0) !== actual) {
      batch.update(d.ref, { questionCount: actual, updatedAt: NOW });
      fixedCounts++;
      if (++inBatch >= 400) { await batch.commit(); batch = db.batch(); inBatch = 0; }
    }
  }
  if (inBatch) await batch.commit();
}
console.log(`✓ corrected questionCount on ${fixedCounts} pack(s)`);
console.log('done. Re-run scripts/audit/census.mjs to verify.');
process.exit(0);
