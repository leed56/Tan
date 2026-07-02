# Soma AI — A–Z Audit Findings (Flows · Quiz Engine · LaTeX · NECTA Exam Style)

> Run per `EXAM_STYLE_AUDIT_PROMPT.md` on branch `claude/last-updated-phj7xz`, 2026-07-02.
> Evidence: live-DB sweep of **all 8,246 questions + 1,440 packs** (`scripts/audit/census.mjs`,
> outputs in `scripts/audit/output/`), NECTA format research (sources table below),
> static route audit, and in-app functional testing. **Diagnosis only — no content or
> renderer changes applied beyond fixes already committed earlier today.**

## TL;DR

The app's Form 1–2 content is real, plentiful and stylistically credible — but
**Form 3 is empty except Mathematics and Form 4 is completely empty** while both
are sold in onboarding. The single biggest authenticity gap against real NECTA
papers is systematic: **every MCQ has 4 options; CSEE Section A uses 5 (A–E)**.
One old Form 1 Math batch ships 27 unanswerable HOQ questions and 158 questions
whose LaTeX still renders as raw markup.

---

## 🔴 P0 — students hit these today

| # | Finding | Evidence | Impact |
|---|---|---|---|
| 1 | **Form 4 has ZERO questions; Form 3 has questions only for Mathematics.** Topics and packs exist as shells (F3: 44 topics/220 packs/304 questions, all math · F4: 40 topics/200 packs/0 questions), so F3/F4 students browse a full-looking curriculum and every quiz comes up empty. Session task list says F3/F4 units were "built" — they were never seeded to Firestore. | form-level counts, `census.mjs` | Paying F3/F4 students get nothing |
| 2 | **27 unanswerable HOQ questions in Form 1 Math.** The legacy `f1_math_ch*` batch's HOQ items have `options: []` (written as open-ended prompts, e.g. referencing "the diagram" — no diagram exists). HOQScreen requires options, so the screen renders no answers and the 90s timer just runs out. Same 27 have empty `explanation`. | `integrity.json → badOptions`, e.g. `f1_math_ch1_hoq_1` → pack `form_1_mathematics_topic_1_pack_5` | Broken quiz, wasted daily limit |
| 3 | **190 questions are unreachable** — they reference 20 packs that don't exist (`form_1_mathematics_topic_5..9_pack_*`). Packs for F1 Math topics 5–9 were never created, so topics render with missing/short pack lists and ~190 finished questions can never be served. | `integrity.json → orphanPack` | Invisible content, thin topics |

## 🟠 P1 — wrong or ugly behavior

| # | Finding | Evidence | Impact |
|---|---|---|---|
| 4 | **158 questions still render raw LaTeX** (`\frac{PRT}{100}`, `\times`, `_{ }` subscripts) — all in the legacy F1 Math batch. Today's `MathRenderer` handles `\( \)`, `\text{}`, `sqrt`, integer exponents; it does NOT handle `\frac`, subscripts, `\times`/`\div`/`\pm`, `\rightarrow`. | `integrity.json → rawBackslashVisible`; census: F1 math `latexFrac: 118`, `latexTimesDivPm: 103` | Students see markup soup |
| 5 | **MCQ option count is 4 everywhere; NECTA CSEE Section A uses FIVE options (A–E).** Verified across the sampled 240+ MCQs in all 13 subjects. This is the most recognizable NECTA authenticity marker and we miss it app-wide. (FTNA also uses 5.) | sample scoring; NECTA format snippets (multiple subjects) | Exam-prep authenticity |
| 6 | **Islamic Knowledge is written in English; the NECTA paper (015, Elimu ya Dini ya Kiislamu) is set entirely in Kiswahili** — command words "Eleza/Taja/Fafanua". All 608 F1–F2 questions affected. (Kiswahili subject itself is correctly in Kiswahili ✓.) | sample inspection | Whole-subject language mismatch |
| 7 | **80 of 288 summary-type packs have no `summaryPoints`** → SummaryScreen shows its empty state. | live pack sweep | Dead ends, mostly premium content |
| 8 | **No "matching items" question type.** Every NECTA Section A pairs the 10 MCQs with a matching question (Column A ↔ Column B, 5–6 items); FTNA also uses fill-in-the-blanks objectives. We ship MCQ/FIB/TF/HOQ only — FIB partially covers fill-ins; nothing covers matching. | NECTA formats; app types | Missing exam skill |

## 🟡 P2 — polish / metadata

| # | Finding | Evidence |
|---|---|---|
| 9 | **320 packs declare a wrong `questionCount`** (two content batches merged into the same packs: e.g. `…topic_1_pack_1` declared 10, actual 15). Quiz intro and pack cards show wrong counts. | `integrity.json → packMismatch` |
| 10 | Difficulty labels skew "easy" in samples; NECTA papers ramp difficulty within sections. Needs a per-pack difficulty-mix policy. | sample scoring |
| 11 | HOQ = 651 questions total but only ~8% of content; NECTA Sections B/C (short-answer/essay) are ~60–85% of marks. Our HOQ is the only higher-order surface — thin vs the real exam's weighting. | type counts: MCQ 3,255 / FIB 2,170 / TF 2,170 / HOQ 651 / SUMMARY 0 (summaries live on packs) |

---

## Notation census (Part C) — where the math markup lives

Full tables: `scripts/audit/output/summary.md` + `census.json`. Headlines:

- **Only Form 1 Mathematics carries real LaTeX** (312/342 questions use `\( \)`; 118 use `\frac`; 103 use `\times`-family; 11 subscripts). Everything else app-wide is plain prose with occasional ASCII math (`sqrt(…)`, `x^2`, `1/2`) — which the renderer now prettifies (√, superscripts) after today's fixes.
- Chemistry/Physics F1–F2 use almost **no** chemical-formula markup (`H2O` appears as plain text in a handful of questions; no subscripts) — acceptable rendering today, but chemistry equations will need subscript support when F3/F4 content lands.
- **Renderer coverage matrix:**

| Notation class | Occurrences | Current rendering | Verdict |
|---|---|---|---|
| `\( … \)` + `\text{}` wrappers | ~312 q | unwrapped to prose / chip | ✅ (fixed today) |
| `sqrt()` / `\sqrt{}` | ~30 q | √x | ✅ (fixed today) |
| Integer exponents `x^2` | ~48 q | unicode superscript | ✅ (fixed today) |
| `\frac{a}{b}` | **118 q** | raw `\frac{a}{b}` | ❌ P1 |
| `\times \div \pm \cdot` | **103 q** | raw | ❌ P1 |
| Subscripts `x_{1}` | 11 q | raw | ❌ P1 |
| `\rightarrow` / `-->` | 3 q | raw / plain | ⚠️ |
| Degree `°`, units `m/s²` | ~30 q | plain text | ✅ acceptable |

- **Smallest fix set (recommended order):**
  1. Extend `prettifyMath`: `\frac{a}{b}` → `a/b` styled fraction (or `a⁄b`), `\times`→`×`, `\div`→`÷`, `\pm`→`±`, `\cdot`→`·`, `\rightarrow`→`→`, `x_{1}`→`x₁` (unicode subscripts). Covers **all 158** broken questions with ~20 lines of code. No KaTeX needed for current content.
  2. Batch-normalize the legacy `f1_math_ch*` batch in the DB (optional once #1 ships).
  3. Revisit KaTeX/WebView only if F3–F4 math content (when written) needs stacked fractions/matrices.

---

## NECTA exam grammar (Part D) — what real papers look like

Research caveat: the egress proxy blocked every paper PDF host (necta.go.tz,
onlinesys.necta.go.tz CIRA reports, maktaba.tetea.org, all aggregators) with 403.
Formats below are assembled from official-wording search snippets — structure
confidence HIGH, verbatim examples snippet-sourced. To quote exact items,
allowlist `maktaba.tetea.org` + `onlinesys.necta.go.tz`.

**Cross-cutting (CSEE):** one 3-hr, 100-mark paper; Section A = objectives —
**10 MCQs with FIVE choices A–E** (stem instruction: *"Choose the correct answer
from among the given alternatives and write its letter beside the item number…"*)
+ **matching items** (6 at CSEE, 5 at FTNA); Section B = compulsory short answers
(~54–70 marks); Section C = essays, choose 2 of 3 × 15 marks. **FTNA (Form 2)**:
bigger Section B (7×10), single essay, sciences often A+B only, adds
fill-in-the-blanks objectives. **Basic Mathematics is the exception:** no
objectives at all — Section A = 10 short-answer × 6 marks, Section B = choose 4
of 6 × 10 marks; command words "Find/Simplify/Solve/Rationalize/Evaluate/Draw
the graph of".

Subject highlights vs our content:
- **Biology:** Section A includes **10 true/false** (10 marks) — our TF type matches a real NECTA feature ✓; "Draw and label" items are integral (we have no diagram support).
- **Geography:** the **map-reading question** (e.g. 2022 Ilonga sheet 265/2 — measure distance, calculate area, infer economic activities) is a defining feature we cannot represent without map/diagram assets.
- **Kiswahili:** paper entirely in Kiswahili ✓ (ours matches); Sehemu C = insha/ushairi/fasihi (essay skills our types can't test).
- **Islamic Knowledge:** paper in Kiswahili — ours is in English ❌ (P1 #6).
- **Book Keeping/Commerce:** "Prepare a Trial Balance / record transactions / Suspense Account" working questions — our MCQ/FIB can only approximate; fine for practice, note in marketing.
- **ICS:** two papers, practical submits soft copies; Paper 1 adds true/false ✓.
- **Physics/Chemistry:** "Calculate/With the aid of a diagram/Write the chemical equation" — chemistry equation rendering will need subscripts (see census).

## Gap matrix (subject × dimension, Forms 1–2 where content exists)

Legend: ✅ aligned · ⚠️ partial · ❌ gap. F3/F4 = ❌ everywhere except F3 math (content absent, P0 #1).

| Subject | Stem style | Distractors | Command words | 5-option MCQ | Language | Notation | Coverage F1–F2 |
|---|---|---|---|---|---|---|---|
| Mathematics | ✅ NECTA-like ("Find/Simplify/Solve") | ✅ plausible | ✅ | ❌ 4 opts (note: real paper has NO MCQs — ours are practice-style, acceptable) | ✅ EN | ⚠️ 158 raw-LaTeX + 27 broken HOQ | ✅ |
| Biology | ✅ | ✅ | ✅ Define/State/Explain | ❌ 4 opts | ✅ EN | ✅ | ✅ |
| Chemistry | ✅ | ✅ | ✅ | ❌ | ✅ EN | ✅ (subscripts needed later) | ✅ |
| Physics | ✅ | ✅ | ✅ Calculate/State | ❌ | ✅ EN | ✅ | ✅ |
| English | ✅ passage/grammar stems | ✅ | ✅ | ❌ | ✅ EN | ✅ | ⚠️ no composition/literature skills |
| Kiswahili | ✅ authentic (ngeli, sarufi) | ✅ | ✅ Eleza/Taja | ❌ | ✅ **SW** | ✅ | ⚠️ no insha/fasihi |
| Geography | ✅ | ✅ | ✅ | ❌ | ✅ EN | ✅ | ⚠️ no map-reading |
| History | ✅ ("Why did…") | ✅ | ✅ | ❌ | ✅ EN | ✅ | ✅ |
| Civics | ✅ | ✅ | ✅ | ❌ | ✅ EN | ✅ | ✅ |
| Commerce | ✅ | ✅ | ✅ | ❌ | ✅ EN | ✅ | ⚠️ no working/prepare questions |
| Agriculture | ✅ | ✅ | ✅ | ❌ | ✅ EN | ✅ | ✅ |
| Computer Studies | ✅ | ✅ | ✅ | ❌ | ✅ EN | ✅ | ⚠️ no practical dimension |
| Islamic Knowledge | ✅ | ✅ | ⚠️ EN command words | ❌ | ❌ **should be SW** | ✅ | ✅ |

**Per-subject NECTA-voice templates** for future content generation: see
`EXAM_STYLE_AUDIT_PROMPT.md` Part D.4 — to be authored per subject during the
content-fix phase using the format skeletons above (five options A–E, official
stem instruction, matching-item sets, FTNA fill-ins) once exact paper text is
available (proxy allowlist) or sourced offline.

---

## Part A — Flows, routes, cards & buttons (static audit)

_Section pending — background route audit in progress; will be appended._

## Part B — Quiz engine functional verification (running app)

_Section pending — background E2E run in progress; will be appended._

---

## Recommended fix plan (by student impact)

**Content (blocks launch):**
1. Seed Form 3 (12 subjects) + Form 4 (13 subjects) questions — the "built" units exist as generation tasks but were never written to Firestore. ~a full content build: F1+F2 average ≈ 300 questions/subject/form → ≈ 7,600 questions needed.
2. Fix the 27 optionless HOQ items (write 4–5 options + explanations, or retype as open HOQ only after the app supports it).
3. Create the 20 missing F1 math packs (topics 5–9) or repoint their 190 questions.
4. Fill summaryPoints for the 80 empty summary packs.
5. Translate Islamic Knowledge to Kiswahili (608 questions).

**Code (small, high leverage):**
6. Extend `prettifyMath` for `\frac`, `\times`-family, subscripts, arrows (~20 lines; kills all 158 raw-markup sightings).
7. Support 5-option MCQs end-to-end (data already allows it — add E label; author new content with 5).
8. Add a matching-items question type (new NECTA-aligned quiz surface; medium effort).
9. Batch-correct `questionCount` on 320 packs (one admin script).

**Marketing honesty (until fixed):** onboarding should not offer Form 3/4 while empty (either hide the forms or label "coming soon").
