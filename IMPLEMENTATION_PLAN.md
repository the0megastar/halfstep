# Halfstep: injection history, estimated IOB, and caregiver notifications

## Purpose and scope

Extend the existing Halfstep calculator into a clean, family-oriented MDI companion. Keep the current calculator as the main screen and reuse its visual design, light/dark themes, and Lucide icons. This document is a handoff specification for a developer; it does not authorize deployment, paid service signup, or sending real messages.

Build in phases. The first deliverable is a local prototype. The complete version adds authenticated shared records and optional SMS notifications. Do not change the existing prescribed dose arithmetic or automatically subtract IOB from calculated doses as part of this work.

## Existing implementation

- `src/App.tsx`: calculator interface, settings dropdown, theme controls, and top navigation.
- `src/index.css`: existing design system and responsive styling.
- `lib/dose.ts`: prescribed parameters, arithmetic, validation, and rounding.
- `tests/dose.test.mjs`: existing arithmetic tests.
- `public/sw.js`: offline service worker; currently broadly caches successful same-origin responses.
- `vite.config.ts`: React/Vite static build with relative base paths.
- `.github/workflows/deploy.yml`: tests, builds, and publishes to GitHub Pages on pushes to `main`.
- `lucide-react` is already installed. Use it rather than adding an icon library.

Inspect the current files and any applicable repository instructions before coding. Preserve unrelated work. Run existing tests and the production build after implementation.

## Agreed product direction

1. Add a History navigation icon opening injection history.
2. Add an IOB navigation indicator with a droplet, a circular countdown gauge, and estimated units.
3. Add an explicit "Record insulin given" action, followed by confirmation of actual administration details.
4. Track NovoLog injections, elapsed time, and estimated remaining IOB.
5. Support caregiver confirmation, eventually using server-verified authentication/PIN controls.
6. Eventually synchronize records and optionally notify one or both parents by SMS.

The user describes InPen as using a linear model and wants a simpler, better-looking interface. Exact equivalence to InPen's algorithm has not been independently verified. Do not claim equivalence or silently replace the proposed model with a custom physiological curve.

## Phase 1: local recording and history

### Navigation and panels

- Reuse existing navigation button styles and Lucide `History`, `Droplet`, and `Timer` icons as appropriate; verify exports in the installed package.
- History opens a panel grouped by local calendar day, newest administration first.
- Each row shows dose in units, administration time, and caregiver. Details expose corrections and voiding.
- Use a full-screen sheet on narrow screens and an appropriately sized panel/dialog on desktop.
- Maintain accessible names, focus management, Escape-to-close behavior, readable contrast, and keyboard operation. Do not rely on color alone.

### Recording flow

- Calculation never creates an injection record automatically.
- "Record insulin given" opens a form. Prefill a valid calculated dose, but require confirmation of the actual dose administered.
- Allow an independent manual entry when no calculation is available.
- Fields: actual units, administration date/time (default now), insulin type (NovoLog for this release), and caregiver label.
- Optionally retain a snapshot of entered glucose/carbs and the calculated dose, clearly distinguished from actual units.
- Validate finite positive units and valid timestamps; reject future administration times. Do not invent a clinical maximum dose. Use 0.5-unit increments, as requested; the minimum positive dose is 0.5 units. Enforce this in both the stepper and record validation.
- Prevent double-tap duplication with a stable record ID created once per submission.
- Allow backdated entries and corrections. Preserve original values and an audit trail; void incorrect records instead of silently deleting them.
- A caregiver label in the local prototype is attribution only, not authenticated identity. Do not present a browser-only PIN as security.

### Data model and persistence

Use a versioned record model suitable for later synchronization:

- Stable UUID, patient/family reference when applicable, and insulin type.
- Actual administered units and UTC administration timestamp.
- UTC creation/update timestamps, caregiver label locally, authenticated caregiver ID later.
- Optional calculation snapshot.
- Record revision and active/voided status, with append-only correction events.
- Synchronization metadata kept separate from clinical values.

Use IndexedDB for durable local records through a small storage abstraction. Handle storage failures explicitly. Do not store secrets in browser records, source files, or documentation. Explain in the prototype that records exist only on this device and are not shared or backed up by the app.

## Phase 2: estimated IOB and visual countdowns

### Proposed prototype model

Use a pure, independently tested linear function:

`remainingUnits = doseUnits * max(0, 1 - elapsedMs / durationMs)`

Validate positive finite duration and valid dose/time inputs before calculation. Future entries must not produce more IOB than the original dose. Keep full precision internally and round only for display.

Proposed prototype duration: 180 minutes. The user reports that the doctor permits dosing after three hours. Before clinical reliance, confirm that three hours is also the intended IOB modeling duration; those statements are not automatically equivalent. Until resolved, treat this as a prototype configuration, not a verified prescribed IOB parameter.

For a 1.5-unit example with this model: 1.5 U initially, 1.0 U at one hour, 0.5 U at two hours, and 0 U at three hours.

- Sum remaining units from all active, non-voided NovoLog records within the model window.
- Do not include long-acting insulin in this bolus IOB calculation.
- Isolate the model and identify its version/configuration. Do not change past-dose interpretation silently when settings change; define explicit migration behavior first.
- Do not automatically adjust the existing calculator using IOB.
- Missing or stale shared history must not be represented as a confidently complete zero. Distinguish "no recorded active injections" from confirmed completeness.

### Display behavior

- Label the number "Estimated IOB" and expose the configured duration in the expanded view.
- Show a separate gauge per injection: full at recording time for a current injection, proportionately reduced for a backdated injection, empty at the configured endpoint.
- Show both elapsed time and remaining modeled time in text.
- In the compact navigation, the ring represents the latest active injection's remaining time; the adjacent number represents total estimated IOB. Explain this distinction in the accessible label and expanded view.
- Multiple overlapping injections retain individual gauges. Do not invent a combined "full tank" scale for total IOB.
- At zero, use neutral wording such as "Modeled interval complete," not "safe to dose" or a claim that no biological effect remains.
- Recompute from timestamps on render/tick and after tab visibility changes. Never persist a decrementing counter as the source of truth. Reloads and suspended tabs must recover correctly.
- Use an injectable clock for deterministic tests. Flag material device-clock anomalies where practical.

### Model reference

Loop uses a documented exponential activity model with duration, peak, and delay parameters. It is useful background, not permission to invent a compressed three-hour curve. Any later model change is separate scope requiring a documented specification and validation.

- https://loopkit.github.io/loopdocs/operation/algorithm/prediction/
- https://loopkit.github.io/loopdocs/version/code-custom-edits/
- https://origin.medtronicdiabetes.com/customer-support/inpen-system-support/how-to-set-up-therapy-setting

## Phase 3: authentication and shared records

Choose the backend/database/authentication stack before this phase. Keep the client storage and IOB interfaces independent of the provider. A private repository with Cloudflare Pages is an available hosting direction; GitHub Pro with Pages is another. Neither repository privacy nor static hosting alone protects patient data shipped to browsers.

- Authenticate caregivers and authorize every record/settings operation within the correct family/patient scope.
- Use authenticated identity for attribution. If PIN confirmation is retained, verify it server-side, securely hash it, limit attempts, and define recovery behavior. Never embed a shared PIN in the frontend bundle.
- Store patient-specific settings behind authorization for the shared version; review existing embedded identifying information before publication.
- Use server timestamps for receipt/audit purposes while preserving the actual administration time.
- Synchronize through a durable offline queue with stable mutation IDs and server-side idempotency.
- Show pending, synced, failed, and last-sync states. Clearly indicate stale/incomplete history alongside IOB.
- Detect concurrent edits using revisions; surface conflicts instead of silently overwriting clinical records.
- A local pending record may contribute to the local estimate but must retain its pending status. Do not suggest other caregivers can already see it.
- Define device sign-out behavior, cache cleanup, and account switching so one family's records cannot appear in another session.
- Restrict `public/sw.js` to intentional application-asset caching. Exclude authenticated API responses and mutations from generic caching. Preserve deliberate offline data storage through the authenticated storage layer.

## Phase 4: optional SMS

Select a provider and review costs/setup before activation. Recipient numbers and credentials remain on the backend.

- Configure notifications to one parent, the other, or both.
- Enqueue notifications only after the server commits a confirmed injection record, ideally through a transactional outbox.
- Include actual dose, actual administration time with unambiguous timezone, and caregiver. Minimize unnecessary patient details.
- Separate record-save status from notification status.
- Deduplicate notifications using record/event identifiers. Retry transient failures without duplicating records; handle uncertain provider responses deliberately.
- Distinguish queued, provider-accepted, delivered (when confirmed), and failed statuses. Do not equate provider acceptance with delivery.
- Offline entries send only after synchronization, with wording that makes delayed/backdated administration clear.
- Corrections or voids to already-notified records generate clearly labeled updates.
- Test with mocks or provider test facilities. Real recipients and sending require explicit authorization.

## Suggested code organization

Adapt names to the repository rather than introducing a framework unnecessarily:

- `lib/injections.ts`: record types and validation.
- `lib/iob.ts`: pure linear model and aggregation.
- `lib/storage.ts`: versioned persistence interface and local implementation.
- `src/components/InjectionForm.tsx`: recording and confirmation.
- `src/components/HistoryPanel.tsx`: list, details, correction/void flow.
- `src/components/IobPanel.tsx` and `IobGauge.tsx`: aggregate and per-injection views.
- A small hook for persisted records and clock-driven updates.
- Backend API/authentication/sync/SMS modules once the provider is selected.
- Extend existing Node test conventions for pure logic; add an appropriate UI/integration test tool only when needed.

## Acceptance checks

### Local prototype

- Existing calculator tests still pass and prescribed arithmetic is unchanged.
- Recording requires explicit confirmation and persists through reload.
- Duplicate taps create one record.
- History correctly orders backdated entries; edits and voids update IOB while preserving audit details.
- Linear IOB passes start, midpoint, endpoint, after-endpoint, overlapping-dose, and fractional-unit tests.
- Invalid dose, duration, and timestamp inputs cannot create misleading estimates.
- Gauge/countdown recovers after reload or tab suspension; timezone/daylight-saving display does not change elapsed-time math.
- Empty history and local-only limitations are clear.
- Navigation works at narrow mobile widths, in both themes, and with keyboard/screen-reader labels.
- Production build succeeds.

### Shared release

- Unauthorized and cross-family reads/writes fail on the server.
- PIN attempt limits and session boundaries work.
- Offline replay and retries are idempotent; conflicts are visible.
- Stale/incomplete data is visibly identified beside IOB.
- Service-worker caches do not leak authenticated API data.
- SMS failures do not lose injection records; retry, correction, and delayed-entry scenarios are tested.
- Hosting, notification preferences, recipient verification, backup/retention behavior, and the IOB setting are resolved before release.

## Delivery sequence and handoff expectations

1. Implement Phases 1–2 as a local prototype using sample data for review.
2. Review the navigation, recording flow, gauge semantics, and model configuration with the owner.
3. Select services and implement Phase 3 with integration tests.
4. Implement Phase 4 with mocked/test notifications, then obtain authorization for real delivery and deployment.

At each milestone, report implemented behavior, tests/build results, remaining limitations, and full paths of changed files. Do not declare the local prototype equivalent to the finished multi-caregiver system. This plan adds features to the current app; it does not call for a rewrite.

## Version 0.2.0 implementation status

- Working branch: `v0.2.0`. Maintain standard repository branch names, commits, and release notes.
- Phase 1 implemented: Lucide history navigation, local NovoLog recording with review/confirmation, date-grouped history, corrections and voiding with preserved audit events, and IndexedDB persistence.
- Recording is available through the history panel and accepts manual doses or prefills the available calculator result. Caregiver names are unverified local labels.
- Storage failures are surfaced; stable submission IDs prevent duplicate creation retries, and revision checks reject concurrent overwrites.
- Version metadata is 0.2.0. Existing dosing logic is unchanged.
- Validation: arithmetic tests, injection validation/audit tests, TypeScript checking, and production build. Browser interaction and multi-tab persistence still require manual verification before release.
- Phases 2–4 remain unimplemented: no IOB calculation, authentication/PIN, shared history, or SMS.
- No commit, push, deployment, or real notification is part of this implementation milestone.

## Phase 2 local implementation

- Added timestamp-based three-hour countdowns and linear estimated IOB for recorded, non-voided NovoLog injections.
- Navigation displays total local estimated IOB and the latest active injection's countdown ring; history displays each injection's remaining time and modeled units.
- Completed records remain in history with an interval-complete label. Clock updates recover after backgrounding; future timestamps show an unavailable/check-time state.
- The three-hour value is a prototype model setting, pending the therapy-setting confirmation described above. This does not change dosing arithmetic.
- Automated model tests and production/type checks are included. Browser layout and interaction verification remain required before release.

## Additional requirement: maximum insulin warning threshold

- Add a configurable maximum-dose warning threshold to recording and correction flows. The owner reported that a 10-unit entry currently receives no warning.
- Obtain the intended threshold from the owner/clinical plan; do not infer that 10 units is the approved threshold or invent a maximum.
- Decide whether reaching or exceeding the threshold triggers the warning, and whether it requires extra confirmation or blocks saving. Prefer explicit review of unusually large entries without silently changing actual administered doses.
- Apply the same rule to new and corrected records, display units clearly, and test boundary values. Keep existing half-unit validation.
- This requirement is recorded but not implemented until the threshold and behavior are specified.

## Refactor before further feature expansion

See [the refactor and design-system plan](design-standards/REFACTOR_PLAN.md) for the current source review, component/data boundaries, incremental migration, mobile acceptance checks and CSS consolidation. See [design standards](design-standards/README.md) and [the extracted color inventory](design-standards/COLORS.md). This is a planning addition; it does not change implemented behavior or supersede unresolved therapy/maximum-dose settings.
