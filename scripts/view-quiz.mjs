/**
 * Pulls one Mathematics pack + all its questions and prints them.
 * Usage: node scripts/view-quiz.mjs [packTitle]
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, query, where, limit, orderBy,
} from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyA9NxggtzrTbs24_5gwwbqKwxFHPa9EV4k',
  authDomain: 'tanza-9b182.firebaseapp.com',
  projectId: 'tanza-9b182',
});
const db = getFirestore(app);

// ── find one MCQ math pack ────────────────────────────────────────────────────
const packSnap = await getDocs(query(
  collection(db, 'learning_packs'),
  where('subjectId', '==', 'form_1_mathematics'),
  limit(20)
));

const packs = packSnap.docs.map(d => ({ id: d.id, ...d.data() }));
// Pick the first MCQ pack
const pack = packs.find(p => p.title?.toLowerCase().includes('mcq')) ?? packs[0];

if (!pack) {
  console.log('No math packs found.');
  process.exit(1);
}

console.log('\n══════════════════════════════════════════════════════════');
console.log(`📦 PACK: ${pack.title}`);
console.log(`   Subject : ${pack.subjectId}`);
console.log(`   Topic   : ${pack.topicId ?? '—'}`);
console.log(`   Form    : ${pack.formId}`);
console.log(`   Type    : ${pack.quizType ?? pack.type ?? '—'}`);
console.log(`   Q count : ${pack.questionCount ?? '?'}`);
console.log(`   Pack ID : ${pack.id}`);
console.log('══════════════════════════════════════════════════════════\n');

// ── fetch questions for this pack ─────────────────────────────────────────────
const qSnap = await getDocs(query(
  collection(db, 'questions'),
  where('packId', '==', pack.id),
  limit(50)
));

const questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
console.log(`Found ${questions.length} questions for this pack.\n`);

if (questions.length === 0) {
  // Try by topicId if packId yields nothing
  const qSnap2 = await getDocs(query(
    collection(db, 'questions'),
    where('topicId', '==', pack.topicId ?? ''),
    where('subjectId', '==', pack.subjectId ?? ''),
    limit(20)
  ));
  questions.push(...qSnap2.docs.map(d => ({ id: d.id, ...d.data() })));
  if (questions.length) console.log(`  (queried by topicId instead — found ${questions.length})\n`);
}

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const num = String(i + 1).padStart(2, '0');
  console.log(`Q${num}. [${(q.type ?? '').toUpperCase()}] ${q.questionText}`);

  if (Array.isArray(q.options) && q.options.length > 0) {
    q.options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const marker = q.correctAnswer === letter.toLowerCase() || q.correctAnswer === letter ? '✓' : ' ';
      console.log(`      ${marker} ${letter}. ${opt}`);
    });
  } else if (q.type === 'tf' || q.type === 'TF') {
    console.log(`      Answer: ${q.correctAnswer}`);
  } else {
    console.log(`      Answer: ${q.correctAnswer}`);
  }

  console.log(`      Explanation: ${q.explanation ?? '—'}`);
  console.log(`      XP: +${q.xpReward ?? 10}  Difficulty: ${q.difficulty ?? '—'}`);
  console.log();
}

console.log(`Total: ${questions.length} questions displayed.`);
process.exit(0);
