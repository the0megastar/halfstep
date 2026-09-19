# Halfstep design standards

Start here before adding or changing a feature. Keep the current app's visual identity and use shared components/tokens wherever an established pattern exists.

## Current references

- [Refactor implementation plan](REFACTOR_PLAN.md): source review, architecture, staged migration and acceptance criteria.
- [Layout & Mobile](LAYOUT.md): spacing scale, mobile layouts, safe areas, content widths, breakpoints and touch targets.
- [Component catalog](COMPONENTS.md): canonical components, props/variants, button hierarchy, and interaction states.
- [Colors](COLORS.md): extracted light/dark theme values and proposed token migration.
- [Typography](TYPOGRAPHY.md): existing scale; reconcile noted discrepancies before expanding it.
- [Dropdowns](DROPDOWNS.md): established viewport geometry and panel anatomy.
- [Section headers](SECTION_HEADERS.md): section hierarchy and spacing.
- [Content & teaching voice](CONTENT.md): explain concepts (not the UI), reading level, unit wording, teaching-group structure.

## Recommended additions

Add documents when the corresponding shared behavior is implemented, not speculative specifications for unused components:

- `LAYOUT.md`: spacing scale, mobile layouts, safe areas, content widths, breakpoints and touch targets.
- `COMPONENTS.md`: links to canonical components, props/variants, interaction and error states, and examples. Include buttons, fields, stepper, popover, modal, gauge and history row.
- `ACCESSIBILITY.md`: keyboard/focus contracts, labels, contrast, zoom, reduced motion and screen-reader checks.
- `CONTENT.md`: **added** — teaching voice plus unit/approx contracts; expand later for dates/timezones and error strings.
- `DECISIONS.md`: dated accepted decisions, rationale and superseded rules. Separate product choices from external guidance.
- `examples/`: synthetic state fixtures and approved screenshots identified by viewport/theme/state. No real caregiver/patient records.

## Standard document template

Each standard should declare status (draft/accepted), scope, canonical implementation, token roles, states, mobile behavior, accessibility contract, validation checklist, references and last review date. Link to file paths without line numbers or machine-specific file URLs.

## Working agreement

1. Check the relevant standard and canonical component before writing new markup/CSS.
2. For a new pattern, state why an existing component cannot serve it; avoid one-off sizes/colors.
3. Document an accepted decision once and link to it. Do not copy subtly different requirements across files.
4. Update implementation, live specimen and relevant standard together.
5. Verify light/dark, narrow screens, keyboard, focus, long text and empty/loading/error states.
6. Clearly label Apple/Material/shadcn material as inspiration or an exact cited requirement. Halfstep owns its web-specific choices.

The app's executable tokens and components should be the styling source of truth; these documents describe intent and acceptance. The design-system page should demonstrate color pairs, typography, controls, overlays and states from real shared components. Keep it lazy-loaded and use synthetic fixtures.

## Refactor baseline

[Step 1 baseline](BASELINE.md) records checks, screenshots, reproduction instructions and reconciled standards. Use it before starting component extraction.
