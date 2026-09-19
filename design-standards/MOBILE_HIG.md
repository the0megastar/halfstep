# Mobile interaction references (Halfstep)

Halfstep keeps its **Glyph** visual system (Manrope typography tiers, existing light/dark tokens in `src/styles/tokens.css`). External HIGs inform **navigation and interaction**, not a restyle.

## Sources

- Apple Human Interface Guidelines — tabs, sheets, safe areas, 44pt targets
- Material 3 — bottom navigation, semantic color roles
- Meta HorizonOS — spatial clarity and focus affordances as a secondary reference for headset/TV-scale later; phone UI remains primary

## Phone dose density

On narrow phones (≤600px), secondary calculator content uses compact rows so dose, expected glucose, food coverage, and correction stay reachable without hunting:

- Estimated glucose sits on one row (label + value); long disclaimer becomes a one-line note
- Food / Correction use dense list rows (title · formula · units) instead of tall cards
- “How the Math Works” stays expanded; body uses `.text-copy-13` (same as Learn the Math intro)
- See [CALCULATOR_MATH.md](CALCULATOR_MATH.md) for Apple-HIG-aligned card hierarchy
- Touch targets on primary controls stay ≥44px; density applies to **read-only** math chrome

## Adopted patterns

- **PageHeader** (`src/components/ui/PageHeader.tsx`): pass `title` + `intro` (+ optional `titleId`). Shared left edge and spacing for Calculate / History / Settings. New tabs should use it instead of hand-rolled headings.
 in v0.2.x

- Bottom tab bar: Calculate · History · Settings (History uses ClipboardList, not a clock)
- Appearance: Light / Dark / Automatic lives in Settings only (no top-nav theme toggle)
- **Settings page order**: Locked Insulin Parameters first → How These Numbers Work directly under it (Apple/Material group footer pattern) → Appearance last (segmented control, no helper blurb). Do not split locked values from their teaching with Appearance.
- **Settings teaching card**: Apple Settings–style footnote spacing — see [CONTENT.md](CONTENT.md) §6
- Page titles: no ALL CAPS eyebrows; title + muted intro sentence
- **History page inset**: title, intro, Record CTA, and list share the workspace gutter with Settings — no narrower centered column on the History panel

- **History header**: same as Settings — `History` + short intro (`Local only. Entries stay on this device.`). No all-caps Local Only eyebrow; no second privacy blurb under the list on the page variant.
- **History Record CTA**: full-width primary under the intro, before the list (tab-root has no top-nav +). Height matches `.btn-primary` (46px, ≥44 HIG). Label is the action (`Record Insulin Given`), not UI tour copy.
- **History is a tab root view**, not a modal with an X (Apple tab destinations / Material bottom-nav peers / shadcn Dialog reserved for interruptions). Record-from-calculator switches to the History tab and opens the form there.
- **Bottom tab theming**: bar uses `--bg-surface` + `--border-subtle`; unselected `--text-muted` (regular), selected `--text-main` + bold label/heavier icon stroke, **no** filled pill (Apple-leaning; not Material active-indicator). Must follow `data-theme` — never hard-code light fallbacks like `#fff`
- Full-screen dialog/sheet for record → confirm → detail → void
- Safe-area padding on the tab bar
- Minimum 44px interactive targets on primary controls
- **Progress captions** (History rows / IOB): track first, then leading-aligned stack under it — remaining (supporting / semibold muted) above until-time (caption / dim). Do not put end time beside remaining on one row.
- **Complete chip**: trailing `COMPLETE` chip alone marks a finished DIA interval — no second “interval complete” line under the row. Use `.chip-complete` (quiet muted), not `.chip-locked`.
- **History dose column**: leading units use a fixed width (`--history-dose-col`, ~`5.75ch`) plus `font-variant-numeric: tabular-nums` so time/glucose/carbs align across cards — Apple/Material list metric columns, not flex-shrink-to-content.
- **Compact complete hierarchy**: dose is primary (`.text-heading-14`); time / glucose / carbs are supporting muted text with quieter unit suffixes (`mg/dL`, `g`) — not one flat middot string. Voided keeps the whole line dim.
- **Complete rows**: one muted fact line (`time · units · glucose · carbs`; omit default insulin) + `COMPLETE` chip — same density as voided, full opacity.
- **Voided rows**: within each day, voided entries sort below active/complete; render as one muted line (`time · dose · insulin`) plus a quiet `VOIDED` chip — not a two-line active card.

## Do not

- Replace Glyph colors/type with platform defaults
- Mix Apple, Material, and Horizon component chrome in one screen
- Treat inspiration docs as mandatory pixel specs


## Clinical alert banners

- Leading icon **24×24** (Material 3 Banner; Apple inline symbol ~20–24pt). Do not use 16px “hint” icons for critical lows.
- Gap under banner to Step 1 / next card: **24px** (16–24pt section band; reads as interruption then task).
- Copy: no treatment protocols — gate + follow your care-team plan only ([CONTENT.md](CONTENT.md)).

## Confirm dialogs (Calculate log, destructive confirms)

Use a **modal interruption**, not a stacked full-width CTA sheet.

Follow Apple HIG alert / Material 3 dialog action layout:

- Fixed, centered card over a scrim (`position: fixed; inset: 0`)
- Title + short message only (no “next screen” or extra workflow copy)
- **Two actions in one horizontal row**, trailing-aligned: **Cancel** (leading of the pair) then **primary** (Log / Confirm)
- Minimum 44×44 pt targets; primary may use Halfstep terracotta fill; Cancel is text/ghost, not a second full-width brick
- Primary action ends the flow on the current screen when that is the product rule (e.g. Calculate log stays on Calculate)
- Summary content: use the stacked Dose / Glucose / Carbs review rows (same pattern as History confirm), not one dense middot line
- Copy teaches or states the fact (“Saves on this device with the current time”). Never narrate the UI (“Stays on Calculate”, “on the next screen”)
- Do **not** stack a full-width filled button above a full-width Cancel for ordinary confirms
- Three or more actions: prefer a sheet or list; do not cram into an alert row

Reference: Apple HIG Alerts; Material 3 Dialogs (actions at the end). Halfstep brand tokens still apply — do not swap Glyph colors for system blue/purple.
