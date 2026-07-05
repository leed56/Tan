/**
 * Delete the legacy Form 1 Mathematics batch by ID — ZERO reads.
 *
 * The replace-f1-math.mjs script queries the collection first, which fails
 * when the daily Firestore READ quota is exhausted (Spark plan). This variant
 * deletes the legacy questions by their deterministic ids so it needs no
 * reads at all — only the separate delete/write quota.
 *
 * Legacy id shape (verified): f1_math_ch{1..9}_{mcq_1..15, fib_1..10,
 * tf_1..10, hoq_1..3} = 38 per chapter x 9 = 342 documents. Deleting an id
 * that doesn't exist is a harmless no-op, so this is safe to re-run.
 *
 * Run (after seeding the fresh English content):
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> node scripts/audit/delete-legacy-f1-math-byid.mjs
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

const COUNTS = { mcq: 15, fib: 10, tf: 10, hoq: 3 };
const ids = [];
for (let ch = 1; ch <= 9; ch++) {
  for (const [type, n] of Object.entries(COUNTS)) {
    for (let i = 1; i <= n; i++) ids.push(`f1_math_ch${ch}_${type}_${i}`);
  }
}

console.log(`deleting ${ids.length} legacy Form 1 Math questions by id in ${PROJECT} (no reads)…`);

let done = 0;
let batch = db.batch();
let n = 0;
for (const id of ids) {
  batch.delete(db.collection('questions').doc(id));
  if (++n >= 400) { await batch.commit(); done += n; batch = db.batch(); n = 0; }
}
if (n) { await batch.commit(); done += n; }

console.log(`✓ issued deletes for ${done} legacy ids (non-existent ones are no-ops).`);
console.log('Form 1 Math now serves only the fresh English content. Done.');
process.exit(0);
