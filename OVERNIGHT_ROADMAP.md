# Overnight roadmap (2026-09-15)

Owner is offline ~8 hours. This document locks scope for overnight coding and later backlog. It supplements, does not replace, `IMPLEMENTATION_PLAN.md` and `design-standards/REFACTOR_PLAN.md`.

## Product intent (near term)

Keep Halfstep a private, offline-capable pediatric MDI arithmetic double-checker. Expand toward a more native phone-app navigation model and clearer clinical previews, without claiming automated dosing advice or closed-loop control.

## Overnight in scope (v0.2.x)

1. **Polish** — Commit pending cleanup (unused Tailwind/clsx utilities removed), keep tests/typecheck/build green, push `v0.2.0` so cloud work can continue from GitHub.
2. **Maximum-dose warning** — Implement as specified below (configurable; provisional default).
3. **App-like mobile navigation/UI** — Bottom tab bar + full-screen sheets for primary flows; keep Glyph visual identity.
4. **Estimated glucose after dose** — Pure estimate from prescribed ISF and carb ratio; show next to calculator results with clear limitations.

## Explicitly out of overnight scope (backlog)

| Idea | Target | Notes |
| --- | --- | --- |
| Vial / pen inventory, expiry, change reminders | v0.3 | Needs notification channel decision |
| Non-linear IOB (Loop-style activity curve) | v0.3 | Replace linear 3h prototype with documented model + tests |
| Dexcom / Nightscout / CGM projection | v0.4+ | API auth, privacy, offline rules |
| Sugarmate-like feature breadth | later | Do not dilute v0.2.x |

## Maximum-dose warning — definition

### Goal
Surface unusually large NovoLog entries before they are saved, without silently changing the recorded dose.

### Rules
- Setting key: `maxDoseWarningUnits` (number, half-unit steps, stored with other local settings).
- **Provisional default: `5.0` units.** This is an engineering default so the feature works overnight. It is **not** a clinically approved threshold. Settings UI must label it: “Provisional — confirm with care plan.”
- Trigger when entered dose **≥** threshold (inclusive), on both **create** and **correct** flows.
- Behavior: **extra confirmation**, not a hard block. After the user confirms, save proceeds with the entered dose unchanged.
- Copy shape: “This dose is at or above your warning threshold of {threshold} units. Confirm you meant to enter {dose} units.”
- Keep existing half-unit validation and all other injection validation.
- Invalid / missing threshold falls back to provisional default; never invent a second silent clinical maximum.
- Unit tests: boundary at threshold−0.5 (no warn), threshold (warn), threshold+0.5 (warn); create and correct paths.

### Owner follow-up on wake
Confirm or change the provisional `5.0` default and whether ≥ vs > is preferred (overnight implements ≥).

## Estimated glucose after dose — definition

### Goal
Show where blood glucose is **estimated** to land if the entered carbs are absorbed and the entered/recommended insulin acts fully, using Roman’s prescribed ISF and carb ratio only.

### Formula (v1, IOB-agnostic)
Using prescribed `CR` (g/U), `ISF` (mg/dL per U), current glucose `G`, carbs `C`, insulin dose `D` (units):

```
carbRise = (C / CR) * ISF
insulinDrop = D * ISF
estimatedGlucose = G + carbRise - insulinDrop
```

Examples with CR=35, ISF=135:
- G=235, C=0, D=1 → 235 + 0 − 135 = **100**
- When D equals the calculator’s food+correction total, estimate trends toward the prescribed target (~150) under the same assumptions.

### Display
- Place near dose result / breakdown on the calculator.
- Label: “Estimated glucose after this dose”
- Subtext: “Uses carb ratio and ISF only. Does not include active IOB, absorption timing, or exercise.”
- Hide or show “—” when inputs incomplete; never treat empty as zero.
- Do **not** auto-adjust the recommended dose from this estimate in v1.
- Pure function + unit tests in `lib/`; UI consumes the result.

## App-like navigation — definition

### Current pain
Primary actions live in top-bar dropdowns/popovers. As features grow, that fights iOS/Android mental models (tabs + sheets).

### Target (mobile-first)
- **Bottom tab bar** (safe-area aware, 44px+ targets):
  - **Calculate** — existing calculator
  - **History** — injection history as a primary destination (not only a dialog)
  - **Settings** — prescribed params, theme, max-dose threshold, IOB model note
- Keep brand mark in a compact top bar; move IOB summary to Calculate header or a compact chip (not a third competing popover pattern).
- On narrow viewports, prefer **full-screen sheet / page** for record → confirm → details → void over nested popovers.
- Preserve query-URL / Back-Forward behavior where it already exists; update `useAppView` rather than adding a heavy router.
- Desktop (≥1280): tabs or side nav OK if it reuses the same destinations; do not regress calculator layout.
- Preserve light/dark Glyph tokens; this is navigation IA, not a visual redesign.
- Accessibility: selected tab state, labels, focus return from sheets.

### Non-goals tonight
No authentication chrome, no CGM charts, no new therapy parameters beyond max-dose setting.

## Delivery order for cloud agents

1. Push polished `v0.2.0` baseline.
2. Max-dose warning + estimated glucose (domain + calculator/injection UI + tests).
3. Bottom-tab navigation / sheet migration (UI structure), preserving behavior and tests.

## Acceptance (overnight)

- `npm test`, `npm run typecheck`, `npm run build` pass.
- Existing dosing arithmetic unchanged.
- Max-dose and estimate behaviors match definitions above.
- Mobile 375px: no horizontal overflow; tabs usable; history reachable without hunting dropdowns.
- PR(s) against `v0.2.0` with clear summary of what still needs owner confirmation (threshold number; optional nav tweaks).

## References

- `IMPLEMENTATION_PLAN.md` — phases 1–4, IOB caveats, acceptance
- `design-standards/REFACTOR_PLAN.md` — completed modularization
- Loop activity model (later IOB): https://loopkit.github.io/loopdocs/operation/algorithm/prediction/
