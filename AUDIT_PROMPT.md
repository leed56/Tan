# Soma AI — App ↔ DB Pipeline & App-Flow Audit Prompt

> Paste this prompt to Claude Code (or any agent) to run a full structural audit
> of the Soma AI student app against its Firestore backend. **Quizzes/content are
> out of scope — they will be updated later. Focus on plumbing, flow, routes, and errors.**

---

## Context the agent already has

**Firebase project:** `tanzania-81c27` (Blaze not enabled — Cloud Functions NOT deployed yet)
**Branch:** `claude/soma-ai-phase-1-92hcK`
**Firestore CLI auth:** use `FIREBASE_TOKEN` (CI token from session). To read data,
temporarily prepend `match /{col}/{doc} { allow read: if true; }` inside the
`/databases/{database}/documents {` block, deploy `--only firestore:rules`, run the
read, then **always restore the strict rules and redeploy**.

### Current DB inventory (verified 2026-06-26)
| Collection | Count | Detail |
|---|---|---|
| `subjects` | **3** | `form_1_mathematics` ("Basic Mathematics"), `form_1_english` ("English Language"), `form_1_kiswahili` ("Kiswahili") — all `formId=form_1` |
| `forms` | **4** | form_1…form_4 (only form_1 has content) |
| `topics` | **24** | math 9, english 9, kiswahili 6 |
| `learning_packs` | **120** | math 45, english 45, kiswahili 30 (5 packs/topic: mcq/tf/fib/summary/hoq) |
| `questions` | **912** | math 342, english 342, kiswahili 228 |
| `subscription_plans` | **3** | free (0), monthly (5000 TZS), termly (12000 TZS) |

### Known schema facts (do NOT re-verify, build on these)
- Subject doc id pattern: `form_{n}_{subject}`; fields: `name`, `formId`, `order`.
- Question→pack link field is **`learningPackId`** (NOT `packId`).
- Pack→type field is **`type`** (`mcq|tf|fib|summary|hoq`), NOT `quizType`.
- Questions: `type` field is ONLY present on `hoq` docs; mcq/fib/tf docs have NO `type` field (app infers from pack).
- MCQ `options` = array of `{id, text, isCorrect}`; `correctAnswer` = option id ("a".."d").
- FIB/TF `options` = `[]`; `correctAnswer` = the literal answer string.
- Questions have `explanation` but **NO `examTip`** field.
- Pack `xpReward`: summary=10, mcq=15, fib=10, tf=10, hoq=30 (fixed 2026-06-26).

### App structure (verified)
- **37 screens**, 24 services in `src/services`, 13 Zustand stores in `src/store`.
- Navigation: `RootNavigator` (auth gate) → `AuthNavigator` (Splash→Welcome→OTPLogin→OTPVerify→CreateProfile→SubjectSelection) and `AppNavigator` (5 tabs: Home/Subjects/Leaderboard/Analytics/Profile, each a stack).
- Key pipeline service: `curriculumService.ts` (subjects/topics/packs), `quizService.ts`/`quizEngineService.ts` (questions), `progressService.ts`, `gamificationService.ts`.

---

## Your task — run these audit passes and report findings

### PASS 1 — Field-name contract (App reads ⇄ DB writes)
For every Firestore read in `src/services/*.ts`, confirm the field names and doc-id
patterns the code expects match what's actually in the DB (table above).
**Specifically verify and report any mismatch on:**
1. Does the code query questions by `learningPackId` or the wrong `packId`? (grep both)
2. Does pack-type filtering use `type` or a non-existent `quizType`?
3. Does MCQ rendering read `option.text` / `option.isCorrect`, or does it assume `options` is a `string[]` (would render `[object Object]`)?
4. Does any screen/service expect `examTip`, `whyWrong`, `stepByStep`, or other fields that don't exist on question docs? List each consumer and whether it crashes or silently shows blank.
5. Subject/topic/form id construction — does the app build `form_{n}_{subject}` ids the same way the data is stored?

### PASS 2 — Composite-index coverage
The app failed at runtime on a `where('learningPackId','==',…) + orderBy('order')`
query (missing index). Cross-check **every** compound query in `src/services/*.ts`
(any `where` + `orderBy`, or 2+ `where` on different fields) against
`firestore.indexes.json`. List each query, the index it needs, and whether that
index exists. Flag missing ones — these are guaranteed runtime crashes.

### PASS 3 — Route graph integrity
1. Build the full route map: every screen registered in `RootNavigator`,
   `AuthNavigator`, `AppNavigator` (HomeStack, SubjectsStack, ProfileStack, tabs, modals).
2. Cross-reference against the 37 screen files in `src/screens/**`. Report:
   - **Orphan screens**: files that exist but are not registered in any navigator.
   - **Dead routes**: `navigation.navigate('X')` calls where `X` is not a registered route name (grep all `navigate(` / `.push(` / `replace(` calls).
   - **Param mismatches**: screens that read `route.params.foo` where the caller never passes `foo`.
3. Note duplicated screen registrations across HomeStack vs SubjectsStack — confirm that's intentional (shared deep stacks) vs an accident.

### PASS 4 — Auth & onboarding flow
Trace the path from cold start → authenticated home:
1. `SplashScreen` → how is `isAuthenticated` set in `authStore`? Does it restore session from persisted storage / Firebase `onAuthStateChanged`?
2. OTP flow: `phoneAuthService.ts` — with `EXPO_PUBLIC_DEMO_MODE=true` and `DEMO_OTP=123456`, does login work end-to-end without a live Cloud Function?
3. After OTP, does `CreateProfile` write a `users/{uid}` doc whose fields satisfy the **firestore.rules `create` constraint** (must include `phoneNumber`, `displayName`, `createdAt`, `subscriptionStatus=='free'`, `role=='student'`)? Flag any field the app writes that the rules reject — that's a silent write failure.
4. `SubjectSelection` — does it read the 3 real subjects, and where does the selection get persisted?

### PASS 5 — Error handling & failure surfaces
1. Every `geminiService` / `aiExplanationService` path: with Cloud Functions NOT deployed and `EXPO_PUBLIC_FUNCTIONS_BASE_URL` unset/localhost, what happens when a user opens `ExplanationScreen`? Does it crash, hang, or degrade gracefully?
2. Payment flow (`tanzaniaPaymentService` → `initiateAzampayPayment` Cloud Function): the function isn't deployed. Does `PaymentMethodScreen` handle the call failure with a user-visible error, or does it throw uncaught?
3. Firestore reads under strict rules: list any screen that reads a collection the **current** `firestore.rules` denies to a normal signed-in student (e.g. reading another user's doc, reading `ai_explanations` without premium). Each is a permission-denied crash.
4. Offline path: `offlineService.ts` queue + `persistentLocalCache` — confirm no startup crash and that the write queue actually flushes.
5. Grep for unguarded `.data()!`, array `[0]` access on possibly-empty snapshots, and missing `try/catch` around `await` calls in services.

### PASS 6 — Store ⇄ service wiring
For each of the 13 Zustand stores, confirm it calls a real service method that
exists and returns the expected shape. Flag stores that reference removed/renamed
service functions (the audit already found legacy `generateExplanation` /
`generateQuizHint` in `geminiService` — check who still imports them).

---

## Output format
Produce a single report with one section per pass. For each finding:
- **Severity**: 🔴 crash / 🟠 silent failure / 🟡 cleanup
- **File:line**
- **What breaks** (concrete user action → failure)
- **Fix** (one-line)

End with a **prioritized fix list** (crashes first). Do NOT fix anything yet —
this pass is diagnosis only. After I review, I'll greenlight the fixes.

## Guardrails
- Quizzes/questions content is OUT OF SCOPE — don't propose content edits.
- If you open Firestore rules for reading, you MUST restore strict rules before finishing.
- Don't deploy anything except the temporary/restore rules cycle.
- Commit any helper scripts you write to `scripts/`.
