/**
 * Remove the legacy Form 1 Mathematics question batch.
 *
 * Form 1 Math originally shipped as a hand-seeded batch with ids like
 * `f1_math_ch1_mcq_1` — Kiswahili explanations, raw LaTeX, 27 optionless HOQ,
 * and duplicate coverage that broke pack counts. Fresh English content files
 * (scripts/content/mathematics_f1_topic_*.json) now seed proper
 * `form_1_mathematics_topic_N_*` questions in the SAME packs. This script
 * deletes the leftover legacy `f1_math_*` questions so each pack is left with
 * only the new English content.
 *
 * ORDER OF OPERATIONS (run from repo root):
 *   1. GOOGLE_APPLICATION_CREDENTIALS=<sa.json> node scripts/seed-content.mjs mathematics_f1
 *   2. GOOGLE_APPLICATION_CREDENTIALS=<sa.json> node scripts/audit/replace-f1-math.mjs
 *
 * Admin SDK, idempotent. Reads are scoped to form_1_mathematics (quota-light).
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(fileURLToPath(new URL('../../functions/noop.js', import.meta.url)));
const admin = require('firebase-admin');

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';
admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  projectId: PROJECT,
});
const db = admin.firestore();

console.log(`cleaning legacy Form 1 Math in ${PROJECT}…`);

const snap = await db.collection('questions').where('subjectId', '==', 'form_1_mathematics').get();
const legacy = snap.docs.filter((d) => /^f1_math/i.test(d.id));
const fresh = snap.docs.filter((d) => /^form_1_mathematics_topic/i.test(d.id));
console.log(`found ${snap.size} F1 math questions: ${legacy.length} legacy, ${fresh.length} fresh English`);

if (fresh.length === 0) {
  console.error('✗ Refusing to delete: no fresh English questions found. Run seed-content.mjs mathematics_f1 FIRST.');
  process.exit(1);
}

let deleted = 0;
let batch = db.batch();
let n = 0;
for (const d of legacy) {
  batch.delete(d.ref);
  deleted++;
  if (++n >= 400) { await batch.commit(); batch = db.batch(); n = 0; }
}
if (n) await batch.commit();

console.log(`✓ deleted ${deleted} legacy f1_math_* question(s)`);
console.log('Form 1 Math now serves only the fresh English content. Done.');
process.exit(0);
