/**
 * Checks pack structure for one topic against the expected spec:
 *   summary: xpReward=10, questionCount=0
 *   mcq:     questionCount=15
 *   fib:     questionCount=10
 *   tf:       questionCount=10
 *   hoq:     questionCount=3
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyA9NxggtzrTbs24_5gwwbqKwxFHPa9EV4k',
  authDomain: 'tanza-9b182.firebaseapp.com',
  projectId: 'tanza-9b182',
});
const db = getFirestore(app);

const EXPECTED = { summary: 0, mcq: 15, fib: 10, tf: 10, hoq: 3 };
const EXPECTED_XP = { summary: 10, mcq: 15, fib: 10, tf: 10, hoq: 30 };

// Fetch all packs for form_1_mathematics
const snap = await getDocs(query(
  collection(db, 'learning_packs'),
  where('subjectId', '==', 'form_1_mathematics')
));
const packs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

// Group by topicId
const byTopic = {};
for (const p of packs) {
  const t = p.topicId ?? 'unknown';
  if (!byTopic[t]) byTopic[t] = [];
  byTopic[t].push(p);
}

const topics = Object.keys(byTopic).sort();
console.log(`\nTotal packs: ${packs.length}  |  Topics: ${topics.length}\n`);
console.log('Expected per topic: summary=0q(10xp), mcq=15q, fib=10q, tf=10q, hoq=3q\n');
console.log('─'.repeat(80));

let issueCount = 0;

for (const topic of topics.slice(0, 3)) { // show first 3 topics
  const topicPacks = byTopic[topic];
  console.log(`\nTOPIC: ${topic}`);

  for (const p of topicPacks.sort((a, b) => (a.quizType ?? '').localeCompare(b.quizType ?? ''))) {
    const qtype = p.quizType ?? p.type ?? 'unknown';
    const expectedQ = EXPECTED[qtype] ?? '?';
    const expectedXP = EXPECTED_XP[qtype] ?? '?';
    const actualQ = p.questionCount ?? 0;
    const actualXP = p.xpReward ?? 0;

    const qOk = expectedQ === '?' || actualQ === expectedQ;
    const xpOk = expectedXP === '?' || actualXP === expectedXP;
    const status = (qOk && xpOk) ? '✓' : '✗';

    if (!qOk || !xpOk) issueCount++;

    console.log(
      `  ${status} [${qtype.padEnd(7)}] "${p.title.slice(0, 45).padEnd(45)}" ` +
      `q=${String(actualQ).padStart(2)} (exp ${String(expectedQ).padStart(2)})  ` +
      `xp=${String(actualXP).padStart(3)} (exp ${String(expectedXP).padStart(3)})` +
      `${!qOk ? '  ← q mismatch' : ''}${!xpOk ? '  ← xp mismatch' : ''}`
    );
  }
}

console.log('\n' + '─'.repeat(80));
console.log(`\nShowing 3 of ${topics.length} topics. Issues found: ${issueCount} (in sample)`);
process.exit(0);
