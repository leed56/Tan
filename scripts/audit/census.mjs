/**
 * Full-content audit sweep: integrity checks + math-notation census over every
 * question, pack, and topic in the live Firestore project.
 *
 * Outputs (written to scripts/audit/output/):
 *   integrity.json  — per-defect lists with question ids
 *   census.json     — notation frequency per subject per form
 *   sample.json     — stratified question sample for exam-style scoring
 *   summary.md      — human-readable tables
 *
 * Run from the project root:  node scripts/audit/census.mjs
 * Read-only; requires .env with EXPO_PUBLIC_FIREBASE_* and anonymous auth enabled.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore, collection, query, orderBy, startAfter, limit, getDocs,
} from 'firebase/firestore';

// ── env + init ────────────────────────────────────────────────────────────────
const env = {};
for (const l of readFileSync(new URL('../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
await signInAnonymously(getAuth(app));
const db = getFirestore(app);
console.log(`connected to ${env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);

// ── paged fetch of a whole collection ─────────────────────────────────────────
async function fetchAll(coll, pageSize = 400) {
  const docs = [];
  let cursor = null;
  for (;;) {
    const q = cursor
      ? query(collection(db, coll), orderBy('__name__'), startAfter(cursor), limit(pageSize))
      : query(collection(db, coll), orderBy('__name__'), limit(pageSize));
    const snap = await getDocs(q);
    if (snap.empty) break;
    for (const d of snap.docs) docs.push({ id: d.id, ...d.data() });
    cursor = snap.docs[snap.docs.length - 1];
    process.stdout.write(`\r${coll}: ${docs.length}   `);
    if (snap.size < pageSize) break;
  }
  console.log();
  return docs;
}

const packs = await fetchAll('learning_packs');
const questions = await fetchAll('questions');

// ── helpers ───────────────────────────────────────────────────────────────────
// subject/form from id convention form_{n}_{subject}_topic_{k}_pack_{p}
const subjOf = (q) => {
  const m = String(q.subjectId ?? '').match(/^form_\d+_(.+)$/);
  if (m) return m[1];
  const m2 = String(q.learningPackId ?? q.packId ?? '').match(/^form_\d+_([a-z_]+?)_topic_/);
  return m2 ? m2[1] : String(q.subjectId ?? 'unknown');
};
const formOf = (q) => {
  const m = String(q.formId ?? q.learningPackId ?? q.packId ?? '').match(/form_(\d)/);
  return m ? `form_${m[1]}` : 'unknown';
};
const textOf = (q) => [
  q.questionText ?? '',
  ...(Array.isArray(q.options) ? q.options.map((o) => o?.text ?? '') : []),
  q.explanation ?? '',
  ...(Array.isArray(q.summaryPoints) ? q.summaryPoints : []),
].join('\n');

// ── notation census classes ───────────────────────────────────────────────────
const NOTATION = {
  latexInline: /\\\(|\\\)/,
  latexBlock: /\\\[|\\\]/,
  latexText: /\\text\s*\{/,
  latexFrac: /\\d?frac\s*\{/,
  latexSqrt: /\\sqrt\s*\{?/,
  asciiSqrt: /\bsqrt\s*\(/,
  caretExponent: /\^-?\d|\^\{|\^\(/,
  underscoreSubscript: /[A-Za-z0-9]_\{?\d/,
  latexTimesDivPm: /\\(times|div|pm|cdot)/,
  chemFormula: /\b(?:H2O|CO2|O2\b|H2SO4|NaCl|CaCO3|NH3|CH4|HCl|NaOH|C6H12O6|KMnO4|MgO|SO2|N2\b|H2\b)/,
  chemArrow: /-->|->|→|\\rightarrow/,
  asciiFraction: /\b\d+\s*\/\s*\d+\b/,
  degreeSign: /°|\bdeg\b|\^\{?\\?circ/,
  unitsCompound: /\b(?:m\/s|km\/h|kg\/m|g\/cm|mol\/dm|N\/m)\b/,
  otherBackslash: /\\[a-zA-Z]{2,}/,
};

// ── sweep ─────────────────────────────────────────────────────────────────────
const packById = new Map(packs.map((p) => [p.id, p]));
const questionsByPack = new Map();
const census = {};   // census[subject][form][class] = count
const defects = {
  badType: [], badOptions: [], badCorrectAnswer: [], emptyExplanation: [],
  orphanPack: [], badTF: [], emptyFIBAnswer: [], rawBackslashVisible: [],
};
const VALID_TYPES = new Set(['MCQ', 'FIB', 'TF', 'HOQ', 'SUMMARY']);
const sample = {};   // sample[subject][form][type] = [up to 10 questions]

for (const q of questions) {
  const subj = subjOf(q);
  const form = formOf(q);
  const type = String(q.type ?? '').toUpperCase();
  const packId = q.learningPackId ?? q.packId ?? '';
  const text = textOf(q);

  // integrity
  if (!VALID_TYPES.has(type)) defects.badType.push({ id: q.id, type: q.type });
  if (!packById.has(packId)) defects.orphanPack.push({ id: q.id, packId });
  if (type === 'MCQ' || type === 'HOQ') {
    const opts = Array.isArray(q.options) ? q.options : [];
    if (opts.length < 3) defects.badOptions.push({ id: q.id, type, count: opts.length });
    else if (!opts.some((o) => o?.id === q.correctAnswer)) {
      defects.badCorrectAnswer.push({ id: q.id, type, correctAnswer: q.correctAnswer });
    }
  }
  if (type === 'TF' && !['true', 'false'].includes(String(q.correctAnswer))) {
    defects.badTF.push({ id: q.id, correctAnswer: q.correctAnswer });
  }
  if (type === 'FIB' && !String(q.correctAnswer ?? '').trim()) {
    defects.emptyFIBAnswer.push({ id: q.id });
  }
  if (type !== 'SUMMARY' && !String(q.explanation ?? '').trim()) {
    defects.emptyExplanation.push({ id: q.id, type });
  }

  // census
  const cell = ((census[subj] ??= {})[form] ??= {});
  for (const [name, re] of Object.entries(NOTATION)) {
    if (re.test(text)) cell[name] = (cell[name] ?? 0) + 1;
  }
  cell.total = (cell.total ?? 0) + 1;

  // markup that today's MathRenderer would show raw: \frac, subscripts,
  // \times family, any other backslash command outside \( \) handling
  if (/\\d?frac|\\(times|div|pm|cdot|rightarrow)|[A-Za-z]_\{/.test(text)) {
    defects.rawBackslashVisible.push({ id: q.id, subj, form });
  }

  // pack question tally
  questionsByPack.set(packId, (questionsByPack.get(packId) ?? 0) + 1);

  // stratified sample
  const bucket = (((sample[subj] ??= {})[form] ??= {})[type] ??= []);
  if (bucket.length < 10) {
    bucket.push({
      id: q.id,
      questionText: q.questionText,
      options: (q.options ?? []).map((o) => o?.text),
      correctAnswer: q.correctAnswer,
      explanation: (q.explanation ?? '').slice(0, 300),
      difficulty: q.difficulty,
    });
  }
}

// pack count mismatches
const packMismatch = [];
for (const p of packs) {
  const actual = questionsByPack.get(p.id) ?? 0;
  if ((p.questionCount ?? 0) !== actual) {
    packMismatch.push({ id: p.id, declared: p.questionCount ?? 0, actual });
  }
}

// ── outputs ───────────────────────────────────────────────────────────────────
const outDir = new URL('./output/', import.meta.url);
mkdirSync(outDir, { recursive: true });
const save = (name, data) => writeFileSync(new URL(name, outDir), JSON.stringify(data, null, 1));
save('integrity.json', { defects, packMismatch: packMismatch.slice(0, 500), packMismatchTotal: packMismatch.length });
save('census.json', census);
save('sample.json', sample);

// summary.md
let md = `# Content census — ${new Date().toISOString().slice(0, 10)}\n\n`;
md += `questions: ${questions.length} · packs: ${packs.length}\n\n## Integrity defects\n\n| defect | count |\n|---|---|\n`;
for (const [k, v] of Object.entries(defects)) md += `| ${k} | ${v.length} |\n`;
md += `| packQuestionCountMismatch | ${packMismatch.length} |\n`;
md += `\n## Notation census (questions containing each class, by subject)\n\n`;
const classes = Object.keys(NOTATION);
for (const subj of Object.keys(census).sort()) {
  md += `\n### ${subj}\n\n| form | total | ${classes.join(' | ')} |\n|---|---|${classes.map(() => '---').join('|')}|\n`;
  for (const form of Object.keys(census[subj]).sort()) {
    const c = census[subj][form];
    md += `| ${form} | ${c.total} | ${classes.map((k) => c[k] ?? 0).join(' | ')} |\n`;
  }
}
writeFileSync(new URL('summary.md', outDir), md);

console.log('\n── integrity ──');
for (const [k, v] of Object.entries(defects)) console.log(`${k}: ${v.length}`);
console.log(`packQuestionCountMismatch: ${packMismatch.length}`);
console.log('\nwrote scripts/audit/output/{integrity,census,sample}.json + summary.md');
process.exit(0);
