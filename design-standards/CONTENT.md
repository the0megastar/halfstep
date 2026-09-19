# Halfstep Design Standard: Content & Teaching Voice

Status: accepted. Captured September 16, 2026 from the Learn the Math intro work on `v0.2.0`.

This is how Halfstep talks — in the calculator, History, settings, alerts, and teaching copy. Visual hierarchy still follows [TYPOGRAPHY.md](TYPOGRAPHY.md) and [SECTION_HEADERS.md](SECTION_HEADERS.md). This document owns **what the words do**.

---

## 1. The core rule

**Explain the idea. Do not narrate the interface.**

Teaching copy teaches the clinical or arithmetic concept. It is not a tour of what the user is about to see on screen (“First see…”, “Then use the cards below…”, “In this section…”).

Canonical specimen (Learn the Math intro):

> A dose is built from two amounts: food coverage for carbs, and correction when glucose is above target. Add them for a total, then round that total to a half unit so it matches what the syringe can deliver.

That sentence:

- Names the real parts (food coverage, correction, half unit)
- States the relationship (add, then round)
- Gives a reason (syringe can deliver)
- Never points at the UI

Use this bar for every new teaching blurb, empty state that teaches, and section intro.

---

## 2. Reading level (without dumbing down)

Write so a sharp seventh grader or early high-schooler can follow on first read — **without stripping clinical vocabulary**.

| Do | Don’t |
| --- | --- |
| Short sentences. Concrete subjects. Active voice. | Long stacks of clauses and hedges |
| Keep terms caregivers must learn: food coverage, correction, ISF, half-unit, IOB | Replace them with cutesy euphemisms |
| Magazine / newspaper clarity: one idea per sentence, then the next | Marketing fluff (“simple”, “easy”, “anyone can”, “predictable”) |
| Empower the learner | Imply they should already have known this |

Diabetes math is not “simple.” Halfstep exists because the work is real. Tone = guide beside you, not cheerleader and not lecturer.

---

## 3. Section structure for teaching groups

When a card teaches more than one step (e.g. Learn the Math):

1. **Group title** — Title Case, `.text-heading-16`
2. **One concept intro** — `.text-copy-13` muted; explains the whole idea (rule §1)
3. **Step titles only** — `.text-heading-14`; no per-step subtitles that repeat the intro
4. **Artifacts** — formula, rule cards, examples

Avoid heading → subtitle → heading → subtitle stacks. One intro, then labeled content.

---

## 4. Numbers and wording contracts

| Topic | Rule |
| --- | --- |
| Teaching amounts | Use plain numbers at **2 decimal places** (`formatTeachingUnits` / `formatTeachingAmount`). No `≈` in teaching sentences. |
| Unit vs units | Singular **unit** for `0.5` and `1`; plural **units** otherwise (`unitWord`). |
| Dose hero | Prefer “Before rounding:” over “Exact math:” when showing the unrounded total. |
| Em dashes | Prefer periods or commas. Full sentences over dash-chained fragments. |
| All-caps | Only short status chips (`ACTIVE`, `LOCKED`, `COMPLETE`, `VOIDED`). Never section titles or multi-word eyebrows. |
| Calculator steps | Quiet Title Case `Step 1` / `Step 2` / `Step 3` (`.text-label-12` accent). Not `STEP 01`. Path: Enter the numbers → Calculated Dose → Learn the Math. |
| Rounding examples | Full `e.g.` lines may hide on phone (≤600px) when three-across cards must stay even height; keep on ≥601px. |

---

## 5. How the Math Works (live sentence)

Low-glucose branch: state the gate and that Halfstep does not suggest insulin, then **follow your hypoglycemia plan**. Never prescribe treatment amounts, juice, or recheck timers — Halfstep is math, not medical advice.

Over-max dose: show the full half-unit math (including before-rounding). Add a warning to confirm the numbers because the result is above the locked maximum. Do not use red NO DOSE for over-max (that pattern is for low glucose only). Do not silently cap to max. Logging a dose above max stays blocked.
Large-carb gate: confirm the count only — no “trust the suggested dose” language. Threshold lives in `patient.ts` (`highCarbsGrams`).


The dynamic teaching paragraph under Calculated Dose bridges **this** calculation to the idea: live glucose/carb numbers, two-decimal teaching amounts, no `≈`, no “enter above” UI narration, then half-unit rounding. Prefer “The dose is X. Food coverage is… Correction is… Those add to… before half-unit rounding.”

Body token: `.text-copy-13` (same as the Learn the Math concept intro).

---


---

## 6. Settings teaching card (“How These Numbers Work”)

Settings explains the locked care-plan numbers the same way Learn the Math does: **ideas, not chrome**.

Structure (Apple Settings footnote rhythm):

1. **Card title** — Title Case, `.text-heading-16`, with clear space above the body
2. **Short paragraphs** — one idea each; `.text-copy-13` muted; flex column with ~14px gap; max-width ~34rem so lines stay readable
3. **Optional footnote** — dimmer, smaller, under a light rule; care-plan provenance only (no file paths, no “edit `patient.ts`”, no “toggle in Settings”)

Do:

- Name the real parts (carb ratio, ISF, food coverage, correction, half unit, IOB, max dose, low gate)
- Keep clinical vocabulary; short sentences
- Let the segmented control or locked list speak for itself — no “Choose light…” helper under Appearance

Don’t:

- Narrate the UI (“choose…”, “tap…”, “in this section…”)
- Point developers at source files in caregiver-facing Settings
- Put the patient name in the page intro (Name already appears in Locked Insulin Parameters)

Place the card **immediately under Locked Insulin Parameters** (Apple Settings / Material preference-group footer). Appearance stays after, not between.

Live specimen: `src/pages/SettingsPage.tsx` + `.settings-teaching` in `src/styles/layout.css`.

## 7. Checklist before shipping copy

- [ ] Does this explain a concept, or only point at the UI?
- [ ] Would a high-schooler follow it without feeling talked down to?
- [ ] Are clinical terms intact where the learner needs them?
- [ ] Any `≈` fighting the word “exact”?
- [ ] Unit/units correct for 0.5 and 1?
- [ ] Any all-caps section label or em-dash slogan left over?
- [ ] Typography tokens used (no ad-hoc rem for teaching text)?
- [ ] Settings helpers: concept only — no “choose / tap / in this section” under controls?
- [ ] Settings page intro omits the patient name (name lives in Locked rows)?

---

## 8. References

- Live specimen: Learn the Math block in `src/features/calculator/ClinicalFormula.tsx`; Settings teaching in `src/pages/SettingsPage.tsx`
- Helpers: `formatTeachingUnits`, `formatTeachingAmount`, `unitWord` in `lib/dose.ts`
- Related: [CALCULATOR_MATH.md](CALCULATOR_MATH.md), [SECTION_HEADERS.md](SECTION_HEADERS.md), [TYPOGRAPHY.md](TYPOGRAPHY.md)
