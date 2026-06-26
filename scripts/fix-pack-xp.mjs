/**
 * Sets correct xpReward on all learning_packs using batched writes.
 * summary=10, mcq=15, fib=10, tf=10, hoq=30
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, doc, writeBatch,
} from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyCkEZ7yeTf9Rmd6642yedBfFsPgEjumtVc',
  authDomain: 'tanzania-81c27.firebaseapp.com',
  projectId: 'tanzania-81c27',
});
const db = getFirestore(app);

const XP_MAP = { summary: 10, mcq: 15, fib: 10, tf: 10, hoq: 30 };

const snap = await getDocs(collection(db, 'learning_packs'));
const packs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
console.log(`Found ${packs.length} packs total.\n`);

// Filter to ones that need updating
const toUpdate = packs.filter(p => {
  const qtype = p.quizType ?? p.type ?? '';
  const xp = XP_MAP[qtype];
  return xp !== undefined && p.xpReward !== xp;
});
console.log(`${toUpdate.length} packs need xpReward update.\n`);

// Firestore batch limit is 500 writes per batch
const BATCH_SIZE = 400;
let updated = 0;

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE);
  const batch = writeBatch(db);

  for (const p of chunk) {
    const qtype = p.quizType ?? p.type ?? '';
    const xp = XP_MAP[qtype];
    batch.update(doc(db, 'learning_packs', p.id), { xpReward: xp });
  }

  await batch.commit();
  updated += chunk.length;
  console.log(`  ✓ Batch committed: ${updated}/${toUpdate.length} packs updated`);
}

console.log(`\n✅ Done — ${updated} packs updated with correct xpReward.`);
console.log('   summary=10, mcq=15, fib=10, tf=10, hoq=30');
process.exit(0);
