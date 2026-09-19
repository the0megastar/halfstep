# Refactor Step 1 baseline

Captured September 12, 2026 on `v0.2.0` from the existing working tree. Step 1 changes documentation/tooling only; runtime source, prescribed arithmetic, IOB duration, version, URLs and IndexedDB schema are unchanged.

## Verification

- `npm test`: passed (dose, injection, and IOB test files).
- `npm run typecheck`: passed; command added to package scripts.
- `npm run build`: passed.
- Browser capture: isolated headless Google Chrome, America/New_York timezone, 375×900 and 1280×900 CSS-pixel viewports, both light and dark themes.
- 48 PNG captures in [examples/baseline](examples/baseline): empty/valid/low calculator, settings, empty IOB, empty history, form, confirmation, active history, void confirmation, active IOB, overlapping IOB.
- Synthetic records only: 1.5 U and 0.5 U, caregiver label “Example caregiver.” Created by the actual recording flow in fresh disposable browser contexts. Existing browser profiles and records were not accessed.
- Screenshots wait for fonts and entrance animations. Injection timestamps use capture time, so numeric timer text is not a pixel-deterministic test fixture.

These are reference captures, not an assertion that every current layout is approved or a completed accessibility audit. A 375px layout can expose crowded navigation; retain baseline defects as evidence and address them explicitly in the mobile refactor. Real iOS/Android keyboard, zoom, focus, screen reader and offline tests remain later acceptance work.

## Reproduction

Run a local preview on port 5176, then `node scripts/capture-baseline.cjs` in an environment providing Playwright and its browser. Playwright is not added as an application dependency in this step. A provided runtime can be resolved through `NODE_PATH`; `BASELINE_BROWSER` selects a local browser executable and `BASELINE_URL` overrides the localhost URL. Run from the repository root. The script replaces the reference images; inspect changes before accepting a new baseline.

## Standards reconciled

- Section headings use heading-14 consistently; label-13 is compact metadata/navigation text.
- Four locally loaded static font files are described accurately.
- The 25-tier count is consistent (10 + 6 + 6 + 3).
- Invalid copy-12 and accent shorthand references corrected to existing roles.
- Machine-specific file URLs replaced with repository-relative links.
- Exact type/spacing choices are labeled Halfstep decisions, not universal Apple/Material/shadcn requirements.
- Dropdown animation guidance now consistently allows vertical transforms.
- Existing extracted color inventory remains the baseline; no theme values changed.

## Next batch

Proceed to Step 2 of [REFACTOR_PLAN.md](REFACTOR_PLAN.md): extract shell/theme/navigation, settings and calculator views while comparing against these captures. Preserve records and behavior. Full shared overlay/mobile corrections belong to their planned batch, not an unreviewed visual change during extraction.
