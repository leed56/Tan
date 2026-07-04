/**
 * Orphan-topic cleanup — deletes math topics that were removed from the
 * authored content set when Form 1–4 Mathematics was rebuilt from the TIE 2023
 * syllabus. These docs still linger in Firestore from earlier auto-generated
 * batches and must be removed so the app's topic lists match the syllabus.
 *
 * For each orphan topicId it deletes, by query (so it catches every doc no
 * matter how the pack/question ids were formed):
 *   - topics/{topicId}
 *   - learning_packs where topicId == {topicId}   (the 5 packs)
 *   - questions      where topicId == {topicId}   (all MCQ/FIB/TF/HOQ)
 *
 * Admin SDK (bypasses rules). Idempotent — re-running is safe (already-deleted
 * docs are simply absent). Preserves ALL other data.
 *
 * Orphans (why each is gone):
 *   form_1_mathematics_topic_7/8/9  — TIE Form 1 has 6 chapters (ends at
 *                                     Coordinate Geometry); Equations, Geometry
 *                                     and Perimeter and Area were not in TIE.
 *   form_2_mathematics_topic_9/10   — TIE Form 2 has 8 chapters; old topic_9
 *                                     (Trigonometry) and topic_10 (Sets) fell
 *                                     outside the rebuilt 1–8 set.
 *
 * Run (dry-run first to see what WOULD be deleted):
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> \
 *   node --experimental-strip-types scripts/cleanup-orphan-topics.mjs --dry-run
 *
 * Then, to actually delete:
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> \
 *   node --experimental-strip-types scripts/cleanup-orphan-topics.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(fileURLToPath(new URL('../functions/noop.js', import.meta.url)));
const admin = require('firebase-admin');

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';
const DRY_RUN = process.argv.includes('--dry-run');

// Topic ids no longer present in scripts/content/ after the TIE rebuild.
const ORPHAN_TOPIC_IDS = [
  'form_1_mathematics_topic_7',
  'form_1_mathematics_topic_8',
  'form_1_mathematics_topic_9',
  'form_2_mathematics_topic_9',
  'form_2_mathematics_topic_10',
];

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  projectId: PROJECT,
});
const db = admin.firestore();

let deleted = 0;

async function deleteByQuery(col, topicId) {
  const snap = await db.collection(col).where('topicId', '==', topicId).get();
  for (const doc of snap.docs) {
    if (DRY_RUN) {
      console.log(`    would delete ${col}/${doc.id}`);
    } else {
      await doc.ref.delete();
      console.log(`    ✗ deleted ${col}/${doc.id}`);
    }
    deleted++;
  }
}

async function deleteTopicDoc(topicId) {
  const ref = db.collection('topics').doc(topicId);
  const snap = await ref.get();
  if (!snap.exists) return;
  if (DRY_RUN) {
    console.log(`    would delete topics/${topicId}`);
  } else {
    await ref.delete();
    console.log(`    ✗ deleted topics/${topicId}`);
  }
  deleted++;
}

console.log(`${DRY_RUN ? '[DRY-RUN] ' : ''}Cleaning orphan math topics → ${PROJECT}\n`);
for (const topicId of ORPHAN_TOPIC_IDS) {
  console.log(`• ${topicId}`);
  await deleteByQuery('questions', topicId);
  await deleteByQuery('learning_packs', topicId);
  await deleteTopicDoc(topicId);
}

console.log(
  `\n${DRY_RUN ? '[DRY-RUN] ' : '✅ '}` +
  `${DRY_RUN ? 'Would delete' : 'Deleted'} ${deleted} document(s) across ` +
  `${ORPHAN_TOPIC_IDS.length} orphan topics.`,
);
process.exit(0);
