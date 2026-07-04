#!/usr/bin/env bash
# ============================================================================
#  Soma Admin Panel — build & deploy
#
#  Deploys admin/ (the Vite/React admin dashboard) to its own Firebase
#  Hosting site, completely separate from the student app's hosting config
#  (admin/firebase.json), so this never touches the student app's deploy.
#
#  ONE-TIME SETUP (run once, before the first deploy):
#     firebase login
#     firebase hosting:sites:create soma-admin --project tanza-9b182
#
#  RUN THIS ON YOUR OWN MACHINE (not in the Claude sandbox), from the repo root.
#
#  Usage:
#     bash scripts/deploy-admin.sh
# ============================================================================
set -euo pipefail

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$1" >&2; exit 1; }

[ -f .env ] || die "Root .env not found — the admin app reads the same Firebase project config from it."

# --- 1. Generate admin/.env from the root .env (Firebase web config is not
#        secret, so this keeps both apps pointed at the same project without
#        any manual copy/paste step). -----------------------------------------
say "Syncing admin/.env from root .env"
node -e '
  const fs = require("fs");
  const root = fs.readFileSync(".env", "utf8");
  const get = (key) => {
    const m = root.match(new RegExp("^" + key + "=(.*)$", "m"));
    return m ? m[1].trim() : "";
  };
  const map = {
    VITE_FIREBASE_API_KEY: "EXPO_PUBLIC_FIREBASE_API_KEY",
    VITE_FIREBASE_AUTH_DOMAIN: "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    VITE_FIREBASE_PROJECT_ID: "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    VITE_FIREBASE_STORAGE_BUCKET: "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    VITE_FIREBASE_APP_ID: "EXPO_PUBLIC_FIREBASE_APP_ID",
  };
  const lines = Object.entries(map).map(([viteKey, expoKey]) => `${viteKey}=${get(expoKey)}`);
  fs.writeFileSync("admin/.env", lines.join("\n") + "\n");
  console.log("Wrote admin/.env (" + lines.length + " vars)");
'

# --- 2. Install deps + build ---------------------------------------------------
say "Installing admin deps (if needed) + building"
( cd admin && [ -d node_modules ] || npm install )
( cd admin && npm run build ) || die "admin build failed"

# --- 3. Deploy to its own Hosting site -----------------------------------------
say "Deploying admin panel to Firebase Hosting (site: soma-admin)"
firebase deploy --only hosting --config admin/firebase.json --project tanza-9b182 \
  || die "deploy failed — did you run the one-time 'firebase hosting:sites:create soma-admin --project tanza-9b182' setup yet?"

say "Done. Admin panel: https://soma-admin.web.app"
echo "   First time only: create your login — see docs/ADMIN_PANEL_SETUP.md"
