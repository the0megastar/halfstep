# Halfstep

A fast, mobile-friendly pediatric MDI insulin arithmetic checker and math double-checker for Roman's caregivers and school nurses.

Built with a clean **Glyph** design system with full **Light and Dark mode** support, tailored typography, and step-by-step arithmetic breakdown.

---

## Features

- **Doctor-Prescribed Locked Parameters**:
  - Carbohydrate Ratio: **1 unit per 35 grams**
  - Insulin Sensitivity Factor (ISF): **135 mg/dL per unit**
  - Target Blood Glucose: **150 mg/dL**
  - Read-only parameters accessible via the Settings icon dropdown in the navigation bar.
- **Side-by-Side Mobile Layout**:
  - Glucose and Carbs inputs sit side-by-side on mobile screens for fast, single-screen dosing checks without unnecessary scrolling.
- **Step-by-Step Mathematical Breakdown**:
  - Displays the exact math formulas directly beneath the calculated dose:
    - **Food Coverage**: $\frac{\text{Carbs}}{35}$
    - **Correction Bolus**: $\frac{\text{Glucose} - 150}{135}$ (only when Glucose > 150 mg/dL)
    - **Total Dose**: Food + Correction, rounded via Roman's half-unit protocol.
- **Roman's Half-Unit Rounding Protocol**:
  - Fractional remainder **.1 to .3**: round down to nearest whole unit
  - Fractional remainder **.4 to .7**: round to half unit (**0.5u**)
  - Fractional remainder **.8 to .9**: round up to next whole unit
- **Clinical Safety Alerts**:
  - **Hypoglycemia (< 70 mg/dL)**: Prompts immediate treatment with fast-acting carbs; suppresses insulin dose recommendation.
  - **High Blood Glucose (> 400 mg/dL)**: Prompts double-checking meter reading and checking for ketones.
  - **High Carb (> 100g)**: Prompts a double-check of food portions or lunch count.
- **100% Private, Local & Offline-Capable**:
  - No external CDN calls, analytics, or third-party web fonts (school firewall friendly).
  - All calculations occur 100% client-side in the browser and function completely offline.
- **Automated GitHub Pages Deployment**:
  - Includes `.github/workflows/deploy.yml` to automatically test, build, and deploy on pushes to `main`.

---

## Development & Build

### Requirements
- Node.js 20+ or 22+

### Commands

```bash
# Start local development server with instant HMR
npm run dev

# Run clinical arithmetic and rounding unit tests
npm run test

# Build static bundle for GitHub Pages (outputs to dist/ with .nojekyll)
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment (GitHub Pages)

This project is configured to deploy automatically via GitHub Actions:

1. Under repository **Settings > Pages**:
   - Set **Build and deployment > Source** to **GitHub Actions**.
2. Any push to the `main` branch will automatically run the test suite, build the Vite app, and publish the site to:
   ```
   https://the0megastar.github.io/halfstep/
   ```

---

## Safety Notice

This tool is an arithmetic teaching aid and math double-checker. Always follow the physician-signed School Diabetes Medical Management Plan (DMMP) or 504 plan. Active insulin on board (IOB), exercise, illness, or ketones must be evaluated per doctor’s written orders.
