# Halfstep Design Standard: Dropdowns & Popovers

This standard defines the layout geometry, viewport boundary clamping, responsive centering, and typographic rules for all dropdowns, popovers, and contextual panels across Halfstep.

---

## 1. Core Principles

Mobile screens range from 320px (iPhone SE 1st gen) to 430px+ (iPhone Pro Max, Pixel XL), with dynamic islands, notches, and rounded display bezels. Fixed offsets or static `right: 0` / `left: 0` alignments cause popovers to either clip off the viewport edge or misalign with their trigger buttons.

Every dropdown in Halfstep must satisfy three guarantees:
1. **Auto-Centering on Trigger**: When screen space allows, the dropdown must horizontally center relative to its trigger icon or badge.
2. **Strict Viewport Edge Clamping (12px Margin Floor)**: Dropdown panels must never touch the physical screen edge. A minimum **12px safe margin** (`--safe-margin: 12px`) is enforced on both left and right sides.
3. **No Horizontal Animation Clashes**: Entrance keyframes must animate vertical translation (`translateY`) and opacity only—never horizontal `translateX`. Vertical-only transforms are allowed; do not replace the positioning hook’s horizontal geometry.

---

## 2. Boundary Clamping Math

Given:
- $W_{\text{viewport}}$: document client width (`document.documentElement.clientWidth || window.innerWidth`)
- $M$: safe boundary margin (default **12px**)
- $W_{\text{preferred}}$: preferred desktop width (typically **330px–336px**)
- $R_{\text{trigger}}$: bounding client rectangle of the trigger element (`getBoundingClientRect()`)

The panel geometry is computed as follows:

$$W_{\text{panel}} = \min(W_{\text{preferred}}, W_{\text{viewport}} - 2M)$$

$$\text{Center}_{\text{trigger}} = R_{\text{trigger}}.\text{left} + \frac{R_{\text{trigger}}.\text{width}}{2}$$

$$\text{Target}_{\text{left}} = \max\left(M, \min\left(W_{\text{viewport}} - M - W_{\text{panel}}, \text{Center}_{\text{trigger}} - \frac{W_{\text{panel}}}{2}\right)\right)$$

$$\text{Relative}_{\text{left}} = \text{round}\left(\text{Target}_{\text{left}} - R_{\text{trigger}}.\text{left}\right)$$

This relative offset is assigned to `style.left`, with `style.right = 'auto'`.

---

## 3. The Standard Hook: `useDropdownBoundary`

All dropdowns and popovers must consume the shared [`useDropdownBoundary`](../src/hooks/useDropdownBoundary.ts) hook.

```typescript
import { useDropdownBoundary } from '../hooks/useDropdownBoundary';

export function MyDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const panelStyle = useDropdownBoundary({
    isOpen,
    triggerRef,
    preferredWidth: 330, // 330px for Settings, 336px for IOB
    margin: 12,          // 12px viewport floor
  });

  return (
    <div ref={triggerRef} className="my-dropdown-wrapper">
      <button onClick={() => setIsOpen(prev => !prev)}>Toggle</button>
      {isOpen && (
        <div className="my-dropdown-panel" style={panelStyle} role="dialog">
          {/* Panel Content */}
        </div>
      )}
    </div>
  );
}
```

The hook automatically handles:
- Execution on mount and toggle via `useLayoutEffect` to prevent visual jumps.
- Re-calculation on window `resize` and passive `scroll` events.
- Cleaning up event listeners on unmount or when the popover closes.

---

## 4. CSS Rules & Layout Pitfalls

### Base CSS Contract
Panel CSS must define the relative vertical stack and allow the hook to dictate the horizontal geometry:

```css
.my-dropdown-wrapper {
  position: relative;
}

.my-dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: auto;
  box-sizing: border-box;
  max-width: calc(100vw - 24px); /* 12px margin on left + right */
  max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 100px);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  z-index: 1000;
  animation: dropdownFadeIn 0.18s ease forwards;
}
```

### ⚠️ Prohibited Anti-Patterns
1. **Never use fixed media query offsets** (e.g. `@media (max-width: 600px) { right: -60px; }`): Hardcoded negative offsets inevitably break on small phones (320px–375px) and clip off the screen.
2. **Never animate horizontal transform in keyframes**:
   ```css
   /* INCORRECT - Overrides inline left positioning */
   @keyframes dropdownBad {
     from { transform: translateX(-50%) translateY(-4px); }
     to   { transform: translateX(-50%) translateY(0); }
   }

   /* CORRECT - Y-axis only */
   @keyframes dropdownFadeIn {
     from { opacity: 0; transform: translateY(-4px); }
     to   { opacity: 1; transform: translateY(0); }
   }
   ```

---

## 5. Panel Anatomy & Typography Standards

Dropdowns must adhere strictly to the 25-Tier Halfstep Typography Scale:

| Section | Class Token | Weight / Size | Color | Alignment |
|:---|:---|:---|:---|:---|
| **Panel Title** | `.text-heading-16` | SemiBold 600 (16px) | `var(--text-main)` | Left / Start |
| **Title Inline Icon** | Lucide `size={15}` | — | `var(--text-muted)` | Inline next to title |
| **Status Chip** | `.chip.text-label-12` | SemiBold 600 (12px) | Accented / Subtle | Right |
| **Section Header** | `.text-heading-14` | SemiBold 600 (14px) | `var(--text-main)` | Left (Title Case) |
| **Row Primary** | `.text-label-14` | SemiBold 600 (14px) | `var(--text-main)` | Left |
| **Row Metric / Val** | `.text-label-14` | SemiBold 600 (14px) | `var(--accent-primary)` | Right (tabular-nums) |
| **Row Caption** | `.text-copy-13` | Regular 400 (13px) | `var(--text-muted)` | Left |
| **Footer Meta / Lock** | `.text-label-12` | SemiBold 600 (12px) | `var(--text-dim)` | **Center (all items)** |

### Footer Alignment Standard
Footers providing metadata, lock warnings, or disclaimers must be **center-aligned**:
```css
.dropdown-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  color: var(--text-dim);
}

.dropdown-lock-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}
```

---

## 6. Implementation Checklist for New Dropdowns

When creating a new dropdown or popover:
- [ ] Import and invoke [`useDropdownBoundary`](../src/hooks/useDropdownBoundary.ts).
- [ ] Assign returned style to the dropdown panel (`style={panelStyle}`).
- [ ] Ensure keyframe entrance animations only translate on the Y-axis.
- [ ] Keep panel title at `.text-heading-16` and omit redundant user subtitles.
- [ ] Set footer lock indicator and disclaimer text to center-aligned.
- [ ] Test on 320px, 375px, and 430px mobile viewports to verify safe 12px margin padding on both screen edges.
