/**
 * Cleanup script — removes sample data added by seed-data.mjs
 * Deletes: questions (subjectId: math/biology/chemistry), 3 sample packs,
 *          11 sample topics, 8 sample subjects
 * Keeps: subscription_plans, settings/gamification, forms, existing real data
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, deleteDoc, getDocs, query, where,
} from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyA9NxggtzrTbs24_5gwwbqKwxFHPa9EV4k',
  authDomain: 'tanza-9b182.firebaseapp.com',
  projectId: 'tanza-9b182',
});
const db = getFirestore(app);

let deleted = 0;

async function del(col, id) {
  await deleteDoc(doc(db, col, id));
  console.log(`  ✗ deleted ${col}/${id}`);
  deleted++;
}

// ── questions seeded with wrong subjectId ─────────────────────────────────────
console.log('\n❌ Deleting sample questions...');
for (const subj of ['math', 'biology', 'chemistry']) {
  const snap = await getDocs(query(collection(db, 'questions'), where('subjectId', '==', subj)));
  for (const d of snap.docs) await del('questions', d.id);
}

// ── learning packs created by seed-data.mjs ───────────────────────────────────
console.log('\n❌ Deleting sample learning packs...');
const packSnap = await getDocs(query(
  collection(db, 'learning_packs'),
  where('subjectId', 'in', ['math', 'biology', 'chemistry'])
));
for (const d of packSnap.docs) await del('learning_packs', d.id);

// ── topics created by seed-data.mjs ──────────────────────────────────────────
console.log('\n❌ Deleting sample topics...');
const myTopics = [
  'math_algebra', 'math_geometry', 'math_fractions', 'math_statistics',
  'bio_cells', 'bio_photosynthesis', 'bio_genetics', 'bio_ecology',
  'chem_periodic', 'chem_bonding', 'chem_acids',
];
for (const id of myTopics) await del('topics', id);

// ── subjects created by seed-data.mjs (generic short IDs) ────────────────────
console.log('\n❌ Deleting sample subjects...');
const mySubjects = ['math', 'biology', 'chemistry', 'physics', 'english', 'history', 'geography', 'kiswahili'];
for (const id of mySubjects) await del('subjects', id);

console.log(`\n✅ Cleanup complete — ${deleted} documents deleted.`);
process.exit(0);
