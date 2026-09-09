# Halfstep

A fast, mobile-friendly pediatric MDI insulin arithmetic checker and teaching tool for Roman's caregivers and school nurses.

Two selectable design themes:
- **Design A (Glyph)**: Warm charcoal (`#20211f`), terracotta accents (`#efaa87`), and locally served Manrope typography.
- **Design B (Liquid Glass)**: Translucent frosted optical glass inspired by the Apple TV interface on Android TV and Xbox, styled according to Apple Human Interface Guidelines (HIG) with continuous corner curves, specular highlights, and system typography.

---

## Features

- **Doctor-Prescribed Locked Parameters**:
  - Carbohydrate Ratio: **1 unit per 35 grams**
  - Insulin Sensitivity Factor (ISF): **135 mg/dL per unit**
  - Target Blood Glucose: **150 mg/dL**
  - These values are hardcoded and non-editable to prevent accidental parameter modification.
- **Dynamic Teaching Explanations**:
  - Plain-English, casual explanations dynamically update as numbers are typed, explaining the exact food math, correction difference, and half-unit rounding.
- **Roman's Half-Unit Rounding Rule**:
  - Fractional remainder **.1 to .3**: round down to whole unit
  - Fractional remainder **.4 to .7**: round to half unit (**0.5u**)
  - Fractional remainder **.8 to .9**: round up to next whole unit
- **Clinical Safety Alerts (Casual & Clear)**:
  - **Hypoglycemia Alert (< 70 mg/dL)**: Prompts immediate treatment with fast-acting carbs; suppresses insulin dose recommendation.
  - **High Glucose Warning (> 400 mg/dL)**: Prompts double-checking meter reading and checking for ketones.
  - **High Carb Sanity Check (> 100g)**: Prompts a double-check of food portions or lunchbox count.
- **100% School-Safe & Offline-Capable**:
  - No external CDN scripts, analytics, or third-party web font calls (firewall-friendly).
  - Built-in Service Worker and web app manifest for offline functionality on phones, iPads, and laptops.
- **GitHub Pages Ready**:
  - Pure static single-page application.
  - Generates `.nojekyll` in `dist/` and uses relative asset paths (`./assets/...`) for seamless hosting at root or sub-path URLs.

---

## Development & Build

### Requirements
- Node.js 22.13+ or standard LTS Node.

### Commands

```bash
# Start local development server with instant HMR
npm run dev

# Build static bundle for GitHub Pages (outputs to dist/ with .nojekyll)
npm run build

# Preview production build locally
npm run preview

# Run unit tests for clinical calculations and rounding rules
npm run test
```

---

## Clinical Notice

This application is an educational arithmetic check and double-checker for Roman's authorized caregivers. Always confirm readings and dosages against Roman's current physician-signed School Diabetes Medical Management Plan (DMMP). Active insulin on board (IOB), exercise, illness, or ketones must be evaluated per doctor orders.
