# Form 3 Basic Mathematics — Quiz Generation Prompt (Soma AI / TIE syllabus)

Use this prompt to generate **one chapter at a time**. Paste the prompt, replace
`{{CHAPTER}}` and `{{SUBTOPICS}}`, run it, then paste the output back to Claude
in the Soma AI project to convert + seed it.

Generate one chapter per run (not all at once) so every question is complete and
the answers are verified.

---

## THE PROMPT (copy everything below the line)

---

You are an expert Tanzanian O-Level **Basic Mathematics** teacher and NECTA item
writer. Produce a complete, exam-authentic **Form 3** learning pack for ONE
chapter of the **New TIE competence-based syllabus**, in **English**.

**Chapter to write:** {{CHAPTER}}
**Sub-topics (from the official TIE textbook table of contents):** {{SUBTOPICS}}

### Output exactly this structure — 38 questions
- **SECTION A — MULTIPLE CHOICE (15)** — 4 options A–D, one correct.
- **SECTION B — FILL IN THE BLANKS (10)** — a sentence with one blank; short exact answer.
- **SECTION C — TRUE OR FALSE (10)** — a statement; answer True or False.
- **SECTION D — HIGHER ORDER QUESTIONS (3) — with answer options** — harder,
  multi-step or applied problems, **each with 4 options A–D and one correct answer**.

### Format for EVERY question
1. The exam-style question stem (bold, numbered continuously Q1…Q38).
2. For MCQ/HOQ: the four options `A)  B)  C)  D)` on one line.
3. `**Answer: X**` (the correct letter, or the exact word/number for FIB, or True/False).
4. Three or four labelled worked steps using these markers:
   `📌 Step 1 — …`  `🔍 Step 2 — …`  `🧮 Step 3 — …`  `🎯 Step 4 — …` (use 🧮 for a
   calculation step, 🎯 for the concluding step).
5. `💡 **Exam Tip:** …` — one practical exam tip (spot the trap, a shortcut, a
   common mistake, or which distractor is the classic error).

### Content rules (NECTA authenticity)
- **English medium**, Form 3 level, aligned to the TIE competence-based syllabus.
- Use **Tanzanian real-life context**: Tanzanian Shillings (Tsh), local names
  (Juma, Asha, Neema, Fatuma, Baraka), and places (Dar es Salaam, Mwanza,
  Arusha, Dodoma) in word problems.
- Use NECTA command words: *Find, Calculate, Solve, Evaluate, Simplify, Express,
  Determine, Show that, State*.
- **Distractors must be plausible** — each wrong option should reflect a specific,
  realistic mistake (wrong formula, sign error, un-squared ratio, forgotten step).
- **Verify every answer by working it out.** The stated answer MUST be correct and
  MUST appear among the options for MCQ/HOQ.
- Spread difficulty: MCQ easy→medium, HOQ hard. Cover ALL the listed sub-topics
  (aim for a balanced spread across them).

### Notation (IMPORTANT — plain text only, NO LaTeX)
- Write math as plain readable text: fractions as `3/4`, powers as `x^2` or `x²`,
  roots as `√5`, multiply as `×`, divide as `÷`, `≤ ≥ ≠ ± ∞`, degrees as `°`,
  pi as `π`, angles as `∠`, triangle as `Δ`. **Never use LaTeX backslashes**
  (no `\frac`, `\times`, `\sqrt`).

### End the chapter with
1. **## Answer Key Summary** — three lines: `**MCQ:**` (1-X, 2-X, …15-X),
   `**FIB:**` (16-answer, …25-answer), `**TF:**` (26-True/False, …35),
   `**HOQ:**` (36-X, 37-X, 38-X).
2. **## Sub-topic Coverage Check** — a short bullet list mapping each sub-topic to
   the question numbers that cover it.

Begin now. Output only the chapter (title, the four sections with all 38
questions, the answer key, and the coverage check). Do not add commentary.

---

## Form 3 TIE Basic Mathematics chapters (verify against your TIE textbook TOC)

Run the prompt once per chapter. Typical Form 3 topics:

1. **Relations** — domain, range; graphs of relations; inequalities/regions
2. **Functions** — function vs relation; domain & range; linear & quadratic functions; inverse
3. **Statistics** — frequency tables; mean/median/mode; histograms & frequency polygons; cumulative frequency
4. **Sequences and Series** — arithmetic progression (AP); geometric progression (GP); nth term; sum of terms
5. **Circles** — parts of a circle; central & inscribed angles; chord/tangent properties; cyclic quadrilaterals
6. **The Earth as a Sphere** — latitude & longitude; great & small circles; distance along meridians/parallels; nautical miles
7. **Accounts** — ledger, journal, trial balance; profit & loss; simple book-keeping

> These are the commonly examined Form 3 topics. Adjust the list and the
> `{{SUBTOPICS}}` to match your exact TIE textbook contents before generating.
