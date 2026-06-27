/**
 * Admin-SDK curriculum seeder for tanza-9b182.
 *
 * Uses the Firebase Admin SDK (service account) so it bypasses Firestore rules,
 * which only allow content writes from admin/content-editor accounts. Seeds the
 * structural curriculum (forms, subjects, topic shells, packs) while PRESERVING
 * any existing topics/questions (e.g. the Form-1 Mathematics content already in
 * the project).
 *
 * Run:
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> \
 *   node --experimental-strip-types scripts/seed-admin.mjs
 *
 * Idempotent: safe to re-run (merge writes).
 */
import { createRequire } from 'module';
const require = createRequire('/home/user/Tan/functions/');
const admin = require('firebase-admin');

import {
  SEED_FORMS,
  buildSeedSubjects,
  buildSeedTopics,
  buildSeedLearningPacks,
} from '../src/utils/seedData.ts';

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  projectId: PROJECT,
});
const db = admin.firestore();
const NOW = Date.now();

async function upsert(items, colName, idKey = 'id') {
  const CHUNK = 400;
  let n = 0;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = db.batch();
    for (const it of items.slice(i, i + CHUNK)) {
      batch.set(db.collection(colName).doc(it[idKey]), { ...it, updatedAt: NOW }, { merge: true });
    }
    await batch.commit();
    n += Math.min(CHUNK, items.length - i);
    console.log(`  ✓ ${colName}: ${n}/${items.length}`);
  }
}

console.log(`\n🏫 Forms → ${PROJECT}`);
await upsert(SEED_FORMS, 'forms');

console.log('\n📚 Subjects (13 × 4)');
await upsert(buildSeedSubjects(), 'subjects');

console.log('\n📋 Topics (preserve existing content combos)');
const existing = await db.collection('topics').get();
const combos = new Set();
existing.docs.forEach((d) => combos.add(`${d.data().formId}|${d.data().subjectId}`));
console.log(`  Existing topic combos preserved: ${[...combos].join(', ') || '(none)'}`);
const shellTopics = buildSeedTopics().filter((t) => !combos.has(`${t.formId}|${t.subjectId}`));
console.log(`  Writing ${shellTopics.length} shell topics`);
await upsert(shellTopics, 'topics');

console.log('\n📦 Learning packs');
await upsert(buildSeedLearningPacks(), 'learning_packs');

console.log('\n✅ Done. Existing topics/questions untouched.');
process.exit(0);
