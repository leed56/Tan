#!/usr/bin/env bash
# ============================================================================
#  Soma AI — one-shot GO LIVE
#  Push the branch, seed all content into Firestore, remove orphan topics,
#  build the web app, and deploy to Firebase Hosting — so you can test it.
#
#  RUN THIS ON YOUR OWN MACHINE (not in the Claude sandbox), from the repo root.
#  Prerequisites installed once: node, npm, firebase-tools (npm i -g firebase-tools),
#  and a Firebase service-account JSON with Firestore write access.
#
#  Usage:
#     export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
#     bash scripts/golive.sh
#
#  Skip a stage with env flags, e.g. only seed + deploy (no push):
#     PUSH=0 bash scripts/golive.sh
#  Flags (default 1 = run): PUSH, SEED, CLEAN, BUILD, DEPLOY
# ============================================================================
set -euo pipefail

BRANCH="claude/last-updated-phj7xz"
PUSH="${PUSH:-1}"
SEED="${SEED:-1}"
CLEAN="${CLEAN:-1}"
BUILD="${BUILD:-1}"
DEPLOY="${DEPLOY:-1}"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$1" >&2; exit 1; }

# --- 1. Push -----------------------------------------------------------------
if [ "$PUSH" = "1" ]; then
  say "Pushing $BRANCH to origin"
  git push -u origin "$BRANCH" || die "git push failed — resolve and re-run with PUSH=1"
fi

# --- Seeder credential check (needed for SEED and CLEAN) ----------------------
if [ "$SEED" = "1" ] || [ "$CLEAN" = "1" ]; then
  [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] || \
    die "Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service-account JSON path"
  [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ] || \
    die "GOOGLE_APPLICATION_CREDENTIALS file not found: $GOOGLE_APPLICATION_CREDENTIALS"
  # firebase-admin lives in functions/node_modules
  [ -d functions/node_modules/firebase-admin ] || ( say "Installing functions deps"; ( cd functions && npm install ) )
fi

# --- 2. Seed content ---------------------------------------------------------
if [ "$SEED" = "1" ]; then
  say "Seeding ALL content into Firestore"
  node --experimental-strip-types scripts/seed-content.mjs || die "seeding failed"
fi

# --- 3. Remove orphan topics -------------------------------------------------
if [ "$CLEAN" = "1" ]; then
  say "Cleaning orphan math topics (dry-run preview first)"
  node --experimental-strip-types scripts/cleanup-orphan-topics.mjs --dry-run
  printf '\nProceed with actual deletion of the orphan topics above? [y/N] '
  read -r ans
  if [ "$ans" = "y" ] || [ "$ans" = "Y" ]; then
    node --experimental-strip-types scripts/cleanup-orphan-topics.mjs || die "cleanup failed"
  else
    say "Skipped orphan deletion (you can run scripts/cleanup-orphan-topics.mjs later)"
  fi
fi

# --- 4. Build web ------------------------------------------------------------
if [ "$BUILD" = "1" ]; then
  say "Installing app deps + building web bundle (dist/)"
  npm install
  npx expo export -p web || die "expo export failed"
fi

# --- 5. Deploy hosting -------------------------------------------------------
if [ "$DEPLOY" = "1" ]; then
  say "Deploying to Firebase Hosting"
  firebase deploy --only hosting || die "firebase deploy failed (run 'firebase login' first)"
fi

say "Done. Open your Firebase Hosting URL and test."
echo "   New content is live in Firestore the moment seeding finished (step 2),"
echo "   even before the redeploy — the app reads content at runtime."
