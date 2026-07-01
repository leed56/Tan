import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyA9NxggtzrTbs24_5gwwbqKwxFHPa9EV4k',
  authDomain: 'tanzania-81c27.firebaseapp.com',
  projectId: 'tanzania-81c27',
});
const db = getFirestore(app);

async function count(col, ...constraints) {
  const snap = await getDocs(query(collection(db, col), ...constraints));
  return snap.docs;
}

console.log('\n── questions ────────────────────────────────');
const allQ = await count('questions');
console.log(`Total questions: ${allQ.length}`);

// Group by subject + form
const grouped = {};
for (const d of allQ) {
  const { subjectId, formId, type, difficulty } = d.data();
  const key = `${subjectId} / ${formId}`;
  if (!grouped[key]) grouped[key] = { mcq: 0, fib: 0, tf: 0, hoq: 0, total: 0 };
  grouped[key].total++;
  grouped[key][type] = (grouped[key][type] ?? 0) + 1;
}
for (const [key, v] of Object.entries(grouped).sort()) {
  console.log(`  ${key.padEnd(30)} total=${v.total}  MCQ=${v.mcq??0} FIB=${v.fib??0} TF=${v.tf??0} HOQ=${v.hoq??0}`);
}

console.log('\n── learning_packs ───────────────────────────');
const packs = await count('learning_packs');
for (const d of packs) {
  const { title, subjectId, formId, questionCount } = d.data();
  console.log(`  [${subjectId}/${formId}] ${title} (${questionCount} q)`);
}

console.log('\n── subjects ─────────────────────────────────');
const subs = await count('subjects');
console.log(`  ${subs.map(d => d.data().name).join(', ')}`);

console.log('\n── topics ───────────────────────────────────');
const topics = await count('topics');
for (const d of topics) {
  const { subjectId, name } = d.data();
  console.log(`  [${subjectId}] ${name}`);
}

process.exit(0);
