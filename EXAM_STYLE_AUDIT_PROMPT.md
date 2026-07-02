# Soma AI — Complete A–Z Audit Prompt (Flows · Routes · UI · Quiz Engine · LaTeX · NECTA Exam-Paper Style)

> Paste this to Claude Code to run a complete audit of the Soma AI student app:
> every user flow from first launch to quiz completion, every route and its params,
> every card/button state, the quiz engine end-to-end in the running front app,
> math/LaTeX rendering across ALL Form 1–4 content, and — most important — whether
> our quiz questions match the style of real Tanzanian **NECTA exam papers** for
> **all 13 subjects**, not just Mathematics.
> **Diagnosis first: produce a prioritized findings report + gap matrix. Do not
> rewrite content or refactor code until findings are reviewed and greenlit.
> Small mechanical fixes found along the way (broken route param, crash) may be
> fixed immediately in separate commits.**

---

## 0. Ground truth (verified — build on this, don't re-derive)

- **Firebase project:** `tanza-9b182` (live). **Branch:** `claude/last-updated-phj7xz` (PR #1, draft).
- **Stack:** Expo SDK 51 / RN 0.74, TypeScript, Zustand, Firebase Web SDK. Admin panel in `admin/` (React + React Query). Cloud Functions in `functions/`.
- **App surface:** 42 screens (`src/screens/**`), 22 services, 13 stores, 63 components, 3 navigators (`RootNavigator` auth-gate → `AuthNavigator` | `AppNavigator` with 5 tabs; Home/Subjects/Profile tabs each wrap their own stack).
- **Content inventory (live DB, verified 2026-07-01 via `node scripts/check-firebase.mjs`):** 4 forms · 52 subjects (13 × 4 forms) · 293 topics · 1,440 learning packs · **8,246 questions**. IDs follow `form_{n}_{subject}_topic_{k}_pack_{p}`; `subjectId = form_{n}_{bareSubject}`.
- **Question `type` is UPPERCASE in the DB** (rules-enforced: `MCQ|FIB|TF|HOQ|SUMMARY`), lowercased at the read boundary in `quizService.getQuestionsByLearningPack`.
- **Quiz session lifecycle:** ONLY `QuizIntroScreen.handleStart` calls `quizStore.initSession`. Navigating directly to `MCQQuiz`/`FIBQuiz`/`TFQuiz`/`HOQQuiz` (e.g. from the Dev Test Menu) shows "No questions" by design. Audit the flow through QuizIntro.
- **Math rendering:** `src/components/ui/quiz/MathRenderer.tsx` — splits `\( … \)` / `\[ … \]`, unwraps `\text{…}`, converts `sqrt(x)`/`\sqrt{x}` → `√x` and integer exponents `2^3` → `2³`, renders remaining math in a monospace "chip" (NO KaTeX yet — `\frac`, subscripts `_`, `\times`, chemical arrows are NOT rendered). Fonts: Inter via `@expo-google-fonts/inter`, per-weight families in `TYPOGRAPHY.families`.
- **Known launch blockers already documented** (do not re-discover; see `AUDIT_FINDINGS.md`): fake OTP auth (123456), AI-explanation Cloud Function unwired, mobile-money USSD not sending, account deletion no-op, client-trusted XP.
- **Environment facts for this sandbox:** Chromium/Playwright CANNOT reach Firebase (connections dropped) but Node scripts CAN. To run the app end-to-end in the sandbox, hide `.env` (`mv .env .env.bak`) and restart Expo — the app then uses local seed data (Form 1 Math/Bio/Geo packs). Restore `.env` afterwards; **never commit it**. Dev entry: Welcome screen → "Enter Test Mode" (4s auth race) → flask FAB (bottom-right) → Test Menu.
- Start Expo: `EXPO_OFFLINE=1 CI=1 nohup npx expo start --web --port 8083 -c > /tmp/expo.log 2>&1 &` then wait for "Waiting on". Playwright: `playwright-core` with `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`, mobile viewport 390×740, `hasTouch: true`.

---

## Part A — Flow & navigation audit (A → Z)

Walk every reachable path as a real student would, in the running web app AND statically in code:

1. **Route inventory.** Enumerate every `Screen` in all navigators with its param type from `src/types`. For each: who navigates to it, with what params, and do the params always exist at the call site? Flag any `navigate()` whose params can be `undefined`/bare-vs-scoped `subjectId` mismatches (`mathematics` vs `form_1_mathematics` — quiz screens take BARE ids, curriculum screens take SCOPED ids).
2. **Cold-start flows:** first launch → Welcome → OTP login → Create Profile → Subject Selection → Home; returning user (persisted session) → Home directly; logout → back to Welcome. Verify no flow dead-ends and the Android back button / browser back never strands the user.
3. **Core loop:** Home → Subjects → Topics → Learning Pack Detail → Quiz Intro → Quiz → Result → (Wrong Answer Review | Explanation | Next pack). Verify XP/streak/coins update on Home after completing a quiz.
4. **Secondary flows:** Leaderboard, Analytics, Profile (edit, settings, subscription status, family hub, manage devices), Gamification (badges, missions, rewards), Subscription purchase (both plans, monthly/yearly, WhatsApp path), locked-content upsell (premium icon on Summary/HOQ for free users), daily-limit modal (5 MCQ / 3 FIB / 3 TF), form switcher modal.
5. **Every card and button:** for each interactive element record — visible label, action, disabled state, loading state, pressed feedback, and what happens on double-tap. Flag: buttons with no loading state on async actions, touchables under 44×44px, cards that look tappable but aren't (and vice versa), any `onPress` that can throw.
6. **State screens:** for every screen that loads data, force and screenshot its loading / empty / error states. Flag empty states without a retry, retries that `goBack()` instead of retrying, and errors swallowed into fake success.
7. Screenshot every screen at 390×740 (phone) and once at desktop width to confirm the `WebPhoneFrame` column; attach the shots to findings.

## Part B — Quiz engine: does it actually work in the front app?

Functional verification of all quiz types **in the running app** (sandbox seed mode), plus static verification against the live DB (Node script):

1. **Run each type end-to-end:** MCQ, FIB, TF, HOQ, Summary — from Quiz Intro through every question to the Result screen. Verify: timer counts and auto-submits on 0; correct/wrong feedback modal (with "Correct answer:" label clean of markup); XP/coins awarded only for correct; progress bar/dots advance; Result math (score %, correct/wrong counts) is right; Wrong Answer Review lists exactly the missed questions; Explanation screen opens and returns without losing quiz state.
2. **Session integrity:** quit mid-quiz (X button) — is the attempt recorded/abandoned cleanly? Re-enter the same pack — fresh session? Complete the last question twice fast (double-tap Continue) — any double navigation/XP?
3. **Daily limits:** exhaust the free limit (5 MCQ) and confirm the upgrade modal appears at the right count and the counter resets logic reads correctly (24h boundary, `usageService` merge-write increments one counter without zeroing others).
4. **DB-side integrity sweep (Node script over all 8,246 questions):** for every question — `type` is a valid uppercase enum; MCQ/HOQ have ≥3 options and `correctAnswer` matches an option id; FIB `correctAnswer` non-empty; TF `correctAnswer` ∈ {true,false}; `explanation` non-empty; `learningPackId` points to an existing pack; every pack's `questionCount` matches reality; every pack has ≥1 question of its declared type. Output a per-subject/per-form defect table.

## Part C — LaTeX / math notation audit — ALL subjects, Forms 1–4

The goal: **no student ever sees raw markup.** Sweep every one of the 8,246 questions (questionText, every option text, explanation, summaryPoints) with a Node script:

1. **Notation census.** Regex-classify every occurrence of: `\( \)` / `\[ \]` delimiters, `\text{}`, `\frac`, `\sqrt{}`, `sqrt()`, `^` exponents, `_` subscripts, `\times`/`\div`/`\pm`, chemical formulas (`H2O`, `CO2`, `H2SO4` — subscripts needed), chemical arrows (`->`, `→`), degree signs, units (`m/s^2`, `kg/m^3`), fractions written as `1/2`, Kiswahili text inside math wrappers. Produce a frequency table **per subject per form**.
2. **Renderer coverage matrix.** For each notation class found, state whether the current `MathRenderer` renders it beautifully, passably (monospace chip), or brokenly (raw backslashes visible). Anything in the "broken" column with >0 occurrences is a P1 finding.
3. **Recommend the smallest fix set**, in order of preference: (a) content normalization in DB (batch script), (b) extending `prettifyMath` (e.g. `\frac{a}{b}` → `a⁄b`, chemistry subscripts via unicode), (c) full KaTeX (already have `katexCssContent.ts` bundled — assess wiring it via WebView/react-native-katex only if (a)+(b) can't cover real content).
4. Spot-render 3 worst offenders per subject in the running app and screenshot before/after any proposed fix.

## Part D — NECTA exam-paper style alignment (MOST IMPORTANT — all 13 subjects)

Our quizzes must read like real Tanzanian national exams, because that's what students are practicing for: **FTNA (Form Two National Assessment)** and **CSEE (Form Four, Certificate of Secondary Education Examination)** — plus school-level Form 1/3 papers that copy NECTA style.

1. **Collect real papers.** Use WebSearch/WebFetch to find past papers for EVERY subject we ship: Mathematics, Biology, Chemistry, Physics, English, Kiswahili, Geography, History, Civics, Commerce, Book Keeping/Agriculture, Computer Studies (ICS), Islamic Knowledge. Primary sources: `necta.go.tz` past papers portal, `maktaba.tetea.org` (large NECTA archive), Tanzania Institute of Education (`tie.go.tz`) syllabi. Prioritize CSEE (Form 4) and FTNA (Form 2) papers from the last ~5 years.
2. **Extract the per-subject exam grammar.** For each subject, document: section structure (e.g. Section A objective / B short answer / C essay), MCQ conventions (stem phrasing, 4 vs 5 choices, "Which of the following…"), matching items, true/false phrasing, command words actually used ("Define", "Give reasons", "Explain briefly", "Calculate", "Draw and label", "Eleza", "Taja" for Kiswahili), mark allocations, use of diagrams/data tables, language register (English papers vs Kiswahili paper written in Kiswahili), and topic weighting.
3. **Sample our questions.** Pull a stratified sample from the DB — ≥10 questions per subject per form per type (or all, if fewer) — and score each against the subject's exam grammar: Does the stem read like NECTA? Are distractors plausible (classic NECTA distractor patterns) or obviously fake? Is difficulty appropriate to the form level (check against TIE syllabus topic placement)? Is HOQ genuinely higher-order (application/analysis, NECTA Section B/C style) or just a hard MCQ? Are Kiswahili-subject questions written IN Kiswahili?
4. **Deliver the gap matrix:** rows = 13 subjects × 4 forms, columns = {stem style, distractor quality, command words, difficulty calibration, language, notation, coverage vs syllabus}, cells = ✅/⚠️/❌ with a one-line reason. Then, per subject, write a **question-style template** (a model MCQ, FIB, TF, HOQ in authentic NECTA voice) that future content generation must follow, citing the actual past paper it mimics.
5. If network access blocks paper downloads, say so explicitly per source tried and fall back to documenting NECTA style from syllabus documents + well-known format descriptions — never invent "facts" about papers you could not open.

## Deliverables

1. `EXAM_STYLE_AUDIT_FINDINGS.md` — prioritized P0 (broken flow/crash/raw markup) → P1 (exam-style gaps, renderer gaps) → P2 (UX polish) → P3 (nice-to-have), each with file:line or question-id evidence and screenshots where visual.
2. The Part C notation census table and Part D gap matrix + per-subject NECTA templates (these two are the core value — be exhaustive).
3. A recommended fix plan ordered by student impact, separating: code fixes (renderer, flows) / content batch-fixes (DB scripts) / content rewrites (per-subject, sized in question counts).
4. Commit the report to `claude/last-updated-phj7xz` with the audit scripts under `scripts/audit/` so the census is re-runnable after content fixes.

## Constraints

- Never commit `.env`; restore it if hidden for sandbox testing.
- Diagnosis before treatment: no content rewrites or renderer refactors until findings are reviewed. Mechanical one-line bug fixes discovered en route are fine as separate commits.
- All work on branch `claude/last-updated-phj7xz`; keep PR #1 as the open draft.
- When sampling/scoring subjective style, quote the actual NECTA question you're comparing against — no vibes-based scoring.
