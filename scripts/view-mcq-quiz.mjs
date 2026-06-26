/**
 * Pulls the full MCQ quiz (15 questions) for Form 1 Mathematics Topic 1.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyCkEZ7yeTf9Rmd6642yedBfFsPgEjumtVc',
  authDomain: 'tanzania-81c27.firebaseapp.com',
  projectId: 'tanzania-81c27',
});
const db = getFirestore(app);

// MCQ pack for topic 1 (predictable ID pattern)
const PACK_ID = 'form_1_mathematics_topic_1_pack_1';

const qSnap = await getDocs(query(
  collection(db, 'questions'),
  where('learningPackId', '==', PACK_ID),
  limit(20)
));
const questions = qSnap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// Dump raw first question to see options structure
const first = questions[0];
if (first) {
  console.log('\n── RAW options field of Q1 ─────────────────────────────────');
  console.log(JSON.stringify(first.options, null, 2));
  console.log(`type field: "${first.type ?? '(missing)'}"`);
  console.log('─'.repeat(60));
}

function optText(opt) {
  if (typeof opt === 'string') return opt;
  if (opt && typeof opt === 'object') {
    return opt.text ?? opt.value ?? opt.label ?? opt.content ?? opt.answer ?? JSON.stringify(opt);
  }
  return String(opt ?? '');
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

console.log('\n' + '═'.repeat(68));
console.log(`📝  Concept of Mathematics — MCQ Quiz`);
console.log(`    Form 1 Mathematics  |  Topic 1  |  XP: 15 per question`);
console.log('═'.repeat(68));

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const num = String(i + 1).padStart(2, '0');

  console.log(`\nQ${num}. [${(q.difficulty ?? '').toUpperCase()}]`);
  console.log(`     ${q.questionText}`);

  if (Array.isArray(q.options) && q.options.length > 0) {
    q.options.forEach((opt, idx) => {
      const letter = LETTERS[idx];
      const text = optText(opt);
      const correct =
        q.correctAnswer === letter ||
        q.correctAnswer === letter.toLowerCase() ||
        q.correctAnswer === String(idx + 1) ||
        q.correctAnswer === idx;
      console.log(`       ${correct ? '✓' : ' '} ${letter}. ${text}`);
    });
  } else {
    console.log(`       Answer: ${q.correctAnswer}`);
  }

  console.log(`\n     💡 ${q.explanation ?? '—'}`);
  console.log(`     XP: +${q.xpReward ?? 10} | ID: ${q.id}`);
}

console.log('\n' + '═'.repeat(68));
console.log(`Total: ${questions.length} questions | Pack: ${PACK_ID}`);
process.exit(0);
