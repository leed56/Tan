/**
 * Standalone Firebase connectivity + content diagnostic.
 *
 * Answers, in the terminal (no browser console needed):
 *   1. Is .env present and is EXPO_PUBLIC_FIREBASE_PROJECT_ID set?
 *   2. Can we reach the project and sign in anonymously?
 *   3. Does the real Firestore actually contain curriculum content?
 *
 * Run from the project root:
 *   node scripts/check-firebase.mjs
 */
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

function line(s = '') { console.log(s); }

// ── 1. Load .env manually (no dotenv dependency) ──────────────────────────────
let env = {};
try {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const l of raw.split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
} catch {
  line('❌ STEP 1: No .env file found at project root.');
  line('   → The app will run in OFFLINE SEED MODE (mock data only).');
  line('   → Create .env from .env.example with your Firebase keys.');
  process.exit(1);
}

const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '';
line('── STEP 1: .env ────────────────────────────────');
if (!projectId) {
  line('❌ EXPO_PUBLIC_FIREBASE_PROJECT_ID is EMPTY in .env.');
  line('   → This is why the app shows mock data. Fill in the Firebase values.');
  process.exit(1);
}
line(`✅ .env found. Project: "${projectId}"`);
line(`   apiKey set:  ${env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'yes' : 'NO'}`);
line(`   appId set:   ${env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'yes' : 'NO'}`);
line('');

// ── 2. Init + anonymous auth ──────────────────────────────────────────────────
const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

line('── STEP 2: Anonymous sign-in ───────────────────');
try {
  const cred = await signInAnonymously(auth);
  line(`✅ Signed in anonymously (uid ${cred.user.uid.slice(0, 8)}…)`);
} catch (e) {
  line(`❌ Anonymous sign-in FAILED: ${e.code || e.message}`);
  line('   → In Firebase Console → Authentication → Sign-in method,');
  line('     make sure "Anonymous" is ENABLED.');
  process.exit(1);
}
line('');

// ── 3. Count real content ─────────────────────────────────────────────────────
line('── STEP 3: Real content in Firestore ───────────');
async function count(coll, ...clauses) {
  const q = clauses.length ? query(collection(db, coll), ...clauses) : collection(db, coll);
  try {
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (e) {
    // Fall back to a full fetch if aggregate queries aren't available.
    try {
      const s = await getDocs(q);
      return s.size;
    } catch (e2) {
      return `ERROR: ${e2.code || e2.message}`;
    }
  }
}

const subjects = await count('subjects');
const topics = await count('topics');
const packs = await count('learning_packs');
const questions = await count('questions');
line(`subjects:        ${subjects}`);
line(`topics:          ${topics}`);
line(`learning_packs:  ${packs}`);
line(`questions:       ${questions}`);
line('');

// Targeted: the exact query the app runs for Biology Form 1 (has real content).
line('── STEP 4: App-shaped query (Biology Form 1) ───');
try {
  const snap = await getDocs(query(
    collection(db, 'topics'),
    where('formId', '==', 'form_1'),
    where('subjectId', '==', 'form_1_biology'),
    where('isActive', '==', true),
  ));
  line(`Biology Form 1 topics found: ${snap.size}`);
  snap.docs.slice(0, 3).forEach((d) => line(`   • ${d.data().name}`));
  if (snap.size === 0) {
    line('   → Query works but 0 docs. Content was NOT seeded to this project.');
  }
} catch (e) {
  line(`❌ Query FAILED: ${e.code || e.message}`);
  if (String(e.message || '').includes('index')) {
    line('   → Missing composite index. Deploy: firebase deploy --only firestore:indexes');
  } else if (String(e.code || '').includes('permission')) {
    line('   → Rules rejected the read. Check firestore.rules is deployed.');
  }
}
line('');
line('── DONE ────────────────────────────────────────');
process.exit(0);
