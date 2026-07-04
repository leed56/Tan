/**
 * One-off diagnostic: dumps every document in admin_users using the Admin SDK
 * (bypasses security rules entirely), so we can see ground truth regardless
 * of what the Firestore Rules Playground or browser network tab show.
 *
 * Run:
 *   GOOGLE_APPLICATION_CREDENTIALS=<sa.json> \
 *   node --experimental-strip-types scripts/diagnose-admin-users.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
// firebase-admin lives in functions/node_modules; resolve relative to this
// script the same way scripts/seed-content.mjs does.
const require = createRequire(fileURLToPath(new URL('../functions/noop.js', import.meta.url)));
const admin = require('firebase-admin');

const PROJECT = process.env.SEED_PROJECT_ID || 'tanza-9b182';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS first (same as golive.sh requires).');
  process.exit(1);
}

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

const snap = await db.collection('admin_users').get();
console.log(`\n=== admin_users collection: ${snap.size} document(s) ===\n`);
snap.forEach((doc) => {
  console.log(`Document ID: "${doc.id}"  (length: ${doc.id.length})`);
  console.log(JSON.stringify(doc.data(), null, 2));
  console.log('---');
});

// Also try the specific UID we've been discussing, both variants, to settle
// the O-vs-0 question once and for all.
const candidates = ['HtNExtTHYqXS0LaqDWD9LhGjRK93', 'HtNExtTHYqXSOLaqDWD9LhGjRK93'];
for (const uid of candidates) {
  const doc = await db.collection('admin_users').doc(uid).get();
  console.log(`\nDirect get("${uid}"): exists = ${doc.exists}`);
  if (doc.exists) console.log(JSON.stringify(doc.data(), null, 2));
}

process.exit(0);
