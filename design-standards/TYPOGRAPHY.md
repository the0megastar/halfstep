# Halfstep Design Standard: Typography System

The Halfstep Typography System is an established, token-driven hierarchy designed for pediatric clinical arithmetic interfaces. It defines consistent roles for typography; accessibility and legibility still require contrast, zoom, and device verification.

---

## 1. System Foundations

- **Base Font**: [Manrope](https://fonts.google.com/specimen/Manrope) (`'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
  - A modern, open geometric neo-grotesque with softened corners and excellent numeral legibility for clinical metrics.
  - Four static font files loaded locally for weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold).
- **Hard Floor Rule**: **12px Minimum**. Sub-12px micro-text (e.g., 8px, 9px, 10px, 11px) is strictly prohibited.
- **Numbers**: All clinical values, units, doses, and timestamps use `tabular-nums` (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during live updates.

---

## 2. The 25-Tier Scale Reference

### A. Headings (10 Tiers · Font Weight: 600 SemiBold)
Used for page titles, hero headings, major card headers, and prominent clinical metrics.

| Token | Size | Line Height | Letter Spacing | Primary Role |
|:---|:---|:---|:---|:---|
| `.text-heading-72` | 72px | 72px | -4.32px | Display hero metrics |
| `.text-heading-64` | 64px | 64px | -3.84px | Display titles (desktop) |
| `.text-heading-56` | 56px | 56px | -3.36px | Large display titles |
| `.text-heading-48` | 48px | 56px | -2.88px | Specimen page H1, major brand headers |
| `.text-heading-40` | 40px | 48px | -2.4px | Primary dose result number |
| `.text-heading-32` | 32px | 40px | -1.28px | Mobile H1 hero title ("Roman.") |
| `.text-heading-24` | 24px | 32px | -0.96px | Section titles ("Type Scale", "Calculated Dose") |
| `.text-heading-20` | 20px | 26px | -0.4px | Hero card values ("1.83 units", "1h 53m") |
| `.text-heading-16` | 16px | 24px | -0.32px | Modal & popover titles ("Active Insulin (IOB)") |
| `.text-heading-14` | 14px | 20px | -0.28px | Compact card headers, sub-modal titles |

*Sub-elements inside headings using `<strong>` inherit `font-weight: 500` and `color: var(--text-muted)`.*

---

### B. Copy (6 Tiers · Font Weight: 400 Regular)
Used exclusively for multi-line paragraphs, instructional explanations, and disclaimers.

| Token | Size | Line Height | Primary Role |
|:---|:---|:---|:---|
| `.text-copy-24` | 24px | 36px | Editorial lead paragraphs |
| `.text-copy-20` | 20px | 36px | Prominent intro explanations |
| `.text-copy-18` | 18px | 28px | Article body text |
| `.text-copy-16` | 16px | 24px | Standard interface body copy, math breakdown explanations |
| `.text-copy-14` | 14px | 20px | Secondary body copy, input helper descriptions |
| `.text-copy-13` | 13px | 18px | Disclaimers, model notes, attribution subtitles |

*Bold emphasis inside copy using `<strong>` inherits `font-weight: 600` and `color: var(--text-main)`.*

---

### C. Labels (6 Tiers · Font Weight: 400 Regular / 600 SemiBold)
Used for single-line UI elements, list items, badges, metadata, and form labels.

| Token | Size | Line Height | Primary Role |
|:---|:---|:---|:---|
| `.text-label-20` | 20px | 32px | Prominent navigation labels |
| `.text-label-18` | 18px | 20px | Large menu items |
| `.text-label-16` | 16px | 20px | Standard input labels, menu items |
| `.text-label-14` | 14px | 20px | List row values, input labels, secondary badges |
| `.text-label-13` | 13px | 16px | Compact metadata, navbar dose |
| `.text-label-12` | 12px | 16px | **System Floor**: Status chips ("ACTIVE"), timers ("1h 53m left") |

*Strong emphasis inside labels using `<strong>` inherits `font-weight: 500` or `600`.*

---

### D. Buttons (3 Tiers · Font Weight: 500 Medium)
Used for interactive buttons, tabs, segmented controls, and pill actions.

| Token | Size | Line Height | Primary Role |
|:---|:---|:---|:---|
| `.text-button-16` | 16px | 20px | Primary call-to-action buttons ("Record Dose") |
| `.text-button-14` | 14px | 20px | Standard action buttons ("View Injection History", filter tabs) |
| `.text-button-12` | 12px | 16px | Compact pill buttons, quick sample chips |

---

## 3. Governance Rules

1. **No Inline Font Sizes**: Never use ad-hoc pixel, rem, or em font declarations (`font-size: 0.85rem`, `font-size: 9px`). Every text node must use a class token from this scale.
2. **Copy vs. Label Distinction**:
   - Single-line metadata, status indicators, badges, and list metrics are **Labels**.
   - Any text that can wrap into 2 or more lines (disclaimers, warnings, instructions) is **Copy** to maintain comfortable proportional line-height.
3. **No All-Caps for Paragraphs or Long Labels**: Uppercase is restricted to short status chips (e.g., `ACTIVE`, `LOCKED`). All section headers and list titles must use **Title Case**.

Section subheaders such as “Contributing Injections” use `.text-heading-14`; see [Section headers](SECTION_HEADERS.md). The scale contains 25 tiers (10 headings, 6 copy, 6 labels, 3 buttons).
