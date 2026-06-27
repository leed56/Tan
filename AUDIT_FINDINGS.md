# Soma AI — Full-Stack Audit Findings

> Diagnosis run per `FULL_AUDIT_PROMPT.md` across all 10 passes (screens → stores →
> services → Firestore), branch `claude/soma-ai-phase-1-92hcK`, 2026-06-27.
> **No fixes applied — this is the diagnosis report.** Severity: 🔴 crash/security ·
> 🟠 silent failure / wrong data · 🟡 cleanup.

## TL;DR — the one structural truth

Almost every write the app makes is **swallowed by `try/catch {}`** because the
client `COLLECTIONS` names and write shapes do **not** match `firestore.rules`, and
the gamification/progress/subscription mutations are **store-only and never call their
persisting service functions**. The app *looks* like it works because every failure
falls back to in-memory demo data. In reality: **nothing the user does survives an app
restart**, the leaderboard is permanently 8 fake students, payments are simulated, and
auth/profile are entirely faked (`demo_user_001`). This is a Phase-1 prototype wired
to demo fallbacks, not yet a persistent app.

The single highest-leverage fix is to **make one source of truth for collection names
that matches the rules, and route quiz/profile/subscription mutations through the
already-written `awardXP`/`persistProfile`/Cloud-Function paths.**

---

## 🔴 P0 — Crashes & security (fix first)

| # | Finding | File | Fix |
|---|---|---|---|
| 1 | **Secrets shipped in the app bundle.** `.env` sets real `EXPO_PUBLIC_GEMINI_API_KEY`, `EXPO_PUBLIC_SELCOM_API_KEY/SECRET/VENDOR_ID`, `EXPO_PUBLIC_AZAMPAY_CLIENT_ID/SECRET`, `EXPO_PUBLIC_SENTRY_DSN`. Anything `EXPO_PUBLIC_*` is inlined into the JS bundle in plaintext — extractable from a shipped APK. `.env.example` itself warns Azampay must stay server-side. | `.env` | Remove all secret `EXPO_PUBLIC_*` vars; proxy Gemini/Selcom/Azampay through Cloud Functions with server-side secrets. |
| 2 | **Latent crash — leaderboard.** `get().data[tab].length` is unguarded; a partial rehydrate or new tab key makes `data[tab]` undefined → "Cannot read property 'length' of undefined". | `src/store/leaderboardStore.ts:24` | `if ((get().data[tab]?.length ?? 0) > 0) return;` |
| 3 | **Latent crash — usage limits.** `${type}Used` is cast to only mcq/fib/tf, but `summary`/`hoq` are valid quiz types → `undefined + 1 = NaN` and `FREE_DAILY_LIMITS[type]` undefined. | `src/store/usageStore.ts:57,66` | Add summary/hoq to `FREE_DAILY_LIMITS` and broaden the type. |
| 4 | **Every mobile-money payment write is rejected.** App writes provider strings `google_play`, `airtel`, `tigo`, `ttcl`, `whatsapp`; rules allowlist is `mpesa/tigopesa/airtelmoney/halopesa/azampay/selcom/bank_transfer`. `addDoc` throws, is swallowed, returns a fake `local_…` id. (Amounts 5000/8000 are fine.) | `PaymentMethodScreen.tsx:28-36`, `subscriptionService.ts:97-131` | Align provider enum strings with the rules allowlist. |
| 5 | **Explanation feedback can never be saved (2 rule violations).** Writes to collection `explanation_feedback` (rules only define `ai_feedback` → default-deny) AND writes `rating: 'helpful'|'confusing'|'wrong'` where the rule requires `rating in [1..5]`. Swallowed; screen still says "Thank you!". | `firebaseConfig.ts:85`, `explanationService.ts:193-207`, `firestore.rules:127-133` | Rename collection to `ai_feedback`, map rating to 1–5 int. |

---

## 🟠 P1 — Silent failures (data never persists / wrong data shown)

### Auth, profile & session (highest user impact)
| # | Finding | File | Fix |
|---|---|---|---|
| 6 | **No session persistence, no `onAuthStateChanged`.** `authStore` has no persist middleware; App.tsx only hides splash (restore is `// TODO: Phase 2`). Splash unconditionally `replace('Welcome')`. Every cold start = logged out and full OTP/profile flow again. | `authStore.ts:16-31`, `App.tsx:14-23`, `SplashScreen.tsx:31` | Wrap `authStore` in `persist`; add `onAuthStateChanged` in App.tsx before hiding splash. |
| 7 | **OTP is fully faked; real `phoneAuthService` is dead code.** `OTPVerifyScreen` compares to hardcoded `DEMO_OTP='123456'` then `useAuth().verifyOtp` ignores the code, waits 1s, sets fixed `demo_user_001`. No `signInWithPhoneNumber`, no real uid/token. No `EXPO_PUBLIC_DEMO_MODE` gate — demo is always on. | `useAuth.ts:41-52`, `OTPVerifyScreen.tsx:72-82` | Wire screens to `phoneAuthService.sendOtp/verifyOtp` behind a real `DEMO_MODE` flag. |
| 8 | **User profile is never written to Firestore, and its shape would fail the rule.** `CreateProfileScreen` only sets the in-memory store (`// TODO: persist`). No `setDoc(users/{uid})` exists anywhere. If wired as-is it writes `{uid,name,form,school,avatarId,selectedSubjectIds,createdAt}` — the `users` create rule rejects it: missing `phoneNumber`, uses `name` not `displayName`, missing `subscriptionStatus=='free'`, missing `role=='student'`. | `CreateProfileScreen.tsx:37-54`, `firestore.rules:47-51` | Write `users/{uid}` with `{phoneNumber, displayName, createdAt, subscriptionStatus:'free', role:'student', …}`. |

### Gamification — entire persistence layer is dead code
| # | Finding | File | Fix |
|---|---|---|---|
| 9 | **XP/coins/level never persist.** All screens call store-only `addXp`/`addCoins`; the persisting `awardXP`/`awardCoins`/`persistProfile`/`saveGamificationProfile` have **zero callers**. `gamification/{uid}` is written once empty, never again. Store also seeds fake `xp:1240, streak:5, coins:120` for new users. | `gamificationStore.ts:76-100,121-135` | Route quiz/pack XP through `awardXP`/`persistProfile(uid)`. |
| 10 | **Pack XP double-counted.** Per-question `addXp` already ran in the quiz screens; `PackCompletionScreen` calls `addXp(xpEarned)` again (+ hardcoded `addCoins(20)`). Total XP jumps 2× when this screen shows. | `PackCompletionScreen.tsx:30-31` | Remove the second `addXp`; award once. |
| 11 | **Two conflicting level curves.** `XPProgressBar` uses flat `XP_PER_LEVEL=500`; everything else uses `LEVEL_THRESHOLDS`. Same XP shows different level/% on different screens. | `XPProgressBar.tsx:5,18,36` | Use `getLevelProgress(xp)` from `xpUtils`; delete `XP_PER_LEVEL`. |
| 12 | **Streak never updates + UTC bug.** `checkStreak`/`incrementStreak` have no callers (seeded `5` never changes; streak badges/milestones unreachable). `todayStr` uses `new Date().toISOString()` (UTC) — for EAT (UTC+3) users studying 00:00–03:00, the day is wrong → streaks/missions reset off-by-one. | `gamificationStore.ts:102-105`, `gamificationService.ts:12-13,99-100`, `missionService.ts:10-12` | Call `checkStreak(uid)` per session; compute `todayStr` from local date or +3h EAT. |
| 13 | **Leaderboard is permanently demo.** Service uses collection `leaderboard_scores` (rules only define `leaderboard` → denied); `updateLeaderboardScore` is never called; `getLeaderboard` always catches → returns `DEMO_LEADERBOARD` (8 fake students). Also overwrites instead of `increment()`, no weekly/monthly reset. | `leaderboardService.ts:48,79`, `firestore.rules:81` | Point at `leaderboard/{userId}`, call on XP gain with `increment()`, add reset logic. |
| 14 | **Daily missions never advance + wrong path.** `updateProgress` has no caller (stuck 0/3 forever). Service writes top-level `daily_missions/{id}` (super-admin-only) but rules allow user writes only at subcollection `daily_missions/{id}/progress/{uid}` → all writes denied/swallowed. | `missionStore.ts:32`, `missionService.ts:31-91`, `firestore.rules:215-218` | Write to the `/progress/{uid}` subcollection; call `updateProgress` from quiz handlers. |
| 15 | **Badges are display-only.** `checkBadges`/`saveUserBadges` never called; 4 of 10 `SEED_BADGES` (`science_explorer`, `fast_learner`, `comeback`, `form1_champion`) have no award logic; everyone seeded with `['first_quiz','streak_3']`. Writes target `user_badges` (rules define `gamification/{uid}/badges`). | `gamificationStore.ts:146-157`, `gamificationService.ts:135-179` | Call `checkBadges`+`saveUserBadges` after quizzes; implement/remove the 4 dead badges; fix collection. |

### Pipeline / data-shape mismatches
| # | Finding | File | Fix |
|---|---|---|---|
| 16 | **Pack XP field mismatch.** App reads `pack.completionXP`; Firestore packs store `xpReward`. DB-loaded packs → `completionXP` undefined → PackCompletion shows 0/undefined XP. Only local seed (which sets `completionXP`) renders right, masking it. | `curriculum.ts:65`, `LearningPackDetailScreen.tsx:90,114` | Map `xpReward`→`completionXP` on deserialize, or unify the field name. |
| 17 | **TF scoring assumes `'true'/'false'` literals.** DB stores TF `correctAnswer` as a literal string; any capitalization or Kiswahili (`Kweli`) scores every TF wrong and highlights the wrong button. Works today only because seed uses `'true'/'false'`. | `TFScreen.tsx:51,121,161` | Normalize both sides (case-insensitive / map button→stored literal). |
| 18 | **Onboarding subject ids are bare, not form-scoped.** `SubjectSelectionScreen`/`constants/subjects.ts` use `mathematics`; DB uses `form_1_mathematics`. Selection also stored in-memory only (no Firestore, no persist) → lost on restart and never matches DB. | `SubjectSelectionScreen.tsx:25-47`, `constants/subjects.ts:6-150` | Map to `form_{form}_{subject}` and persist to `users/{uid}`. |
| 19 | **Quiz seed fallback is invisible AND keyed to wrong forms.** `getQuestionsByLearningPack` falls back to seed on empty OR error with no signal. DB content is **Form-1**, but `seedQuestions` is keyed to **Form-2** pack ids → if a Form-1 query returns empty/blocked, fallback returns `[]` and the quiz screen **hangs on LoadingState forever**. Directly tied to the open `isActive` question below. | `quizService.ts:34-50`, `seedQuestions.ts:1-40` | Confirm `isActive:true` on the 912 docs; add empty-state handling; fix seed ids. |
| 20 | **AI explanation cache never persists.** `saveExplanation` writes no `userId` field (create rule requires `userId==auth.uid` + premium) → always rejected/swallowed; reads need premium+owner → free users always denied. Every view regenerates. | `explanationService.ts:128-156`, `firestore.rules:119-124` | Add `userId`; gate on the real premium source; or use a shared cache collection. |
| 21 | **AI rate-limit (429/`resource-exhausted`) not surfaced.** Treated as a generic error → silently falls back to plain explanation; user never sees "daily limit reached". | `geminiService.ts:41-43,96-99`, `explanationService.ts:171-190` | Detect `resource-exhausted`, show a user-facing message. |

### Subscription / payments / persistence subsystems
| # | Finding | File | Fix |
|---|---|---|---|
| 22 | **Premium gating reads the wrong source.** App decides premium from local `subscriptions/{uid}` doc / in-memory demo flag; rules' `isPremium()` keys off `users.subscriptionStatus=='active'` (which the app never sets and the user is rightly forbidden to self-edit). The two never agree → "premium" users still denied `ai_explanations`. | `subscriptionStore.ts:35`, `subscriptionService.ts:60-81` | One source of truth: an activation Function sets `users.subscriptionStatus`; gate app + rules on it. |
| 23 | **`activateSubscription` client write is admin-only → denied.** `setDoc(subscriptions/{uid})` rejected by rules (create/update `if isAdmin()`), swallowed → premium reverts to free on next launch; only the in-memory demo flag makes it "stick". | `subscriptionService.ts:135-159` | Move activation to an admin Cloud Function / payment webhook. |
| 24 | **Many collections denied by the catch-all `if false`** (names don't match rules): `daily_usage`, `student_progress`, `quiz_attempts`, `quiz_answers`, `family_profiles`. All reads return empty, writes vanish — cross-device/reinstall = total data loss. | `usageService.ts`, `progressService.ts`, `quizService.ts`, `subscriptionService.ts:167,201` | Make `COLLECTIONS` names match rule paths (or add the rule blocks). |
| 25 | **Offline / crash-reporting / RevenueCat subsystems never initialize.** `initOfflineSupport`, `addConnectivityListener`, `enqueueWrite`, `initCrashReporting`, `initRevenueCat` have **zero callers**. Offline queue never flushes; Crashlytics never starts; RevenueCat fully dead. | `offlineService.ts:91-107`, `crashReportingService.ts`, `revenueCatService.ts` | Call inits at app entry; route offline writes through `enqueueWrite`; wire or delete RevenueCat. |
| 26 | **Store durability gap (pervasive).** None of theme/gamification/profile/progress/subscription/usage stores use `persist`; all reset on restart. | `appThemeStore`, `gamificationStore`, `profileStore`, `progressStore`, `subscriptionStore`, `usageStore` | Add `persist` middleware and/or Firestore write-back. |

### Missing composite indexes (guaranteed query failures → silent seed/demo fallback)
| # | Query | Needed index | In file? |
|---|---|---|---|
| 27 | School leaderboard `where schoolId + orderBy weeklyXp/monthlyXp/totalXp` | `leaderboard_scores(schoolId, <sortField> DESC)` ×3 | 🔴 No (stale `leaderboard` period+xp index doesn't match) |
| 28 | `getSubjectProgress` `where userId + where subjectId` | `student_progress(userId, subjectId)` | 🟠 No |
| 29 | Missions `where userId + where date` | `daily_missions(userId, date)` | 🟠 No (only `date+type` exists) |

*Curriculum + questions indexes (subjects/topics/learning_packs/questions) are now correct in `firestore.indexes.json` — but deployment is unverifiable from this environment.*

---

## 🟡 P2 — Cleanup

- `PaymentMethodScreen` fakes "subscription now active"; `initiateAzampayMnoPayment` / `initiateSelcomPayment` are dead code → no real money moves. (`tanzaniaPaymentService.ts:121-133`)
- Dead route: `PaymentMethodScreen` → `navigate('SubscriptionStatus')`, which exists only in ProfileStack, not the Home/Subjects stacks it lives in → no-op, user stranded. (`PaymentMethodScreen.tsx:76`)
- `aiExplanationService.ts` and `quizEngineService.ts` are abandoned Phase-2 stubs that only `throw` — imported by nothing. Delete.
- `quizStore.sessionResults()` is a **selector with a side effect** (`completeQuizAttempt` fires on every call); the `// TODO: award XP` is unimplemented. Move to an explicit `finishSession()` action.
- `missionStore` claim only stamps `claimedAt` — never awards the XP/coins.
- FIB `normalise` strips *all* non-alphanumerics → `"3.14"=="314"`, `"a b"=="ab"`. Loosen to whitespace+case if numeric/punctuated answers exist.
- HomeScreen navigates with hardcoded demo ids `pack_001`/`topic_001` (don't exist in DB) and omits `formId`/`subjectId`. (`HomeScreen.tsx:152`)
- Reward boxes (`RewardsScreen`) grant coins/XP in-memory only; no daily refresh, no spend path (coin shop "coming soon") → coins are a dead-end currency.
- Two parallel leaderboard UIs (`LeaderboardScreen` tab vs gamification `Weekly/MonthlyLeaderboardScreen`) — consolidate.
- Plan catalog: no `termly`/12000 plan exists in `seedPlans.ts` (only single=5000, family=8000); rules cap amounts at `[5000,8000]`. Reconcile if a 12000 plan ships.
- `firestore.rules` topics write rule validates `request.resource.data.title` but topic docs use `name` → content editors can't create/update topics.

---

## Direct answers to the audit's open questions

1. **Which XP/gold rubric is authoritative?** None cleanly. At runtime: per-question XP
   comes from **Firestore `xpReward`** (mcq 15 / fib 10 / tf 10), leveling from
   **`LEVEL_THRESHOLDS`** (except the stray `XPProgressBar`). `constants/index.ts`
   (rubric #1) and `types/gamification.ts:XP_REWARDS` per-question values are **dead
   code**. Recommend: declare **Firestore `xpReward` + `LEVEL_THRESHOLDS`**
   authoritative, delete the other two, and fix the double-count (#10) + curve (#11).
2. **Do the 912 questions have `isActive: true`?** **Unverifiable in this environment**
   (Firebase CLI unauthenticated, non-Blaze). This is the **#1 thing to confirm before
   launch** — if they lack it, every Form-1 quiz returns empty, the Form-2-keyed seed
   doesn't match, and the quiz screen hangs (#19).
3. **Are the corrected indexes actually deployed?** Unverifiable from the repo alone.
   The corrected `firestore.indexes.json` is committed, but deployment status must be
   checked live (plus the 3 still-missing indexes #27–29).

---

## Recommended fix order

1. **P0 security/crashes** (#1–5) — secrets out of bundle, two latent store crashes,
   payment-provider enum, feedback collection/rating.
2. **Collection-name + rules reconciliation** (#24, #13, #14, #5, #20, #15) — one
   source of truth for `COLLECTIONS` matching `firestore.rules`. This unblocks most
   silent failures at once.
3. **Persistence wiring** (#9, #6, #8, #26) — route mutations through the existing
   `awardXP`/`persistProfile`/`setDoc(users)` paths; add `persist` + `onAuthStateChanged`.
4. **Data-shape fixes** (#16, #17, #18, #19) + **missing indexes** (#27–29).
5. **Subscription/auth productionization** (#7, #22, #23, #25) — real OTP, admin-Function
   activation, init the offline/crash/IAP subsystems.
6. **P2 cleanup.**

**Confirm before any launch:** `questions.isActive` (#2 above) and index deployment (#3 above).
