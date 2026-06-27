/**
 * Clean curriculum pipeline seed — all grades (Form 1–4) × all subjects (13).
 *
 * Single source of truth = the app's own builders in src/utils/seedData.ts.
 * Run with Node type-stripping:  node --experimental-strip-types scripts/seed-curriculum.mts
 *
 * Behaviour:
 *  - forms:    upsert all 4.
 *  - subjects: upsert all 52 (13 subjects × 4 forms), form-scoped IDs (form_1_mathematics …).
 *  - topics:   for (subject,form) combos that ALREADY have topics in the DB
 *              (the real Form-1 math/english/kiswahili content), PRESERVE them untouched.
 *              For every other combo, write the builder topic shells (real NECTA names, no packs/questions yet).
 *  - packs:    never touched here — real packs already exist for content combos;
 *              empty topics simply have no packs yet ("coming soon").
 *
 * Idempotent: safe to re-run.
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, getDocs, writeBatch,
} from 'firebase/firestore';
import {
  SEED_FORMS,
  buildSeedSubjects,
  buildSeedTopics,
} from '../src/utils/seedData.ts';

const app = initializeApp({
  apiKey: 'AIzaSyA9NxggtzrTbs24_5gwwbqKwxFHPa9EV4k',
  authDomain: 'tanza-9b182.firebaseapp.com',
  projectId: 'tanza-9b182',
});
const db = getFirestore(app);

const NOW = Date.now();

async function commitInChunks(items: any[], colName: string, idKey = 'id') {
  const BATCH = 400;
  let written = 0;
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    const batch = writeBatch(db);
    for (const it of chunk) {
      batch.set(doc(db, colName, it[idKey]), it, { merge: true });
    }
    await batch.commit();
    written += chunk.length;
    console.log(`  ✓ ${colName}: ${written}/${items.length}`);
  }
}

// ── 1. Forms ──────────────────────────────────────────────────────────────────
console.log('\n🏫 Forms...');
await commitInChunks(SEED_FORMS.map((f) => ({ ...f, updatedAt: NOW })), 'forms');

// ── 2. Subjects (all 52) ──────────────────────────────────────────────────────
console.log('\n📚 Subjects (all 13 × 4 forms)...');
const subjects = buildSeedSubjects().map((s) => ({ ...s, updatedAt: NOW }));
await commitInChunks(subjects, 'subjects');

// ── 3. Topics — preserve existing content combos, shell the rest ───────────────
console.log('\n📋 Topics...');
// Which (formId|subjectId) combos already have real topics?
const existingTopicsSnap = await getDocs(collection(db, 'topics'));
const combosWithContent = new Set<string>();
existingTopicsSnap.docs.forEach((d) => {
  const t = d.data();
  combosWithContent.add(`${t.formId}|${t.subjectId}`);
});
console.log(`  Existing content combos preserved: ${[...combosWithContent].join(', ') || '(none)'}`);

const allTopics = buildSeedTopics();
const shellTopics = allTopics
  .filter((t) => !combosWithContent.has(`${t.formId}|${t.subjectId}`))
  .map((t) => ({ ...t, updatedAt: NOW }));

console.log(`  Writing ${shellTopics.length} shell topics for empty combos...`);
await commitInChunks(shellTopics, 'topics');

console.log('\n✅ Curriculum pipeline seeded.');
console.log(`   Forms: ${SEED_FORMS.length} | Subjects: ${subjects.length} | Shell topics added: ${shellTopics.length}`);
console.log('   Existing Form-1 math/english/kiswahili topics + packs + questions untouched.');
process.exit(0);
