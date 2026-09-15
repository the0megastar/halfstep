# Mobile interaction references (Halfstep)

Halfstep keeps its **Glyph** visual system (Manrope typography tiers, existing light/dark tokens in `src/styles/tokens.css`). External HIGs inform **navigation and interaction**, not a restyle.

## Sources

- Apple Human Interface Guidelines — tabs, sheets, safe areas, 44pt targets
- Material 3 — bottom navigation, semantic color roles
- Meta HorizonOS — spatial clarity and focus affordances as a secondary reference for headset/TV-scale later; phone UI remains primary

## Adopted patterns in v0.2.x

- Bottom tab bar: Calculate · History · Settings
- Full-screen dialog/sheet for record → confirm → detail → void
- Safe-area padding on the tab bar
- Minimum 44px interactive targets on primary controls

## Do not

- Replace Glyph colors/type with platform defaults
- Mix Apple, Material, and Horizon component chrome in one screen
- Treat inspiration docs as mandatory pixel specs
