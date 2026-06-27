# Soma AI — Curriculum & Quiz Build Plan

Build the full Tanzania NECTA O-Level curriculum (13 subjects × Forms 1–4) and
quizzes into Firestore project **`tanza-9b182`**, one unit at a time.

## Per-unit definition (one subject × one form)
1. Research the official **NECTA / TIE syllabus** chapter list → 8–12 topics.
2. For each topic, author **5 packs** (original questions, NECTA-aligned):
   | Pack | type | count | XP |
   |---|---|---|---|
   | MCQ | `mcq` | 15 | 15 |
   | Fill-in-blank | `fib` | 10 | 10 |
   | True/False | `tf` | 10 | 10 |
   | Summary | `summary` | 10 | 10 |
   | Higher-order | `hoq` | 3 | 30 |
   ≈ **48 items/topic**.
3. Seed topics + packs + questions via the Admin SDK (`scripts/seed-admin.mjs`
   pattern), preserving existing content. IDs: `form_{n}_{subject}_topic_{k}`,
   packs `…_topic_{k}_pack_{p}`, questions `…_q_{i}`.
4. Verify counts, commit a per-unit content file, mark the unit done below.

## Question schema (questions collection)
```
{ id, formId, subjectId, topicId, learningPackId, type,
  questionText, options:[{id,text,isCorrect}] (MCQ/HOQ only; [] for FIB/TF),
  correctAnswer,            // MCQ/HOQ: option id "a".."d" | FIB: literal | TF: "true"|"false"
  explanation, difficulty:'easy'|'medium'|'hard', xpReward,
  order, isActive:true, isPremium, createdAt, updatedAt }
```

## Build order
> Form 1 first (most users), core subjects before optional; then Forms 2→4.
> Math Form 1 is already complete (9 topics, 342 questions).

### Form 1
- [x] 1. Biology — Form 1 ✅ (6 topics, 30 packs, 228 questions + summaries — seeded to tanza-9b182)   ← **template unit complete**
- [x] 2. Chemistry — Form 1 ✅ (7 topics, 35 packs, 266 questions — seeded to tanza-9b182)
- [x] 3. Physics — Form 1 ✅ (9 topics, 45 packs, 342 questions — seeded to tanza-9b182)
- [x] 4. English — Form 1 ✅ (8 topics, 40 packs, 304 questions — seeded to tanza-9b182)
- [x] 5. Kiswahili — Form 1 ✅ (8 topics, 40 packs, 304 questions — seeded to tanza-9b182)
- [x] 6. Geography — Form 1 ✅ (8 topics, 40 packs, 304 questions — seeded to tanza-9b182)
- [ ] 7. History — Form 1
- [ ] 8. Civics — Form 1
- [ ] 9. Commerce — Form 1
- [ ] 10. Agriculture — Form 1
- [ ] 11. Computer Studies — Form 1
- [ ] 12. Islamic Knowledge — Form 1
- [x] —. Mathematics — Form 1 (already seeded: 9 topics, 342 questions)

### Form 2
- [ ] 13. Mathematics — Form 2
- [ ] 14–25. Biology, Chemistry, Physics, English, Kiswahili, Geography, History, Civics, Commerce, Agriculture, Computer Studies, Islamic Knowledge — Form 2

### Form 3
- [ ] 26–38. All 13 subjects — Form 3

### Form 4
- [ ] 39–51. All 13 subjects — Form 4

## Content integrity
- Questions are **authored original**, aligned to the public syllabus topic
  outline. No textbook text is copied.
- Each subject's correctness should ideally get a subject-expert review pass
  before publishing to students.
