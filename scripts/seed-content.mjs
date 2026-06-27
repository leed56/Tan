/**
 * Content seeder — seeds authored quiz content files into Firestore (tanza-9b182).
 *
 * Reads scripts/content/<glob>.json (default: all *.json), each file = one topic
 * with packs { mcq, fib, tf, summary, hoq }. Writes:
 *   - topics/{topicId}        (real name + description, isActive)
 *   - learning_packs/{packId} (5 packs; summary stores summaryPoints, no questions)
 *   - questions/{qId}         (MCQ/FIB/TF/HOQ only — type uppercase per rules)
 *
 * Admin SDK (bypasses content rules). Idempotent (merge). Preserves other data.
 *
 * Run:
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> \
 *   node --experimental-strip-types scripts/seed-content.mjs [filenameSubstring]
 */
import { createRequire } from 'module';
import { readdirSync, readFileSync } from 'fs';
const require = createRequire('/home/user/Tan/functions/');
const admin = require('firebase-admin');

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';
const FILTER = process.argv[2] || '';
const DIR = '/home/user/Tan/scripts/content';

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  projectId: PROJECT,
});
const db = admin.firestore();
const NOW = Date.now();

const PACKS = [
  { p: 1, key: 'mcq',     type: 'mcq',     qtype: 'MCQ', suffix: 'MCQ Quiz',               xp: 15, premium: false, est: 12, desc: 'Test your knowledge with multiple choice questions.' },
  { p: 2, key: 'tf',      type: 'tf',      qtype: 'TF',  suffix: 'True or False',          xp: 10, premium: false, est: 8,  desc: 'Quickly verify key facts and correct misconceptions.' },
  { p: 3, key: 'fib',     type: 'fib',     qtype: 'FIB', suffix: 'Fill in the Blanks',     xp: 10, premium: false, est: 10, desc: 'Complete sentences using the correct terms.' },
  { p: 4, key: 'summary', type: 'summary', qtype: null,  suffix: 'Summary',                xp: 10, premium: true,  est: 5,  desc: 'A concise overview of all key concepts.' },
  { p: 5, key: 'hoq',     type: 'hoq',     qtype: 'HOQ', suffix: 'Higher Order Questions', xp: 30, premium: true,  est: 30, desc: 'NECTA-style questions requiring deep analysis.' },
];

function parseIds(topicId) {
  const m = topicId.match(/^(form_\d+)_(.+)_topic_\d+$/);
  if (!m) throw new Error(`bad topicId: ${topicId}`);
  return { formId: m[1], subjectId: `${m[1]}_${m[2]}` };
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && f.includes(FILTER));
console.log(`Seeding ${files.length} topic file(s) → ${PROJECT}\n`);

let topicsN = 0, packsN = 0, qN = 0;
for (const file of files.sort()) {
  const t = JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8'));
  const { formId, subjectId } = parseIds(t.topicId);
  const batch = db.batch();

  // topic
  batch.set(db.collection('topics').doc(t.topicId), {
    id: t.topicId, formId, subjectId, name: t.topicName,
    description: t.description || `${t.topicName} — Form 1`,
    order: t.order, difficulty: 'medium', estimatedMinutes: 45,
    isActive: true, createdAt: NOW, updatedAt: NOW,
  }, { merge: true });
  topicsN++;

  for (const cfg of PACKS) {
    const items = t.packs[cfg.key] || [];
    const packId = `${t.topicId}_pack_${cfg.p}`;
    const packDoc = {
      id: packId, formId, subjectId, topicId: t.topicId,
      title: `${t.topicName} — ${cfg.suffix}`, description: cfg.desc,
      type: cfg.type, order: cfg.p, estimatedMinutes: cfg.est, difficulty: 'medium',
      questionCount: cfg.qtype ? items.length : 0,
      isPremium: cfg.premium, isActive: true,
      completionXP: cfg.xp, xpReward: cfg.xp,
      createdAt: NOW, updatedAt: NOW,
    };
    if (cfg.key === 'summary') {
      packDoc.summaryPoints = items.map((s) => ({ point: s.questionText, detail: s.correctAnswer || s.explanation || '' }));
    }
    batch.set(db.collection('learning_packs').doc(packId), packDoc, { merge: true });
    packsN++;

    if (!cfg.qtype) continue; // summary → no question docs
    items.forEach((it, i) => {
      const qId = `${t.topicId}_${cfg.key}_${i + 1}`;
      batch.set(db.collection('questions').doc(qId), {
        id: qId, formId, subjectId, topicId: t.topicId, learningPackId: packId,
        type: cfg.qtype,
        questionText: it.questionText,
        options: Array.isArray(it.options) ? it.options : [],
        correctAnswer: String(it.correctAnswer),
        explanation: it.explanation || '',
        difficulty: it.difficulty || 'medium',
        xpReward: 10,
        order: i + 1, isActive: true, isPremium: cfg.premium,
        imagePrompt: '', createdAt: NOW, updatedAt: NOW,
      }, { merge: true });
      qN++;
    });
  }
  await batch.commit();
  console.log(`  ✓ ${t.topicName}: 5 packs, ${qN} questions so far`);
}
console.log(`\n✅ Seeded: ${topicsN} topics, ${packsN} packs, ${qN} questions → ${PROJECT}`);
process.exit(0);
