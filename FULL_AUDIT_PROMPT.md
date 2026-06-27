# Soma AI — Full-Stack Audit Prompt (Screens → Stores → Services → Firestore)

> Paste this to Claude Code (or any capable agent) to run an end-to-end audit of the
> Soma AI student app: every screen, route, store, service, the Firestore pipeline,
> gamification + XP/gold rubric, AI explanations, payments, and all error/failure
> surfaces. **Diagnosis only — produce a prioritized findings report; do NOT fix
> anything until the findings are reviewed and greenlit.**

---

## 0. Ground truth (already verified — build on these, don't re-derive)

**Firebase project:** `tanzania-81c27` (Blaze NOT enabled → Cloud Functions NOT deployed)
**Branch:** `claude/soma-ai-phase-1-92hcK`
**Stack:** React Native Expo SDK 56, TypeScript, NativeWind, Zustand, Firebase Web SDK v10.

**Reading Firestore data:** Firebase CLI is NOT authenticated in this environment and
the project is not on Blaze. If you need to read live data, do it through a small
script using the Web SDK config in `.env` (`EXPO_PUBLIC_FIREBASE_*`). To read
collections that strict rules block, temporarily prepend
`match /{col}/{doc} { allow read: if true; }` inside the
`/databases/{database}/documents {` block — but you can only deploy rules if a
`FIREBASE_TOKEN` is provided. If you cannot deploy, audit statically against the
schema facts below instead of reading live. **If you DO open rules, you MUST restore
the strict rules (`firestore.rules`) and delete any backup file before finishing.**

### App surface (verified count)
- **37 screen files** across 15 folders in `src/screens/**`:
  `auth(3)` `onboarding(3)` `home(1)` `subjects(1)` `topics(1)` `curriculum(1 modal)`
  `learningPack(2)` `quiz(5)` `explanation(4)` `gamification(7)` `leaderboard(1)`
  `analytics(1)` `profile(1)` `settings(1)` `subscription(5)`.
- **24 services** in `src/services/`, **13 Zustand stores** in `src/store/`.
- **3 navigators:** `RootNavigator` (auth gate) → `AuthNavigator` + `AppNavigator` (5 tabs).

### Firestore data inventory (verified 2026-06-27)
| Collection | Count | Detail |
|---|---|---|
| `forms` | 4 | form_1…form_4 |
| `subjects` | 52 | 13 subjects × 4 forms, ids `form_{n}_{subject}` |
| `topics` | ~174 | Form-1 math/english/kiswahili = real content; rest = shells |
| `learning_packs` | 120 | only Form-1 math/english/kiswahili populated (5 packs/topic) |
| `questions` | 912 | math 342, english 342, kiswahili 228 — Form-1 only |

### Schema facts (do NOT re-verify — these are confirmed)
- Subject id = `form_{n}_{subject}`; topic id = `{subjectId}_topic_{order}`;
  pack id = `{topicId}_pack_{order}`.
- Question→pack link = **`learningPackId`** (NOT `packId`).
- Pack→type = **`type`** (`mcq|tf|fib|summary|hoq`), NOT `quizType`.
- Question `type` field is present ONLY on `hoq` docs; mcq/fib/tf infer type from pack.
- MCQ `options` = `[{id, text, isCorrect}]`; `correctAnswer` = option id (`"a".."d"`).
- FIB/TF `options` = `[]`; `correctAnswer` = literal answer string.
- Questions have `explanation`; there is **NO `examTip`** field.
- Pack `xpReward` (fixed 2026-06-26): summary=10, mcq=15, fib=10, tf=10, hoq=30.
- Curriculum reads filter on `isActive == true`. **Open question to verify:** do the
  912 existing `questions` docs actually carry `isActive: true`? If not, every quiz
  silently falls back to local seed data.
- Indexes were just corrected in `firestore.indexes.json` (curriculum indexes used to
  reference stale `packId`/`displayOrder`). Verify the deployed indexes match the file.

### KNOWN rubric conflict (high-priority — confirm scope and pick a winner)
There are **three competing XP/coin rubrics**. Map exactly which screens/services read
which, and report the user-visible inconsistency:
1. `src/constants/index.ts` — `XP_PER_LEVEL=500`, `XP_PER_CORRECT_ANSWER=10`,
   `XP_PER_PACK_COMPLETION=50`, `STREAK_BONUS_XP=25`.
2. `src/types/gamification.ts` — `XP_REWARDS` (mcq 10, fib 12, tf 8, quiz_complete 25,
   pack_complete 100, daily_mission 50, streak_bonus 20, streak_milestone 20,
   review_explanation 5), `COIN_REWARDS`, `STREAK_MILESTONES`, and a `LEVEL_THRESHOLDS`
   curve (NOT a flat 500/level).
3. Per-pack `xpReward` stored in Firestore (summary 10 / mcq 15 / fib 10 / tf 10 / hoq 30).

These disagree on per-question XP (10 vs 10/12/8), pack XP (50 vs 100 vs pack.xpReward),
and leveling (flat 500 vs `LEVEL_THRESHOLDS` + `getLevelFromXp`). Determine the actual
award path at runtime and what the user sees on `QuizResultScreen` /
`PackCompletionScreen` / `GamificationProfileScreen`.

---

## Your task — run these passes, report findings (no fixes)

### PASS 1 — Field-name & doc-id contract (App reads ⇄ DB writes)
For every Firestore read/write in `src/services/*.ts`, confirm field names and id
patterns match the DB. Specifically report any mismatch on:
1. Questions queried by `learningPackId` vs wrong `packId` (grep both).
2. Pack-type filter uses `type` vs non-existent `quizType`.
3. MCQ rendering reads `option.text`/`option.isCorrect`, vs assuming `options` is
   `string[]` (would render `[object Object]`). Check every quiz screen.
4. Any consumer expecting `examTip`, `whyWrong`, `stepByStep`, or other fields absent
   from question docs — list each and whether it crashes or shows blank.
5. Subject/topic/form id construction across the app builds `form_{n}_{subject}`
   consistently. **Flag the onboarding mismatch:** `SubjectSelectionScreen` /
   `constants/subjects.ts` use bare ids (`mathematics`) vs DB `form_1_mathematics`.

### PASS 2 — Composite-index coverage
Cross-check EVERY compound query (any `where`+`orderBy`, or 2+ `where` on different
fields) in `src/services/*.ts` against `firestore.indexes.json`. For each: the query,
the index it needs, whether that index exists, and whether it's actually deployed.
Flag missing ones — they are guaranteed runtime failures (caught silently → seed
fallback, so the app "works" while showing stale local data).

### PASS 3 — Route-graph integrity
1. Build the full route map from `RootNavigator`, `AuthNavigator`, `AppNavigator`
   (all 5 tab stacks, modals like `FormSelectorModal`).
2. Cross-reference against the 37 screen files. Report:
   - **Orphan screens** — files not registered in any navigator.
   - **Dead routes** — `navigate('X')` / `.push` / `.replace` where `X` isn't registered.
   - **Param mismatches** — screens reading `route.params.foo` the caller never passes.
3. Confirm screens registered in multiple stacks (Home vs Subjects deep stacks) are
   intentional shared stacks, not accidents.

### PASS 4 — Auth & onboarding flow
Trace cold start → authenticated home:
1. `SplashScreen` → how `authStore.isAuthenticated` is set; is the session restored
   from persisted storage / `onAuthStateChanged`?
2. OTP flow (`phoneAuthService.ts`): with `EXPO_PUBLIC_DEMO_MODE=true` /
   `DEMO_OTP=123456`, does login work end-to-end with NO live Cloud Function?
3. `CreateProfileScreen` writes `users/{uid}` — do its fields satisfy the
   `firestore.rules` create constraint (must include `phoneNumber`, `displayName`,
   `createdAt`, `subscriptionStatus=='free'`, `role=='student'`)? Any extra/missing
   field = silent write rejection.
4. `SubjectSelectionScreen` — what does it read, and where is the selection persisted?

### PASS 5 — Gamification & gold/XP rubric (deep)
1. Resolve the 3-way rubric conflict above. Produce ONE table: action → XP awarded →
   coins awarded → source-of-truth file → screen that displays it. Flag every
   disagreement a user would notice.
2. `gamificationService.applyXP` / level logic: does it use flat `XP_PER_LEVEL=500` or
   `LEVEL_THRESHOLDS` + `getLevelFromXp`? Confirm a single consistent level curve.
3. Streak logic (`lastStudyDate`, `currentStreak`, `STREAK_MILESTONES`): check the
   day-boundary math (`todayStr()` uses local `new Date().toISOString()` — verify
   timezone correctness for Tanzania/EAT users; off-by-one resets streaks unfairly).
4. Coins/rewards (`RewardsScreen`, `RewardBox`, `COIN_REWARDS`): trace where coins are
   earned vs spent; flag any reward a user can claim that's never persisted.
5. Badges (`SEED_BADGES`, `BadgeId`, `BadgesScreen`/`AchievementsScreen`): are badge
   award conditions actually evaluated anywhere, or are badges display-only?
6. Daily missions (`missionService`, `missionStore`, `DailyMissionsScreen`): do mission
   progress writes match the `daily_missions/{id}/progress/{userId}` rules path?
7. Leaderboard (`leaderboardService`, weekly/monthly screens): is `leaderboard/{userId}`
   actually written on XP gain? Confirm `weeklyXp`/`monthlyXp` reset semantics and that
   the `period + xp` index exists. Flag if leaderboard is still `DEMO_LEADERBOARD`.
8. Persistence: confirm gamification mutations write to Firestore (not store-only) and
   survive reinstall.

### PASS 6 — AI explanations pipeline
Map the chain: `explanationStore` → `explanationService`/`aiExplanationService` →
`aiProviderService`/`geminiService` (+ `promptTemplateService`) → Cloud Function /
direct Gemini → `ai_explanations` collection. Report:
1. With Cloud Functions NOT deployed and `EXPO_PUBLIC_FUNCTIONS_BASE_URL` blank +
   `EXPO_PUBLIC_GEMINI_API_KEY` blank, what does `ExplanationScreen` /
   `WrongAnswerReviewScreen` / `LearningPackReviewScreen` show — crash, infinite
   spinner, or graceful "unavailable"?
2. The response type: `whyWrong` is `Record<string,string>` (per-option), `stepByStep`
   etc. Confirm every consumer renders the object shape, not a string (regression risk).
3. `ai_explanations` rules require premium to read AND `userId == auth.uid` to create.
   Trace whether a free user triggering an explanation hits permission-denied, and
   whether that's surfaced or swallowed.
4. Rate limiting (the per-day cap in the explanation Cloud Function): confirm the
   client handles `resource-exhausted` with a user message.
5. `ExplanationFeedbackScreen` → `ai_feedback`: does the written doc satisfy the rules
   (`userId == auth.uid`, `rating in [1..5]`)?

### PASS 7 — Quiz engine & progress pipeline
1. `quizService`/`quizEngineService`: trace a full MCQ pack run — fetch questions →
   answer → score → award XP/coins → write progress. Where does each write go
   (`quiz_progress/{userId}/sessions/{sessionId}`, `gamification`, `leaderboard`)?
2. Scoring correctness: MCQ compares `correctAnswer` (option id) to selected option id;
   FIB/TF compare to literal string. Flag any case-sensitivity / trimming bug in FIB.
3. `QuizResultScreen` / `PackCompletionScreen`: confirm displayed XP matches what was
   actually persisted (ties back to PASS 5 rubric).
4. Fallback behavior: when DB questions are empty/blocked, does it use
   `getSeedQuestionsByPack` silently? Note where the user can't tell DB vs seed.

### PASS 8 — Payments & subscription gating
1. `tanzaniaPaymentService` → `initiateAzampayPayment` Cloud Function (NOT deployed):
   does `PaymentMethodScreen` show a user-visible error or throw uncaught?
2. `featureAccessService` / `subscriptionService` / `usageService`: trace how premium
   gating decides lock state. Confirm `LockedFeaturePreviewScreen` is reachable and
   that gating reads `users.subscriptionStatus` (which rules forbid the user to self-
   edit — confirm only admin/Cloud Function flips it).
3. `revenueCatService`: is it wired or stubbed? Flag dead config.
4. `payment_requests` create rules require `amount in [5000, 8000]` and a provider
   allowlist — confirm the app only ever writes those amounts/providers (mismatch =
   silent write rejection). Note the plan inventory says termly=12000 — flag the
   `5000/8000` vs `5000/12000` discrepancy.

### PASS 9 — Error handling & failure surfaces
1. Firestore reads under STRICT rules: list any screen reading a collection a normal
   signed-in student is denied (another user's doc, `ai_explanations` without premium,
   admin collections). Each = permission-denied.
2. Offline path (`offlineService` queue + `persistentLocalCache`): confirm no startup
   crash and that the write queue actually flushes on reconnect.
3. Grep for unguarded `.data()!`, `[0]` access on possibly-empty snapshots, missing
   `try/catch` around `await` in services, and unhandled promise rejections.
4. `crashReportingService`: confirm graceful no-op when native modules absent (Expo Go).
5. Any `EXPO_PUBLIC_` env var holding a secret (these ship in the bundle in plaintext).

### PASS 10 — Store ⇄ service wiring & cleanup
For each of the 13 stores, confirm it calls a service method that exists and returns
the expected shape. Flag stores referencing removed/renamed service functions, dead
imports, and any store holding state that's never persisted but assumed durable.

---

## Output format
One section per pass. For each finding:
- **Severity:** 🔴 crash · 🟠 silent failure / wrong data shown · 🟡 cleanup
- **File:line**
- **What breaks** (concrete user action → observed failure)
- **Fix** (one line)

End with a single **prioritized fix list** (crashes first, then silent-failure, then
cleanup). Within the report, explicitly answer:
- Which XP/gold rubric is authoritative, and what's inconsistent today?
- Do the 912 questions have `isActive: true`? (If unverifiable live, say so and mark
  it as the #1 thing to confirm before launch.)
- Are the corrected indexes actually deployed, or only in the repo file?

## Guardrails
- Quiz/question **content** is out of scope — audit plumbing, not pedagogy.
- Do NOT fix anything in this pass — diagnosis only.
- If you open Firestore rules to read data, restore strict rules + delete any backup
  before finishing. Deploy nothing except the temporary/restore rules cycle.
- Commit any helper scripts you write to `scripts/`.
