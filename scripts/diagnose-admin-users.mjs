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

// Ground truth: ask Firebase Auth itself for the real UID, no transcription
// involved, then auto-repair admin_users if it's keyed under the wrong id.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@soma.tz';
console.log(`\n=== Firebase Auth lookup for ${ADMIN_EMAIL} ===`);
const authUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
console.log(`Real Auth UID: "${authUser.uid}"  (length: ${authUser.uid.length})`);

const correctDoc = await db.collection('admin_users').doc(authUser.uid).get();
if (correctDoc.exists) {
  console.log('\n✓ admin_users is already keyed correctly — no fix needed.');
} else {
  console.log('\n✗ No admin_users document at the real Auth UID — this is the bug.');
  // Find whichever existing doc has this email and copy its data over to the
  // correctly-keyed document, so the app's getDoc(admin_users/{uid}) finds it.
  const byEmail = await db.collection('admin_users').where('email', '==', ADMIN_EMAIL).get();
  if (byEmail.empty) {
    console.log(`No admin_users document has email == "${ADMIN_EMAIL}" — nothing to copy. Create one manually at admin_users/${authUser.uid}.`);
  } else {
    const data = byEmail.docs[0].data();
    await db.collection('admin_users').doc(authUser.uid).set(data);
    console.log(`✓ Copied admin_users/${byEmail.docs[0].id} → admin_users/${authUser.uid}`);
    console.log('You can now delete the old mis-keyed document from the Firestore console if you want (optional cleanup).');
  }
}

process.exit(0);
