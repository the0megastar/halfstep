# Halfstep color inventory

Status: extracted baseline, September 12, 2026. Values below come directly from the active Glyph light/dark blocks in `src/index.css`; they are not a new palette or a completed contrast certification. No application colors were changed.

The visual identity combines warm neutral surfaces, terracotta/peach accents, olive result panels and green dose values. Preserve those relationships during extraction.

| Current token | Light | Dark |
| --- | --- | --- |
| `--bg-base` | `#f8f7f3` | `#20211f` |
| `--bg-surface` | `#fffefa` | `#292a27` |
| `--bg-surface-elevated` | `#eeede7` | `#32332f` |
| `--bg-card` | `#fffefa` | `#292a27` |
| `--bg-glass` | `#f8f7f3` | `#20211f` |
| `--border-subtle` | `#e2e2d9` | `rgba(255, 255, 255, 0.08)` |
| `--border-card` | `#deded5` | `rgba(255, 255, 255, 0.1)` |
| `--border-highlight` | `#a5917d` | `#9b7864` |
| `--text-main` | `#252723` | `#f5f3ed` |
| `--text-muted` | `#62645b` | `#bcbdb3` |
| `--text-dim` | `#6b6d62` | `#aaa99e` |
| `--accent-primary` | `#a54727` | `#efaa87` |
| `--accent-hover` | `#84371c` | `#f4bea2` |
| `--accent-subtle` | `#f2e5da` | `#3c3028` |
| `--panel-result-bg` | `#e8eadf` | `#272b26` |
| `--panel-result-border` | `#a4aa98` | `#555e50` |
| `--panel-result-text` | `#252723` | `#f7f6ee` |
| `--dose-num-color` | `#247345` | `#2ec27e` |
| `--dose-stage-bg` | `#dfe4d5` | `#3c4439` |
| `--dose-stage-border` | `#b8c0ad` | `#555e50` |
| `--btn-primary-text` | `#ffffff` | `#20211f` |
| `--danger` | `#c62828` | `#ef5350` |
| `--danger-hover` | `#b71c1c` | `#f44336` |
| `--danger-subtle` | `#fde8e8` | `rgba(239, 83, 80, 0.15)` |
| `--danger-border` | `#f8b4b4` | `rgba(239, 83, 80, 0.4)` |
| `--danger-text` | `#c62828` | `#ef5350` |

## Usage and migration

- Background/surface/card tokens define containers; text-main/muted/dim define readable hierarchy.
- Accent tokens express brand/action emphasis, not universal safety status. Dose green is a numeric emphasis, not a blanket indication that a dose is safe.
- Danger tokens cover destructive actions/errors. Define distinct warning roles before implementing maximum-dose warnings.
- Pair action backgrounds with explicit foreground tokens, following the semantic-role approach. Preserve existing names with aliases during migration rather than changing every component at once.
- Add documented roles for focus ring, disabled controls, overlay scrim, timer track/progress, warning foreground/background/border, and success feedback only as needed.
- Check normal text against its actual surface at 4.5:1, large text at 3:1, and meaningful control boundaries/graphics at 3:1 where applicable. Alpha colors require compositing before measurement. Do not judge contrast from hex values alone.
- Inspect component overrides and hardcoded colors before declaring this a complete rendered-color inventory. These are the source theme declarations, not computed styles for every state.
- Future source of truth: executable CSS variables in `src/styles/tokens.css`; this document explains roles. The live specimen should read those same variables instead of duplicating values.

Reference: [shadcn semantic theming](https://ui.shadcn.com/docs/theming). Contrast requirements should be checked against [WCAG 2.2](https://www.w3.org/TR/WCAG22/) during implementation.
