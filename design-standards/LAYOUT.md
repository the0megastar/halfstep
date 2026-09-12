# Halfstep Design Standard: Layout, Spacing & Mobile Viewports

Status: accepted. Reviewed September 12, 2026.

This standard specifies the container geometry, responsive breakpoints, spacing scale, safe-area padding, touch targets, and zoom behaviors across Halfstep.

---

## 1. Viewport Guarantees & Breakpoints

Halfstep is designed for mobile-first clinical use by parents, nurses, and caregivers in fast-paced school and home settings.

| Breakpoint | Viewport Width | Arrangement |
| --- | --- | --- |
| **Mobile Narrow** | 320px – 430px (e.g. iPhone SE to Pro Max) | Single column vertical stack; side-by-side inputs (`1fr 1fr`); sticky/relative topbar; modal full-viewport (`100dvh`). |
| **Tablet / Medium** | 431px – 899px | Single column calculator; full breakdown and formula cards. |
| **Desktop / Wide** | 900px+ | Two-column grid (`1fr 1fr`) aligning input panel and calculated dose side-by-side; max container width 1080px (topbar 1120px). |

### Strict Viewport Clamping (12px Margin Floor)
- All anchored dropdowns (`SettingsPopover`, `IobPopover`) enforce a minimum **12px safe margin** (`--safe-margin: 12px`) on both left and right screen edges via [useDropdownBoundary.ts](../src/hooks/useDropdownBoundary.ts).
- No overlay or card may induce horizontal scrolling (`overflow-x: clip` on `.site`).

---

## 2. Safe Areas & Visual Viewport

- **Notches & Dynamic Islands**: Header topbar accounts for `env(safe-area-inset-top, 0px)` and horizontal insets `max(24px, env(safe-area-inset-left, 0px))`.
- **Bottom Navigation / Home Indicators**: Footer padding incorporates `calc(36px + env(safe-area-inset-bottom, 0px))`.
- **Virtual Keyboards**: [useDropdownBoundary](../src/hooks/useDropdownBoundary.ts) listens to `window.visualViewport` resize and scroll events so panels adapt dynamically when software keyboards open on mobile browsers.
- **Dynamic Viewport Units**: Use `100dvh` for dialogs to prevent iOS Safari address-bar clipping.

---

## 3. Touch Target Standards

- **Target Floor**: All interactive buttons, icon buttons, tabs, and stepper controls must provide a touch target of at least **44 × 44 CSS pixels** (preferably 48px where spacing permits).
- **Icon Buttons**: Navigation buttons with visual footprint of 36px utilize an invisible expanded touch boundary (`::after` pseudo-element with `min-width: 44px; min-height: 44px`) to guarantee reliable activation on touchscreens.
- **Dose Stepper**: Decrement (`-`) and Increment (`+`) buttons have fixed dimensions `44px × 44px` with clear disabled contrast.

---

## 4. Input Font Size Standard (iOS Auto-Zoom Prevention)

- All text, numeric, and datetime inputs (`input-container input`, `history-datetime-input`, `history-text-input`) enforce a font-size of **16px (1rem) or greater** on mobile devices.
- Inputs smaller than 16px cause iOS WebKit to automatically zoom in on focus, disrupting the page layout and hiding surrounding clinical guidance.

---

## 5. Spacing Scale

Halfstep uses an 8pt-based harmonious spatial rhythm:

| Spacing Token | Pixels | Usage |
| --- | --- | --- |
| `--space-2` | 2px | Micro-spacing, badges |
| `--space-4` | 4px | Tag margins, tight icon-label gaps |
| `--space-6` | 6px | Section header bottom margin, chip padding |
| `--space-8` | 8px | Button gaps, list item row gaps |
| `--space-12` | 12px | Section header top margin, safe-margin floor, alert gaps |
| `--space-16` | 16px | Popover internal padding, mobile card padding |
| `--space-20` | 20px | Input fields vertical stack gap, modal padding |
| `--space-24` | 24px | Desktop grid gap, workspace desktop horizontal padding |
| `--space-28` | 28px | Desktop card-surface internal padding |
| `--space-36` | 36px | Workspace top padding |
| `--space-48` | 48px | Section vertical separation on specimen pages |

---

## 6. Accessibility & Motion

- **Zoom**: The interface remains legible, operable, and unclipped at 200% browser zoom.
- **Reduced Motion**: All animations and transitions respect `@media (prefers-reduced-motion: reduce)`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
