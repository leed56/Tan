# Admin Panel — one-time setup

The admin panel lives in `admin/` and deploys to its own Firebase Hosting
site, separate from the student app. Do these steps once.

## 1. Create the Hosting site (once)

```bash
firebase login
firebase hosting:sites:create <a-unique-site-id> --project tanza-9b182
```

`soma-admin` was already taken by another Firebase project, so this repo
uses **`soma-admin-ce547`** (set in `admin/firebase.json`'s `hosting.site`
and echoed by `deploy-admin.sh`). If you ever need to change it, update
both of those.

## 2. Deploy

On Windows, `bash` on PATH can resolve to the (uninstalled) WSL stub
instead of Git Bash — call Git Bash explicitly, same as `golive.sh`:

```powershell
& "C:\Program Files\Git\bin\bash.exe" scripts/deploy-admin.sh
```

On macOS/Linux, plain `bash scripts/deploy-admin.sh` is fine.

This builds `admin/` and deploys it to **https://soma-admin-ce547.web.app**.
Re-run this script any time you change files under `admin/` — it does not
touch the student app's hosting.

## 3. Create your first admin login (once)

The admin panel has no signup form — every login is checked against a
Firestore `admin_users/{uid}` document, so the first one must be created by
hand in the Firebase Console:

1. **Authentication → Users → Add user** — create yourself an email +
   password account (this is a normal Firebase Auth user, separate from
   student accounts).
2. Copy that user's **UID**.
3. **Firestore Database → Start collection → `admin_users`** — create a
   document whose **document ID is that UID**, with these fields:

   | Field | Type | Value |
   |---|---|---|
   | `email` | string | your email |
   | `displayName` | string | your name |
   | `role` | string | `super_admin` |
   | `isActive` | boolean | `true` |
   | `createdAt` | timestamp | now |

4. Go to `https://soma-admin-ce547.web.app/login` and sign in with that email/password.

Once you're in, **Settings → Admin Users** lets you create additional admin
accounts (content editors, viewers) without touching Firestore directly.

## Roles

- `super_admin` — everything, including Subscriptions, Notifications,
  Settings, and granting/revoking student premium.
- `content_editor` — Curriculum and Questions only.
- `viewer` — read-only Students and Analytics.
