# Refactor and design-system implementation plan

Status: draft for incremental implementation. Reviewed September 12, 2026 against the current working tree. This is a refactor plan, not a redesign or a change to therapy settings. Preserve the current uncommitted work and branch naming/attribution preferences.

## Findings and priorities

| Evidence | Consequence | Priority |
| --- | --- | --- |
| `src/App.tsx` is 614 lines and owns theme, query-string navigation, settings dismissal, calculator state, and markup | Independent features change the same file | High |
| `src/components/InjectionHistory.tsx` is 408 lines and owns persistence, clock updates, IOB selectors, two overlays, form workflow, and rendering | Storage and UI changes are coupled; whole feature rerenders each second | High |
| `src/index.css` is 3,004 lines with theme, layout, controls, feature styles, typography/specimen rules, repeated overrides and `!important` | Visual fixes depend on cascade order and are difficult to reuse | High |
| Settings and IOB duplicate outside-click/Escape handling; geometry is already shared by `useDropdownBoundary` | Positioning is centralized, but interaction/focus behavior is not | High |
| `TypographySpecimen.tsx` is 571 lines, imported directly by App | Developer reference content is coupled to the main application | Medium |
| Domain functions already live in `lib/dose.ts`, `lib/injections.ts`, and `lib/iob.ts` | Good existing separation to preserve | Preserve |
| IndexedDB access is isolated, but UI consumes it directly | Future synchronization and storage testing need an explicit repository contract | Medium |
| Service worker broadly caches successful same-origin responses and clears caches by unequal name | Needs a separate offline/update review before authenticated APIs | Before shared release |

These are source-review findings, not a completed mobile or accessibility audit. File length is a signal, not a target: split by responsibility and change frequency, not arbitrary line limits.

## Target boundaries

Keep React/Vite and the current visual identity. Do not add a router, global state library, or component framework simply to perform this refactor.

| Area | Proposed files | Responsibility |
| --- | --- | --- |
| App composition | `src/App.tsx`, `src/app/AppShell.tsx`, `src/app/useAppView.ts`, `src/app/useTheme.ts` | Compose providers/pages; preserve query URLs, Back/Forward and theme behavior |
| Pages | `src/pages/CalculatorPage.tsx`, `src/pages/DesignSystemPage.tsx` | Page-level composition; history remains an overlay unless navigation requirements change |
| Settings | `src/features/settings/SettingsPopover.tsx` | Own settings content; consume shared overlay behavior and prescribed parameter data |
| Calculator | `src/features/calculator/CalculatorInputs.tsx`, `DoseResult.tsx`, `DoseBreakdown.tsx` | Cohesive UI blocks; calculate through existing pure domain functions |
| Injection data | `src/features/injections/useInjectionRecords.ts`, `lib/storage.ts` | One shared record source, refresh/save status and repository access |
| Injection workflow | `src/features/injections/useInjectionWorkflow.ts`, `InjectionHistoryDialog.tsx`, `InjectionForm.tsx`, `InjectionConfirmation.tsx`, `InjectionDetails.tsx`, `InjectionList.tsx` | Explicit transitions and views; preserve correction/void audit behavior |
| IOB | `src/features/iob/useIobSummary.ts`, `IobPopover.tsx`, `IobBadge.tsx`, `IobGauge.tsx`, `useClock.ts` | Derive total/latest/contributing records; isolate ticking from forms and history shell |
| Shared UI | `src/components/ui/Popover.tsx`, `Dialog.tsx`, `IconButton.tsx`, `SectionHeader.tsx` | Reused interaction/layout contracts; no dose or storage rules |
| Styles | `src/styles/tokens.css`, `base.css`, `typography.css`, plus feature-owned styles | Explicit import order; no duplicate ownership |

Each dropdown gets its own feature component, backed by one shared popover primitive. Each actual page gets a page component; not every card needs a separate file. Small single-use helpers can stay next to their caller. Pure functions should not import React, read storage, or render UI. Views receive values/callbacks and do not perform database operations.

## Implementation batches

### 1. Capture baseline and reconcile standards

- Record screenshots with synthetic records: calculator empty/valid/low alert, settings, IOB empty/active/overlap, history, form, confirmation and void states; light/dark at mobile and desktop sizes.
- Run existing tests, `npx tsc --noEmit`, and `npm run build`. Add a package typecheck script as part of tooling cleanup.
- Preserve version, URLs, IndexedDB database/store/schema, stored records, arithmetic, and three-hour model behavior.
- Reconcile typography discrepancies before changing visual output: the scale says 25 tiers but lists 10+6+6+3 = 25; its section-header example uses label-13 while SECTION_HEADERS specifies heading-14. Adopt the latter for that role and update both references together.
- Correct the description of the locally loaded fonts: four separate static weight files are present, not one variable font.
- Mark precise Apple/Material/shadcn size/weight claims in SECTION_HEADERS as Halfstep choices unless verified against a specific source/version. Do not present inspiration as a mandatory cross-platform specification.
- Replace `file://` links and hardcoded line anchors in standards with repository-relative links.

Acceptance: documented baseline and one consistent standard for each role. No visual change in this batch.

### 2. Extract application shell and feature views

- Move theme effects and query navigation into small hooks; handle unavailable localStorage without crashing startup.
- Extract settings, calculator page and its cohesive blocks. Derive prescribed settings displays from `ROMAN` rather than repeating values in JSX where practical; preserve wording and math.
- Lazy-load the design-system page and move specimen examples into data-driven sections. Preserve direct-link and Back/Forward behavior. Decide separately whether the public navigation should expose this reference page.
- Retain a narrow compatibility adapter for the current imperative record action while moving ownership. Avoid a large ref API.

Acceptance: UI baseline remains stable; App primarily composes features; existing links and recording from calculator still work.

### 3. Separate records, workflow, and time

- Create one record provider/hook at the nearest shared owner for IOB and history. Do not fetch independently in every dropdown.
- Define a repository interface (`list`, `save` with expected revision) with the existing IndexedDB adapter. Retain idempotency and revision checks. Add persisted-data validation and explicit unsupported-version/error states without deleting records.
- Model workflow as a discriminated union/reducer: history, creating/editing, reviewing, details, confirming-void, saving/error. Prevent impossible combinations of selected record and view. Preserve stable submission IDs.
- Store selected record ID rather than a stale object when appropriate; preserve the edited revision for conflict detection rather than silently adopting refreshed changes.
- Split refresh failure, load state, and save errors. A refresh failure must not masquerade as a failed successful save. Guard overlapping reads/unmounts and ensure older responses cannot replace newer records.
- Extract pure grouping/IOB selectors and local date conversion helpers; use explicit injected time in tests.
- Keep clock updates in IOB consumers. Displayed minutes can update at minute boundaries; ring updates may use a modest cadence. Recompute on visibility/focus and at expiry; never accumulate decrements.
- Consider BroadcastChannel for same-origin tab change notifications with focus refresh fallback. It is not multi-device synchronization.

Acceptance: one consistent record source; no duplicate submission; corrections/voids update IOB; external changes cannot silently overwrite edits; a running clock does not reset forms or focus.

### 4. Unify overlays and mobile behavior

- Keep separate semantic primitives for a nonmodal informational popover and a modal form dialog. Do not apply menu roles to settings/IOB content.
- Reuse `useDropdownBoundary` for current anchored panels. Extend geometry deliberately for visual viewport changes, nested scrolling, safe areas and vertical collisions; current hook only clamps horizontal document coordinates.
- Coordinate overlays so opening one navigation popover closes the other. Escape closes the topmost surface; return focus to the appropriate trigger.
- For modal dialogs, ensure initial focus, contained tab sequence, background inertness, accessible title and visible close/cancel controls. Define unsaved-draft dismissal behavior explicitly.
- For nonmodal popovers, use appropriate focus entry/dismissal without trapping focus as if modal. Prefer pointer events over mouse-only outside handling.
- Proposed Halfstep touch standard: at least 44 CSS-pixel targets, preferably 48 where space allows. These are web product choices, not a claim that CSS pixels equal native points/dp.
- Use safe-area padding, `dvh`/available viewport height, scrollable content and reachable actions with the keyboard open. Keep dose controls and focus visible at 200% zoom. Avoid fixed form heights that clip enlarged text.
- Keep critical input text at least 16 CSS pixels; preserve the existing 12px metadata floor but prefer 14–16px for instructions. Do not shrink clinical information merely to fit navigation.
- At narrow widths prioritize readable values; compact secondary navigation or use a wrapping/adaptive arrangement instead of smaller targets.
- Preserve reduced-motion support. Do not announce per-second countdown changes through live regions; announce meaningful saves/errors instead.

Acceptance: 320, 375, 390, 430, 768 and desktop widths; short landscape height; both themes; keyboard and touch; no clipped panels or horizontal page overflow; test Safari/iOS and Chrome/Android behavior on real devices when available.

### 5. Consolidate design tokens and CSS

- Use COLORS.md as the initial extracted palette inventory. Move active Glyph variables unchanged into tokens.css before altering values.
- Add semantic roles for warning, focus, disabled, overlay, timer track and timer progress where currently hardcoded; approve contrast-tested values separately.
- Preserve theme variable inheritance when portaling overlays: tokens currently live on `.site.glyph`, so a body portal will lose them unless theme scope moves or is reapplied.
- Split stylesheet by foundation and feature ownership with documented import order. Consolidate identical selectors only after checking cascade and screenshots.
- Audit legacy alternate-theme selectors and duplicated public/src font assets for actual references before removal. A comment naming an older theme is not proof its rules are unused.
- Retain useful accessibility overrides; reduce `!important` by fixing specificity, not blanket deletion.
- Prefer semantic classes/tokens. Do not require shadcn installation or a Tailwind rewrite. If a primitive library is later needed, adopt it for tested interaction behavior and map its colors to Halfstep tokens.

Acceptance: unchanged approved screenshots, explicit CSS ownership, no lost offline font references or portal theme regressions.

### 6. Verification and release readiness

- Pure tests: selectors, time boundaries, date conversions, workflow transitions, validation and existing arithmetic.
- Repository integration tests: persistence/reload, failed and aborted transactions, concurrent revisions, idempotent creation, unsupported data. Use an IndexedDB test adapter where appropriate, plus real browser checks.
- Browser tests: record/review/save, edit, void, overlap timers, Back/Forward, focus return, viewport clamping, storage failure. Use synthetic data only.
- Add a small visual regression suite for representative states, rather than snapshots of every component.
- Separate service-worker improvements into their own change: only intended GET assets, owned cache prefixes, predictable update/offline behavior, and API exclusion before backend work.
- Run tests, typecheck and build after each batch. Keep extraction, behavior fixes, and visual redesign separately reviewable.

## Out of scope and dependencies

No new dosing algorithm, IOB subtraction, authentication, SMS, or clinical threshold value is introduced by this refactor. Preserve the maximum-dose warning requirement from IMPLEMENTATION_PLAN.md; threshold and confirmation/block behavior remain unresolved. The architecture should allow that rule to live in domain validation and render through shared warning/form patterns once specified.

## References and how to use them

- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines): reference for platform interaction and clarity; detailed accessibility page requires JavaScript and was not fully retrievable during this review.
- [Material foundations](https://m3.material.io/foundations/): reference for adaptive layout and token organization; preserve Halfstep's visual language.
- [shadcn theming](https://ui.shadcn.com/docs/theming): semantic color roles with corresponding foreground roles. This is useful without adopting the library.
- [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): browser-specific focus, keyboard and modality behavior.

Use web accessibility requirements as the implementation baseline and external design systems as references. Do not mix three systems' default component styling into one interface.

## Step 1 execution record

Step 1 baseline and documentation reconciliation completed September 12, 2026. See [BASELINE.md](BASELINE.md) for validation and 48 reference captures. `npm run typecheck` is available. No runtime source or therapy settings changed. Screenshot acceptance and real-device accessibility checks are separate from capture; Step 2 extraction is next.

## Steps 2–6 execution record

Completed September 12, 2026:
- **Batch 2 (App Shell & Feature Views)**: Extracted `src/app/useTheme.ts`, `src/app/useAppView.ts`, `src/app/AppShell.tsx`, `src/features/settings/SettingsPopover.tsx`, `src/features/calculator/CalculatorInputs.tsx`, `DoseResult.tsx`, `DoseBreakdown.tsx`, `ClinicalFormula.tsx`, `src/pages/CalculatorPage.tsx`, and lazy-loaded `src/pages/DesignSystemPage.tsx`. Preserved URL query parameters, Back/Forward popstate history, and zero therapy parameter changes.
- **Batch 3 (Records, Workflow & Time)**: Extracted `src/features/injections/useInjectionRecords.ts` with in-flight race condition guards, optimistic revisions, and BroadcastChannel sync; created reducer-based `useInjectionWorkflow.ts`; isolated clock ticking via `useClock.ts` and derived pure selectors via `useIobSummary.ts`. Extracted focused injection workflow views (`InjectionHistoryDialog`, `InjectionList`, `InjectionForm`, `InjectionConfirmation`, `InjectionDetails`, `InjectionVoidConfirmation`).
- **Batch 4 (Overlays & Mobile Behavior)**: Unified overlay coordination with `useOverlayManager.ts` (mutual popover exclusion, Escape handling with trigger focus restoration). Extended `useDropdownBoundary.ts` with visual viewport and safe-area support. Implemented standard `SectionHeader.tsx` and 44px+ touch boundaries on all interactive elements.
- **Batch 5 (Design Tokens & Modular CSS)**: Modularized `src/index.css` into `tokens.css`, `base.css`, `typography.css`, `layout.css`, `calculator.css`, `dropdowns.css`, `dialog.css`, and `specimen.css`. Cleaned dead `.glass` and `.design-switcher` selectors. Ensured `:root` and `html[data-theme]` token inheritance for top-layer modal dialogs.
- **Batch 6 (Verification & Standards)**: All 28 automated tests pass (`npm test`). Full TypeScript validation passes (`npm run typecheck`). Production build succeeds (`npm run build`). Automated browser verification confirmed calculator input, dose calculation, settings popover, IOB popover, record-dose workflow, audit history, theme switching, and responsive 375px mobile viewport without horizontal overflow. Standards documented in [LAYOUT.md](LAYOUT.md) and [COMPONENTS.md](COMPONENTS.md).

