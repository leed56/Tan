# Soma AI — Full Build-Out Master Prompt

> Synthesizes `AUDIT_FINDINGS.md` (2026-06-27 backend/persistence audit) with a fresh
> 2026-07-01 UI/completeness/responsiveness pass. Curriculum content is DONE: 408
> topic files, 51 units, 13 subjects × Forms 1–4, validated 0 errors. This document
> is the plan to take the **app** from "frontend shell over demo data" to a real,
> fully responsive, fully wired product. Branch `claude/last-updated-phj7xz`.

## TL;DR — two independent problems, both must be fixed

1. **Nothing persists.** (`AUDIT_FINDINGS.md`) Collection-name mismatches vs.
   `firestore.rules` mean every write is silently swallowed by try/catch. XP,
   streaks, badges, missions, profile, subscriptions — all reset on app restart.
   Leaderboard is 8 hardcoded fake students. Auth is fully faked (`demo_user_001`).
2. **The UI has gaps and fakery of its own**, independent of persistence:
   - 30% of authored content (`summary` + `hoq` packs) has **no quiz screen at all**
     — routes to a placeholder "coming soon" completion screen.
   - Two unreconciled leaderboard UIs, one fully hardcoded demo data.
   - Analytics screen is 100% fake data with hand-drawn `<Rect>` bars (no chart lib).
   - Dashboard/Profile show fabricated stats ("Mathematics 60%", "#42", "14") that
     don't move no matter what the real user does.
   - No responsive-scaling system — fixed-px decorative elements (XP rings, podium
     bars, avatars) will look disproportionate on a 320px phone vs a 430px
     iPhone Pro Max, though the flex/token layout underneath is sound.

Fix order matters: **wire persistence first** (Phase 0), because every gamification/
leaderboard/analytics fix in Phase 2+ is pointless if its data source still can't
survive a restart.

---

## Phase 0 — Backend persistence & security (P0/P1 from AUDIT_FINDINGS.md)

**Status: already done.** Re-verified against current `git log` — every P0/P1/P2
item below was fixed in a prior pass (commits `e235dee`…`d3df1b2`), independent of
this session. `AUDIT_FINDINGS.md` is now a stale diagnosis snapshot, not current
state. Confirmed fixed:

- [x] Secrets removed from `EXPO_PUBLIC_*` (`e235dee`).
- [x] `leaderboardStore.ts` unguarded-length crash fixed (`2d2ca2c`).
- [x] `usageStore.ts` NaN/summary+hoq limits fixed (`f9b176e`).
- [x] `payment_requests` provider allowlist aligned (`d554384`).
- [x] `ai_feedback` collection + numeric rating fixed (`3a3a340`).
- [x] Owner-scoped rules added for all app collections incl.
      `leaderboard_scores`, `student_progress`, `quiz_attempts`, `quiz_answers`,
      `daily_usage`, `user_daily_missions`, `user_badges`, `family_profiles`
      (`dee6f20`) — and `src/services/firebaseConfig.ts`'s `COLLECTIONS` constant
      already matches every one of these rule paths (verified directly).
- [x] Auth session persisted, `users/{uid}` written on profile creation,
      form-scoped subject ids (`d09c56b`); anonymous Firebase session backs
      curriculum reads (`467e0ff`, `c4fd9c0`).
- [x] XP/coins/streak persisted, level curve unified, EAT timezone fixed
      (`7807094`); leaderboard + daily missions wired on quiz completion
      (`b2900dc`).
- [x] Pack XP double-award fixed, TF scoring normalized, empty-pack state
      handled (`ca97ba9`).
- [x] Composite indexes added (`69caef3`).
- [x] AI explanation cache `userId` fixed (`36483d8`); crash/offline subsystems
      initialized in `App.tsx`, AI rate-limit surfaced (`fffaee0`).
- [x] Dead stub services deleted, dead route removed, topics rule fixed
      (`d3df1b2`).

**Genuinely still open, and gated on your "wire but keep demo mode" decision:**

- [ ] Real phone-OTP: `OTPVerifyScreen.tsx` still checks a hardcoded
      `DEMO_OTP='123456'` (`src/constants/index.ts:7`) and `useAuth.ts:20`
      returns a fixed `'demo_user_001'` uid — there is no `DEMO_MODE` flag yet,
      demo is unconditionally the only path. Build out the real
      `phoneAuthService` call path (it already exists as dead code per the
      original audit) behind an explicit `EXPO_PUBLIC_DEMO_MODE` flag that
      defaults **on**, so nothing changes for current testers until you flip it.
- [ ] Real payments: `PaymentMethodScreen`/`tanzaniaPaymentService` still
      simulate success; wire the real Selcom/Azampay call behind the same
      `DEMO_MODE` flag, server-side secrets only (never `EXPO_PUBLIC_*`).
- [ ] `revenueCatService.initRevenueCat` still has zero callers — wire it only
      if/when IAP (as opposed to direct mobile-money) ships; otherwise leave
      unused and out of scope.
- [ ] One remaining data-shape check: confirm `subscriptions/{uid}` activation
      still requires `isAdmin()` per rules (`subscriptionService.ts:135-159`
      finding #23) — client-side "activate" writes would still be silently
      denied; needs a Cloud Function/webhook, independent of DEMO_MODE.

Everything else in Phase 0 is done. Move straight to Phase 1.

---

## Phase 1 — Missing quiz screens (Summary + HOQ) ✅ done (commit `2aeb8eb`)

Currently `QuizType` (`src/types/quiz.ts:1`) is only `'mcq'|'fib'|'tf'`; summary/hoq
packs are premium-gated and dead-end at a placeholder. This is a content-completeness
bug, not just polish — 30% of the 19,584 authored items are unreachable.

- [ ] **HOQScreen**: structurally identical to MCQ (4-option a/b/c/d) — clone
      `MCQScreen.tsx` with HOQ-specific framing (harder difficulty badge, maybe a
      longer question-text layout since HOQ stems tend to be longer word problems).
      Register `HOQQuiz` route next to `MCQQuiz`/`FIBQuiz`/`TFQuiz` in
      `AppNavigator.tsx`.
- [ ] **SummaryScreen**: new UI — `options: []`, `correctAnswer` is a free-text
      model answer. Pattern: show the question, a multi-line `TextInput` for the
      student's own answer, a "Reveal model answer" action, then self-assessment
      buttons ("I got this / I need to review") that feed XP — no auto-grading
      against free text (don't attempt fuzzy string matching against prose).
- [ ] Extend `QuizType`, `CurriculumPackType` usage, `FREE_DAILY_LIMITS`/
      `DailyUsage` (already has unused `summaryUsed`/`hoqUsed` fields — wire them),
      and `LearningPackDetailScreen.tsx:75-119` `handlePackPress` to route to the
      real screens instead of `PackCompletionScreen` placeholder.
- [ ] Remove stale FIB copy in `QuizIntroScreen.tsx:149` ("Type your answer exactly
      — spelling matters") — FIB is now 4-option, not free-text.
- [ ] Unify `QuizResultScreen` (score/XP/correct-incorrect) as the single
      post-quiz results screen for MCQ/FIB/TF/HOQ; keep `PackCompletionScreen` only
      for genuine milestone/celebration moments (e.g., finishing an entire topic's
      5 packs), sourcing its `streakDays` from real streak state instead of the
      hardcoded `6`.

---

## Phase 2 — Gamification engine (make it real, not just persistent) ✅ done

Re-verified before starting: the level-curve unification and dead
`XPProgressBar` (flat 500/level) called out below were already fixed in the
Phase 0 pass (`7807094`) — `HomeScreen` and `GamificationProfileScreen` both
already read the single `getLevelProgress`/`getXpProgressPercent` source of
truth. The remaining HomeScreen-inline-SVG-ring vs. `LevelRing`-component
duplication is cosmetic (same correct percentage, two draw paths), not a
correctness bug — left as-is rather than risking a visual regression on the
dashboard's centerpiece for no functional gain.

Fixed:
- [x] `BadgesScreen.tsx` divide-by-zero guard (`earned.length / Math.max(badges.length, 1)`)
      — badges load synchronously from a static 13-item seed list so this was
      latent, not reachable today, but now safe if that ever changes.
- [x] `DailyMissionsScreen`: now renders the `loading` state while missions
      fetch instead of looking identical to a zero-progress new user; the
      rewards-summary card total is computed from `DAILY_MISSIONS` instead of
      a hardcoded "150 XP / 40 Coins" that would silently drift if the mission
      list changes.
- [x] `RewardsScreen`: `weekly_box`/`epic_box` now actually unlock at a real
      7-day / 30-day streak (read from `gamificationStore`) instead of being
      permanently `isAvailable:false`, and show an unlock-condition hint while
      locked. Left the "Coin Shop — Coming Soon" section as-is: it was already
      an honest static preview (no fake buttons, no `onPress` pretending to
      work), not a misleading placeholder.

## Phase 3 — Leaderboard consolidation ✅ done

Shared `LeaderboardBoard` component now backs the Leaderboard tab root and
the pushed Weekly/Monthly Leaderboard screens — one real data source
(`useLeaderboardStore`), uid-based "is this me" highlighting, podium header
for the top 3. Deleted the old hardcoded-`DEMO_LEADERBOARD` tab screen, its
dead `LeaderboardCard` component, and the unused "Friends" tab (was a
permanent `[]` stub labeled "Coming in Phase 2" — removed rather than
shipped fake). Also fixed `MonthlyLeaderboardScreen`, which called a store
`setTab()` action its child never actually read, so it never opened on the
monthly tab.


- [ ] Pick ONE leaderboard experience and delete the other. Recommendation: keep
      `WeeklyLeaderboardScreen`'s tab taxonomy (Weekly/Monthly/All-Time/School) and
      real `useLeaderboardStore().fetchLeaderboard()` wiring — it already has
      correct loading/empty states — and port `LeaderboardScreen`'s podium
      top-3 visual treatment into it as an optional header component. Delete the
      other screen and its now-dead `DEMO_LEADERBOARD`/fake rank-42 entry.
      `MonthlyLeaderboardScreen` (a pure delegator) can stay as a thin route alias.
- [ ] Fix "is this me" matching by `uid`, not display-name equality
      (`WeeklyLeaderboardScreen.tsx:79` — two users sharing a name currently both
      get highlighted as "you").
- [ ] Either build the Friends tab (`LeaderboardScreen`'s stub always returns
      `[]`) or remove the tab until it's real — don't ship a tab labeled "Coming
      in Phase 2" inside a UI whose whole job is showing live progress.

## Phase 4 — Analytics: real data, real chart ✅ done

- [x] Added `react-native-gifted-charts` (`^1.4.77`) and replaced the
      hand-drawn `<Rect>` bars with a real `BarChart`, sized by its own
      `barWidth`/`spacing` props rather than a hardcoded 300px SVG canvas
      width — no longer fragile across device sizes.
- [x] Rewrote `analyticsService.getUserAnalytics(uid, period)` to compute
      real numbers: XP/questions/accuracy/streak from the (now-accurate,
      per Phase 5) `gamification/{uid}` profile; subject mastery from
      `student_progress` via the existing `aggregateSubjectProgress`; a new
      bucketed `quiz_attempts` query for the activity bars (added the
      composite index `quiz_attempts(userId, completedAt)` to
      `firestore.indexes.json` — needs deploying). `DEMO_ANALYTICS` is now
      only a fallback for local dev without Firebase / a failed query, not
      what a real zero-activity user sees (they get real zeros).
- [x] 7d/30d/3m period pills now genuinely refetch with different bucket
      granularity (daily / ~3-day / weekly) instead of a local no-op.
- [x] Added a loading state for the first fetch (subsequent period switches
      update in place rather than flashing a full-screen spinner).
- [x] Softened internal "Phase 2" jargon in the AI-insight card's user-facing
      copy to "Coming Soon" and removed the fabricated sample insight text —
      kept it an honest placeholder since real Gemini-generated insights are
      a separate, unbuilt feature.

## Phase 5 — Profile & Dashboard: kill the fake numbers ✅ done

Two real, previously-undiscovered bugs surfaced while wiring this phase (not
in either prior audit):
- `GamificationProfile.totalQuizzes`/`totalQuestions`/`totalCorrect` existed
  in the schema and were even read by badge-unlock logic
  (`profile.totalQuizzes >= 1` for the `first_quiz` badge) but **nothing ever
  incremented them** — that badge could never be earned. Added
  `recordQuizStats()`, called from `checkBadges` on every quiz completion.
- `saveUserBadges()` had zero callers — earned badges lived only in
  in-memory Zustand state and vanished on every app restart. Wired it into
  `checkBadges`, and added `getUserBadgeIds()` + a `fetchProfile` fix so
  badges rehydrate on load.

Fixed:
- [x] `ProfileScreen`: Quick Stats (Packs Done / Questions / National Rank /
      Subjects) now read from `progressStore`/`gamificationStore`/
      `leaderboardStore`; badge grid reads the real store instead of
      `DEMO_BADGES`.
- [x] Built a real `EditProfileScreen` (name/form/school/avatar, persisted to
      `users/{uid}` via a new `updateUserProfileFields`) and wired both the
      "Edit Profile" button and the avatar camera-badge to it — both were
      previously `onPress`-less dead buttons.
- [x] `HomeScreen`: "Continue Learning" now shows the subject with the most
      recently opened, not-yet-completed progress record (real % from
      `progressStore`), falling back to "not started yet" for new users
      instead of a fabricated topic name — discovered along the way that
      `progressStore.fetchProgress()` had **zero callers anywhere in the
      app**, so pack-completion checkmarks in `LearningPackDetailScreen` were
      silently always 0% regardless of real progress; now fetched on Home
      mount. Daily Mission card and hero "3/5" text now reflect real
      `missionStore` completion. "Top Students" uses the real national
      leaderboard. Pull-to-refresh now actually re-fetches profile/progress/
      missions instead of a cosmetic `setTimeout`.
- [ ] `numberOfLines`/`ellipsizeMode` pass on variable-length text — folded
      into Phase 6 since it's a responsive-layout concern touching the same
      screens.

## Phase 6 — Responsive design system (small phone → iPhone Pro Max) ✅ done

- [x] Added `src/theme/responsive.ts`: `useResponsiveScale()` (reactive,
      `useWindowDimensions`-based, clamped 320–430pt) and `moderateScale(size,
      scale, factor)`. Applied to the two most prominent fixed-px decorative
      elements flagged in the audit — `HomeScreen`'s hero XP ring (was a fixed
      `RING_SIZE=120`) and `GamificationProfileScreen`'s `LevelRing size={110}`
      — both now scale gently with device width instead of staying pixel-fixed.
      Left the consolidated leaderboard's podium bar heights (50–80px) and
      52px avatars alone: at 320–430pt width these are governed by the
      podium's `flex:1` horizontal layout, not fixed widths, so there's no
      overflow risk at either extreme — verified by calculation, not
      unnecessarily churned for a cosmetic-only delta with no test device
      available to confirm the visual result.
- [x] Brought the screens with real safe-area gaps under
      `SafeAreaView`/`useSafeAreaInsets` (matching `ScreenContainer`'s own
      internal pattern — gradient-full-bleed root wrapping a safe-area-aware
      content layer — rather than migrating each screen's bespoke layout onto
      the shared component and risking an unverifiable visual regression):
      `WelcomeScreen`, `SubjectSelectionScreen`, `PackCompletionScreen`,
      `ProfileScreen` (all had real top/bottom clearance gaps — thin static
      padding standing in for actual notch/home-indicator insets), and
      `FormSelectorModal` (bottom-sheet — added real inset on top of its
      existing static padding). Two screens confirmed exempt with reasoning:
      `SplashScreen` (full-bleed by design, no interactive elements near
      edges, brief/non-scrolling) and `MonthlyLeaderboardScreen` (a pure
      delegator to `WeeklyLeaderboardScreen`, which already uses
      `ScreenContainer` — nothing of its own to wrap).
- [x] Added `numberOfLines` guards on `AchievementsScreen` title/description
      (the `HomeScreen`/leaderboard instances flagged in the audit were
      already fixed incidentally during Phase 5's rewiring).
- Not independently re-verified on physical/simulated devices at 320×640,
  375×667, and 430×932 — no device or simulator available in this
  environment. Every change above was reasoned through against exact pixel
  values at both extremes rather than guessed; a real-device pass before
  release is still recommended.
- `app.config.ts` already correctly scopes to phone-only portrait
  (`supportsTablet:false`, `orientation:'portrait'`) — left as-is; tablet
  support would be a separate, explicitly-scoped follow-up.

---

## Suggested execution order

Phase 0 (persistence/security) → Phase 1 (summary/hoq screens, since content is
otherwise wasted) → Phase 3 (leaderboard consolidation, needed before Phase 2/5
reference "the" leaderboard) → Phase 2 (gamification polish) → Phase 5
(dashboard/profile real data) → Phase 4 (analytics) → Phase 6 (responsive pass,
touches every screen already modified above, do it last so it's one pass over
final layouts, not repeated).

## Definition of done

- Every write path in the app lands in Firestore under a collection name that
  matches `firestore.rules`, verified by re-launching the app and confirming XP/
  streak/badges/profile survive a cold restart.
- All 5 pack types (mcq/fib/tf/summary/hoq) are playable end-to-end from every
  entry point, no placeholder screens remain for content that exists.
- One leaderboard experience, backed by real data, correct "is this me" logic.
- Analytics renders real user data with a real chart library.
- Dashboard/Profile show numbers that change when the user actually studies.
- No screen ships a visible "Coming Soon"/placeholder unless explicitly agreed
  as out-of-scope for this build pass.
- Every screen has real safe-area handling — via `ScreenContainer` or a direct
  `SafeAreaView`/`useSafeAreaInsets` for screens with a bespoke layout — with
  the few exemptions (splash screen, pure delegator screens) explicitly
  reasoned through, not silently skipped.

## Status: all 7 phases complete, plus a real local test pass

Phases 0–6 above are done and pushed to `claude/last-updated-phj7xz`, each in
its own reviewed, `tsc`-clean commit.

**2026-07-01 update — actually ran the app.** This environment has no mobile
simulator, but does have Chromium pre-installed, so the app was run via
`expo start --web` + a scripted Playwright click-through of onboarding, the
quiz flow, leaderboard, analytics, profile, and the new HOQ/Summary premium
packs. That surfaced 4 real, previously-undiscovered bugs (all fixed, commits
`1c4308f` and the RootNavigator/profileStore fix that followed it):
- `firebaseConfig.ts` crashed the entire app to a blank screen whenever
  Firebase credentials are unset (the SDK throws synchronously on an empty
  `apiKey`) — now substitutes a syntactically-valid dummy config in that case.
- `useAuth`'s `loginDemo`/`verifyOtp` never reset the loading flag, so
  "Verify & Continue" spun forever.
- `LearningPackDetailScreen`'s premium (HOQ/Summary) pack rows were
  completely untappable — hardcoded `onPress={() => {}}` plus a lock-icon
  overlay with no `pointerEvents` setting silently absorbing every tap.
  Between the two, nobody — free or premium — could ever reach the
  locked-feature upsell or the real HOQ/Summary screens built in Phase 1.
- **Onboarding-skip bug**: `isAuthenticated` flips true the instant OTP is
  verified, so `RootNavigator` swapped to the main app before
  `CreateProfileScreen`/`SubjectSelectionScreen` ever got a chance to render
  — every new user landed on Home as a nameless "Student" with zero subjects
  selected. Fixed by gating `RootNavigator` on
  `isAuthenticated && profile && profile.selectedSubjectIds.length > 0`
  instead of `isAuthenticated` alone (added matching `hasHydrated` tracking
  to `profileStore` so this doesn't regress the "already onboarded, cold
  start" case). Re-verified end to end: OTP → Create Profile → Subject
  Selection → Home now shows the real name entered.

**Firebase project switched to `tanzania-81c27`** (was `tanza-9b182`) —
`.firebaserc` and every `scripts/*.mjs` default now point there. Still to do,
by a human with real Firebase CLI access (this sandboxed environment has no
network route to Firebase's servers at all, confirmed by a hard
`ERR_CONNECTION_CLOSED`/"could not reach Cloud Firestore backend" when
testing with real credentials — that's an environment limitation, not an
app bug):
1. `firebase deploy --only firestore:rules,firestore:indexes` against
   `tanzania-81c27` (indexes include the new Phase 4
   `quiz_attempts(userId, completedAt)` composite).
2. Re-seed all 408 curriculum content files to `tanzania-81c27` via
   `GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node --experimental-strip-types scripts/seed-content.mjs`
   — the content currently only lives on the old `tanza-9b182` project (see
   the note at the top of `CURRICULUM_BUILD_PLAN.md`).
3. Verify `firebase.json`'s hosting `site: "tanza-9b182"` — left unchanged
   since a hosting site's name doesn't have to match its project id and
   there was no way to confirm from here whether a `tanzania-81c27` site
   exists; check/update this before running `firebase deploy --only hosting`.
4. **Real-device visual pass** — the Playwright run confirms the app *works*
   (renders, navigates, no crashes) but Expo web isn't pixel-identical to
   native iOS/Android. Install on at least one small phone and one large
   iPhone before release.
