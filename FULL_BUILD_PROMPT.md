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

Do this before touching UI. Reference `AUDIT_FINDINGS.md` for full detail; summary
of the fix set:

- [ ] Remove secret `EXPO_PUBLIC_*` vars from `.env`; proxy Gemini/Selcom/Azampay
      through Cloud Functions.
- [ ] Fix unguarded `data[tab].length` crash in `leaderboardStore.ts:24`.
- [ ] Fix `usageStore.ts` type/limits to include `summary`/`hoq` (NaN crash risk).
- [ ] One source of truth for Firestore collection names that **matches
      `firestore.rules`** — currently `leaderboard_scores` vs `leaderboard`,
      `explanation_feedback` vs `ai_feedback`, `daily_usage`/`student_progress`/
      `quiz_attempts`/`quiz_answers`/`family_profiles` all denied by name mismatch.
- [ ] Wire `authStore` with `persist` + real `onAuthStateChanged`; replace faked
      OTP (`DEMO_OTP='123456'`, `demo_user_001`) with real `phoneAuthService`
      behind an explicit `DEMO_MODE` flag (default OFF for production builds).
- [ ] Write `users/{uid}` on profile creation with the exact shape the rules
      require (`displayName`, `subscriptionStatus:'free'`, `role:'student'`, etc).
- [ ] Route XP/coins/streak/badges through the already-written
      `awardXP`/`persistProfile`/`checkStreak`/`checkBadges` — currently store-only,
      zero callers. Fix EAT (UTC+3) day-boundary bug in streak calc.
      Remove the double-XP-award bug in `PackCompletionScreen.tsx:30-31`.
      Unify the two conflicting level curves (`XPProgressBar`'s flat 500/level vs
      `LEVEL_THRESHOLDS`).
- [ ] Point leaderboard writes at `leaderboard/{userId}` with `increment()`, add
      weekly/monthly reset; call on every XP gain instead of demo fallback.
- [ ] Fix daily-missions write path to the `/progress/{uid}` subcollection the
      rules actually allow; call `updateProgress` from quiz completion.
- [ ] Map `xpReward`↔`completionXP` field mismatch; normalize TF answer
      comparison (case-insensitive); form-scope onboarding subject ids
      (`mathematics` → `form_1_mathematics`) and persist selection.
- [ ] Fix AI-explanation cache (`userId` field, premium gate source) and surface
      Gemini 429 rate-limit errors to the user instead of silently degrading.
- [ ] One source of truth for premium status: an activation Cloud Function/webhook
      sets `users.subscriptionStatus`; app and rules both read that, not two
      different local stores.
- [ ] Add the 3 missing composite Firestore indexes (`leaderboard_scores`,
      `student_progress`, `daily_missions` date+userId).
- [ ] Delete dead code: `aiExplanationService.ts`, `quizEngineService.ts` stubs;
      wire or delete `offlineService`/`crashReportingService`/`revenueCatService`
      (currently zero callers on all three).

**Decision needed before this phase starts** (see questions below): should real
phone-auth OTP and real mobile-money payments go live now, or should Phase 0 wire
everything *except* flip DEMO_MODE/payments live, so the app is release-ready but
you control the go-live switch?

---

## Phase 1 — Missing quiz screens (Summary + HOQ)

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

## Phase 2 — Gamification engine (make it real, not just persistent)

- [ ] Shared `ProgressBar` primitive — currently 3 independent hand-rolled XP-bar
      implementations (`HomeScreen`, `GamificationProfileScreen`,
      `BadgesScreen`/`XPProgressBar`). One component, one level-curve source
      (`getLevelProgress` from `xpUtils`, per Phase 0).
- [ ] Fix `BadgesScreen.tsx:30` divide-by-zero (`earned.length/badges.length`) →
      guard for `badges.length === 0` before data loads; add a loading skeleton
      instead of blank body when both earned/locked are empty pre-fetch.
- [ ] `DailyMissionsScreen`: render the `loading` state that's fetched but never
      used; handle `fetchMissions`/`claim` failure with a retry affordance;
      derive the rewards-summary card total from the actual mission list instead
      of hardcoded "150 XP / 40 Coins".
- [ ] `RewardsScreen`: either build the coin-shop spend path or remove the
      "Coming Soon" tiles entirely rather than shipping dead greyed-out buttons
      with no `onPress`; add real unlock messaging for `weekly_box`/`epic_box`
      instead of permanent `isAvailable:false`.
- [ ] `AchievementsScreen`: confirm the 10 hardcoded achievements' unlock
      conditions are driven by real store data end-to-end (they read progress, but
      verify against Phase 0's real persistence, not stale local state).

## Phase 3 — Leaderboard consolidation

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

## Phase 4 — Analytics: real data, real chart

- [ ] Add a real chart library (`react-native-gifted-charts` — already the
      TODO-noted intended choice in the code) and replace the hand-drawn
      `<Rect>` bars in `AnalyticsScreen.tsx:124-146`.
- [ ] Replace `DEMO_ANALYTICS` with real query aggregation from `quiz_attempts`/
      `student_progress` (once Phase 0 makes those collections real).
- [ ] Make the 7d/30d/3m period pills actually refilter the underlying data
      (currently local `useState` no-op).
- [ ] Guard `Math.max(...data.weeklyActivity, 1)` against undefined data
      (`AnalyticsScreen.tsx:21`) instead of assuming data is always loaded.
- [ ] Remove the hardcoded 300px bar-chart container width; size from parent
      flex/`useWindowDimensions` (ties into Phase 5).
- [ ] Either ship a real AI-insight generation call or remove the
      "coming soon" card rather than showing canned placeholder copy as if it
      were a feature.

## Phase 5 — Profile & Dashboard: kill the fake numbers

- [ ] `ProfileScreen`: Quick Stats grid ("14"/"87"/"#42"/"3") must read from real
      stores post-Phase-0, not hardcoded literals; wire the dead "Edit Profile"
      and avatar-edit buttons (currently no `onPress`); replace `DEMO_BADGES`
      with the real badge store.
  - Also: `ProfileScreen` and `PackCompletionScreen` don't use `ScreenContainer`
    (see Phase 6) — bring them in line so safe-area handling is consistent.
- [ ] `HomeScreen`: "Continue Learning" card must reflect the user's actual
      last-touched topic/pack and % progress, not the hardcoded
      "Mathematics/Quadratic Equations/60%" (`HomeScreen.tsx:157-190`); Daily
      Mission card's "3/5" must come from the real mission store; "Top Students"
      widget must use the consolidated real leaderboard (Phase 3), not
      `DEMO_LEADERBOARD`; make pull-to-refresh actually re-fetch instead of a
      cosmetic `setTimeout`.
- [ ] Add `numberOfLines`/`ellipsizeMode` to any user-generated or variable-length
      text sitting next to fixed-width siblings (`HomeScreen` continueTopic/
      missionTitle/leaderName; `AchievementsScreen` titles/descriptions) so long
      subject/topic names don't overflow on narrow screens.

## Phase 6 — Responsive design system (small phone → iPhone Pro Max)

Current state is a reasonable **baseline**, not broken: a static spacing/typography
token scale (`src/theme/spacing.ts`, `typography.ts`) is used consistently instead
of magic numbers, and `ScreenContainer` centralizes `SafeAreaView` handling for
~30/37 screens. What's missing is *scaling*, not *structure*.

- [ ] Bring the remaining 7 screens under `ScreenContainer` (or confirm+comment why
      not, e.g. modals): `SplashScreen`, `FormSelectorModal`, `MonthlyLeaderboardScreen`,
      `PackCompletionScreen`, `SubjectSelectionScreen`, `WelcomeScreen`, `ProfileScreen`.
- [ ] Add a lightweight width-based scaling helper (`src/theme/responsive.ts`) using
      `useWindowDimensions()` (reactive — not the current module-level
      `Dimensions.get` which never updates), e.g. a `moderateScale(size, factor)`
      clamped between small-phone (~360pt baseline) and large-phone (~430pt,
      iPhone 16 Pro Max) widths. Apply it to the genuinely fixed decorative
      elements flagged in the audit: `HomeScreen.tsx:28` `RING_SIZE=120`,
      `GamificationProfileScreen.tsx:42` `LevelRing size={110}`,
      `LeaderboardScreen`/new consolidated leaderboard podium bar heights
      (`{1:80,2:60,3:50}`) and `podiumAvatar` 52px.
  - Do NOT scale the spacing/typography token scale itself — that's deliberate
    design consistency, not a bug. Scale only decorative/graphical sizes that
    visibly shrink/grow the widget relative to very small or very large screens.
- [ ] Verify on both extremes: iPhone SE (375×667, no notch) and iPhone 16 Pro Max
      (430×932, Dynamic Island) plus one small Android reference (360×640) —
      confirm no clipped text, no podium/ring overflow, safe-area respected top
      and bottom (home indicator) on every screen touched in Phases 1–5.
- [ ] `app.config.ts` already correctly scopes to phone-only portrait
      (`supportsTablet:false`, `orientation:'portrait'`) — leave as-is unless you
      want tablet support added as a separate, explicitly-scoped follow-up.

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
- Every screen wrapped in `ScreenContainer` (or explicitly exempted), verified at
  360×640, 375×667, and 430×932 with no clipping/overflow and correct safe-area
  insets top and bottom.
