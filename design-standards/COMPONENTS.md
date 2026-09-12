# Halfstep Design Standard: Component Catalog

Status: accepted. Reviewed September 12, 2026.

This catalog indexes Halfstep's canonical UI components, their contracts, variants, accessibility contracts, and token roles.

---

## 1. Application Shell & Pages

### `AppShell`
- **File**: [`src/app/AppShell.tsx`](../src/app/AppShell.tsx)
- **Role**: Top-level layout container (`.site.glyph`) composing sticky topbar, brand title (`½ halfstep.`), navigation actions slot, and `<main className="workspace">`.
- **Theme Support**: Applies active theme tokens from [tokens.css](../src/styles/tokens.css) via `data-theme` attribute on `html`.

### `CalculatorPage`
- **File**: [`src/pages/CalculatorPage.tsx`](../src/pages/CalculatorPage.tsx)
- **Role**: Primary clinical calculator interface composing page heading, dynamic alert banners (`alert-critical`, `alert-warning`, `alert-caution`), `CalculatorInputs`, `DoseResult`, `DoseBreakdown`, `ClinicalFormula`, and safety disclaimers.

### `DesignSystemPage`
- **File**: [`src/pages/DesignSystemPage.tsx`](../src/pages/DesignSystemPage.tsx)
- **Role**: Lazy-loaded developer and clinical reference page showcasing the 25-tier typography scale, interactive category filters, and live preview inputs. Code-split to minimize the clinical production bundle.

---

## 2. Overlays & Contextual Panels

### `SettingsPopover`
- **File**: [`src/features/settings/SettingsPopover.tsx`](../src/features/settings/SettingsPopover.tsx)
- **Role**: Nonmodal dropdown displaying physician-signed clinical settings derived directly from `ROMAN` in [lib/dose.ts](../lib/dose.ts).
- **Geometry**: Consumes [useDropdownBoundary](../src/hooks/useDropdownBoundary.ts) with `preferredWidth: 330px, margin: 12px`.
- **Accessibility**: `role="dialog"`, `aria-label="Prescribed Clinical Settings"`. Light dismiss on click-outside and Escape. Coordinated via [useOverlayManager](../src/hooks/useOverlayManager.ts).

### `IobPopover`
- **File**: [`src/features/iob/IobPopover.tsx`](../src/features/iob/IobPopover.tsx)
- **Role**: Nonmodal dropdown displaying active insulin decay stats (`useIobSummary`), time remaining, and contributing injections list.
- **Geometry**: Consumes [useDropdownBoundary](../src/hooks/useDropdownBoundary.ts) with `preferredWidth: 336px, margin: 12px`.
- **Accessibility**: `role="dialog"`, `aria-label="Active Insulin Details"`. Light dismiss on click-outside and Escape.

### `InjectionHistoryDialog`
- **File**: [`src/features/injections/InjectionHistoryDialog.tsx`](../src/features/injections/InjectionHistoryDialog.tsx)
- **Role**: Modal dialog container (`<dialog className="injection-dialog">`) managing history, creation, editing, review, and voiding workflows.
- **Accessibility**: Native `showModal()`, focus containment, Escape key cancellation, accessible title via `aria-labelledby="injection-title"`, high-contrast backdrop scrim.

---

## 3. Calculator UI Blocks

### `CalculatorInputs`
- **File**: [`src/features/calculator/CalculatorInputs.tsx`](../src/features/calculator/CalculatorInputs.tsx)
- **Role**: Step 01 card with Current Glucose (with `mg/dL` pill) and Total Carbohydrates (with `grams`/`g` pill).
- **Accessibility**: `aria-invalid` on erroneous inputs, labeled icons, `>= 16px` font size to prevent mobile auto-zoom.

### `DoseResult`
- **File**: [`src/features/calculator/DoseResult.tsx`](../src/features/calculator/DoseResult.tsx)
- **Role**: Step 02 calculated dose hero card displaying rounded units (`1.0 u`), exact math annotation, hypoglycemia warning (`NO DOSE`), or empty placeholder.
- **Record Action**: Accessible `ArrowUpRight` icon button with `>= 44px` touch boundary.

### `DoseBreakdown`
- **File**: [`src/features/calculator/DoseBreakdown.tsx`](../src/features/calculator/DoseBreakdown.tsx)
- **Role**: Side-by-side Food Coverage (`carbs / 35`) and Correction Bolus (`(glucose - 150) / 135`) breakdown cards, plus dynamic "How the math works" teaching box.

### `ClinicalFormula`
- **File**: [`src/features/calculator/ClinicalFormula.tsx`](../src/features/calculator/ClinicalFormula.tsx)
- **Role**: Mathematical notation display of clinical dose formula and 3-tier half-unit rounding guide (`.1–.3`, `.4–.7`, `.8–.9`) with active category indicator.

---

## 4. Shared UI Primitives

### `SectionHeader`
- **File**: [`src/components/ui/SectionHeader.tsx`](../src/components/ui/SectionHeader.tsx)
- **Standard**: Conforms to [SECTION_HEADERS.md](SECTION_HEADERS.md).
- **Token**: `.text-heading-14` (14px font size, 20px line-height, 600 SemiBold, `var(--text-main)`).

### `IobGauge`
- **File**: [`src/features/iob/IobGauge.tsx`](../src/features/iob/IobGauge.tsx)
- **Role**: SVG circular ring gauge (`32 × 32px`) animating modeled insulin time remaining with centered droplet icon.

### `IobBadge`
- **File**: [`src/features/iob/IobBadge.tsx`](../src/features/iob/IobBadge.tsx)
- **Role**: Topbar trigger complication displaying gauge, dose (`0.90 U`), and countdown (`57m`).

---

## 5. Button System

Standardized button hierarchy defined in [dialog.css](../src/styles/dialog.css):

| Variant | Class Token | Style | Usage |
| --- | --- | --- | --- |
| **Primary** | `.btn-primary`, `.history-primary` | Terracotta / peach filled, 46px height, white text | Main actions ("Confirm and Save", "Record Insulin Given") |
| **Secondary** | `.btn-secondary` | Elevated surface, subtle border, 44px height | Secondary workflow actions ("Edit Entry") |
| **Ghost** | `.btn-ghost` | Transparent background, muted text, 42px height | Dismissal / navigation ("Back", "Cancel") |
| **Destructive Outline** | `.btn-destructive` | Danger subtle background, danger border | Entry points to dangerous flows ("Void Entry") |
| **Destructive Solid** | `.btn-destructive-solid` | Red / solid danger background, 46px height | Final confirmation of destructive audit void ("Confirm Void") |
