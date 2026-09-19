# Halfstep Design Standard: Calculator Math Cards

Status: accepted for v0.2.x phone/tablet density work. Visual identity remains Glyph; interaction hierarchy follows Apple HIG principles mapped onto the Halfstep typography specimen.

## 1. Sources

| Source | What we take | What we do not take |
| --- | --- | --- |
| [Halfstep Typography specimen](TYPOGRAPHY.md) | Token classes, 12px floor, tabular nums, Title Case | Ad-hoc rem sizes |
| [Apple HIG — Typography & Layout](https://developer.apple.com/design/human-interface-guidelines/typography) | Clear primary/secondary hierarchy; readable body; trailing values in list rows; avoid cramped chrome | SF Pro, iOS system colors, all-caps section titles |
| Material 3 | Compact density as a *layout* idea only | Material type scale or component skins |
| HorizonOS | Clarity at a glance for later large canvases | Spatial/3D chrome on phone |

## 2. Card anatomy (Food Coverage / Correction Bolus)

Apple-style **list row** mapped to Glyph panels:

1. **Primary row**: leading title (`.text-heading-14`) + trailing numeric result (`.text-label-14`, `tabular-nums`)
2. **Secondary row**: formula as supporting copy (`.text-copy-13`), not as a competing headline
3. **Tertiary note** (tablet/desktop): caption (`.text-copy-13`); may hide on narrow phones to protect scroll budget

Do **not** center-stack formula and value as equal peers. The unit result is the answer; the formula explains it.

## 3. Estimated glucose

Placement: directly under the calculated dose hero for now. Do **not** auto-place it beside the dose; the owner decides that after the card looks right.


- Title: `.text-heading-14`, Title Case (not all-caps)
- Value: `.text-heading-20` + unit `.text-label-12`
- Disclaimer: `.text-copy-13` (always ≥12px)

## 4. How the Math Works

- Always **expanded** (no disclosure on phone)
- Header: `.text-heading-14`, Title Case
- Body: `.text-copy-13` (same token as Learn the Math concept intro — teaching prose peers)
- Softened Glyph panel colors unchanged (`#3c4439` / `#555e50`)

## 5. Hard rules

1. No text below **12px**
2. No inline `font-size` on these cards — tokens only
3. No all-caps for multi-word headers or paragraphs
4. Clinical numbers use `tabular-nums`
5. Phone may stack Food/Correction in one column and hide tertiary notes; it must not shrink type under the floor

## 6. Breakpoints

| Width | Behavior |
| --- | --- |
| ≤600px | Single-column math cards; estimate label + value on one row; teaching fully visible |
| ≥601px | Two-column Food/Correction; tertiary notes visible |

### Trailing value format (phone list rows)

Use `displayCompactUnits`: no ≈, max 2 decimal places, tight suffix `u` (e.g. `0.57u`, `2u`). Apple and Material list rows keep trailing values short and scannable; teaching paragraph uses `formatTeachingAmount` at 2 decimals (no ≈).


## 7. Phone two-column hierarchy (holistic)

On ≤600px, keep Food | Correction side by side with this stack inside each card:

1. **Primary row (never wraps):** short title (`Food` / `Correction`) + compact value (`0.57u`)
2. **Secondary row:** compact formula (`20g÷35`, `70÷135`), nowrap + ellipsis if needed
3. Full titles and spaced formulas return at ≥601px

Do not use `overflow-wrap: anywhere` on these cards — it forces mid-word wraps on real phones. Prefer shorter labels over wrapping long ones (same pattern as Glucose/Carbs input labels).


## 8. Formula as Apple subtitle

Under Food / Correction, the formula is **secondary subtitle** copy:

- Left-aligned with the **title text**, indented past the leading icon (not flush to the card edge, not centered, not trailing under the unit)
- Muted color; `.text-copy-13` minimum
- Explains the trailing value; it is not a second competing headline

This matches iOS list cells (title + trailing value, subtitle under the title) more than a centered metric tile.
