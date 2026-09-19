# Halfstep Design Standard: Section & List Headers

This standard defines the typographic, structural, and semantic rules for section headers, subheaders, and list group dividers across Halfstep.

---

## 1. The Hierarchy Balance Rule

In interfaces where child items contain prominent text (such as dose values like `1.5 U · 5:04 PM` in `14px` SemiBold / `var(--text-main)`), a section header must **never be visually weaker or lower in contrast** than the items it introduces.

To clearly introduce a new section without competing with the primary card title:
- **Token**: [`.text-heading-14`](../src/index.css) (**14px** font size, **20px** line-height, **600** SemiBold, **-0.28px** letter-spacing)
- **Text Color**: **`var(--text-main)`** (High-contrast primary text, not muted gray)
- **Text Case**: **Title Case** (e.g. `"Contributing Injections"`, never forced all-caps)
- **Gestalt Spacing Rhythm**: 
  - `margin-top` / space above header: **12px** (separates from preceding component)
  - `margin-bottom` / space below header: **6px** (groups header closely with its items)

---

## 2. Specification Comparison

| Element | Level | Token Class | Size / Weight | Color | Role |
|:---|:---|:---|:---|:---|:---|
| **Modal / Card Title** | Level 1 | `.text-heading-16` | 16px / SemiBold 600 | `var(--text-main)` | Modal / popover main title (*"Active Insulin (IOB)"*) |
| **Section Subheader** | Level 2 | `.text-heading-14` | 14px / SemiBold 600 | `var(--text-main)` | Section boundary (*"Contributing Injections"*) |
| **List Item Primary** | Level 3 | `.text-label-14` | 14px / SemiBold 600 | `var(--text-main)` / `--accent-primary` | Row metric (*"1.5 U · 5:04 PM"*, *"~0.89 U"*) |
| **List Item Secondary** | Level 4 | `.text-copy-13` / `.text-label-12` | 13px / 12px Regular | `var(--text-muted)` | Caregiver (*"Dad"*), time left (*"1h 45m left"*) |

---

## 3. Rationale & Industry Alignment

These sizes, weights, capitalization and spacing are Halfstep-specific choices. Apple HIG, Material and shadcn are references for hierarchy and consistency, not evidence that all three prescribe these exact values.

- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines)
- [Material foundations](https://m3.material.io/foundations/)
- [shadcn theming](https://ui.shadcn.com/docs/theming)

---

## 4. Usage Example

```html
<!-- Canonical Section Markup -->
<div class="iob-active-list">
  <span class="iob-list-title text-heading-14">Contributing Injections</span>
  <!-- List rows -->
</div>
```

```css
/* Canonical CSS */
.iob-list-title {
  color: var(--text-main);
  margin-bottom: 6px;
}
```
