# Halfstep

A local-first pediatric MDI insulin **math helper** for caregivers and school nurses. Halfstep checks food coverage and correction arithmetic against locked parameters, rounds to half units, and can log doses on this device only.

It is **not** a medical device, pump, CGM, or care-plan replacement. Always verify glucose and dosing decisions with your meter or CGM and your care team before acting.

---

## What it does

- **Calculate** — Enter glucose and carbs. Halfstep shows food coverage, correction (when above target), half-unit rounding, and safety gates (low glucose, high glucose, high carb count, over locked maximum).
- **History** — Log insulin given on this device (IndexedDB). Edit or void entries; originals stay in the local history trail.
- **IOB chip** — Linear insulin-on-board estimate from locally logged doses and the locked duration of insulin action.
- **Settings** — Appearance (Light / Dark / Automatic) and a read-only view of locked insulin parameters. Numbers are not edited in the app; change them in `lib/patient.ts` and rebuild.
- **Offline / school-firewall friendly** — No analytics CDNs, no third-party font hosts, no cloud sync of dose history.

### Locked parameters (this build)

Edit `lib/patient.ts` (then rebuild) to clone for another person. Current defaults:

| Parameter | Value |
|-----------|--------|
| Name (display) | Roman |
| Carb ratio | 1 unit : 45 g |
| ISF | 135 mg/dL per unit |
| Target glucose | 150 mg/dL |
| Max suggested / logged dose | 5 units |
| Duration of insulin action | 3 hours |
| Insulin label | NovoLog |
| Low-glucose gate | < 70 mg/dL (no suggested dose) |
| High-glucose prompt | > 400 mg/dL |
| High-carb check gate | > 100 g |

Math overview: food = carbs ÷ ratio; correction = (glucose − target) ÷ ISF when glucose is above target; add them; round with the half-unit protocol. Low glucose suppresses a suggested dose.

---

## Requirements

- Node.js **22** (CI uses 22; 20+ is usually fine locally)
- npm (comes with Node)

---

## Local setup

```bash
git clone https://github.com/the0megastar/halfstep.git
cd halfstep
npm ci
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

Useful scripts:

```bash
npm test          # unit + real-world QA matrix
npm run typecheck
npm run build     # static site → dist/ (adds .nojekyll for Pages)
npm run preview   # serve the production build locally
```

To adapt for another person: edit `lib/patient.ts`, run tests, rebuild.

---

## Deploying with GitHub Pages

This repo includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). On every push to **`main`** (and on manual **workflow_dispatch**), Actions runs tests, builds, and deploys `dist/` to GitHub Pages.

### One-time Pages setup (any repo that uses Actions)

1. Repo **Settings → Pages**
2. **Build and deployment → Source**: **GitHub Actions**
3. Merge or push to `main` (or run the workflow manually under the Actions tab)

After the first green deploy, the site URL is shown on the workflow run and under Settings → Pages (often `https://<user>.github.io/halfstep/`).

`vite.config.ts` uses `base: './'` so the app works at a project Pages path.

### Public GitHub repository

- **GitHub Free** is enough for Actions + Pages on a **public** repo.
- Anyone can clone the repo, read the source (including `lib/patient.ts`), and open the published site if they know the URL.
- Use this only if you accept that the app source and baked-in parameters are public.

### Private GitHub repository (paid)

- Publishing Pages from a **private** repo generally requires a paid plan (**GitHub Pro**, **Team**, or **Enterprise**), not Free.
- A private repo hides the **git history and source** from the public (people without access cannot browse or clone it).
- **Important:** a normal GitHub Pages URL is still a **public website** unless you use an Enterprise product that supports private Pages / access control. Do not assume “private repo” means “private website.” Anyone with the link can usually load the app and download the JS bundle.

If you need the live app reachable only by family or school staff, prefer a private host with auth (or local/LAN only), not a default public Pages URL.

---

## Safety and privacy caveats (read before you ship)

Halfstep is a **static front-end**. There is no Halfstep server and no cloud dose database.

### What can be visible if the repo or site is public

- **Source on GitHub** (public repo, or anyone with private-repo access): patient display name, carb ratio, ISF, target, max dose, insulin label, and all app logic in `lib/patient.ts` and related files.
- **Deployed site JS bundle**: the same locked parameters and formulas are compiled into client JavaScript. Browser DevTools or downloading `/assets/*.js` can reveal them even without git access.
- **README and commits**: avoid pasting real school names, phone numbers, addresses, full medical record details, or other identifiers into docs or commit messages.

### What stays on the device

- **Dose history / IOB inputs** live in that browser’s **IndexedDB**. They are not uploaded by Halfstep.
- Clearing site data, switching browsers or devices, or using private browsing loses or isolates that history.
- Caregiver labels are local labels, not login accounts.

### What Halfstep does not do

- It does not replace clinical judgment, prescribed plans, or on-label device instructions.
- It does not send SMS, email, or Nightscout/CGM data in this version.
- It does not authenticate users or encrypt history beyond whatever the browser/OS already does.

### Operational tips

- Prefer a **private** repo if the clone contains a real child’s parameters.
- Treat the Pages URL as **world-readable** unless you have confirmed private hosting.
- School MDM may block installs; a bookmarkable HTTPS (or LAN) site is often easier than a store app.
- Re-run `npm test` after any change to `lib/patient.ts`.

---

## Project layout (short)

```
lib/patient.ts     Locked cloneable parameters
lib/dose.ts        Calculate math + teaching sentences
src/pages/         Calculate, History, Settings
tests/             Unit tests + real-world QA matrix
.github/workflows/ Pages deploy (test → build → deploy)
design-standards/  Content and HIG notes for UI work
local/             Machine-local notes (gitignored; never push)
```

---

## Releases and attribution

Keep commits attributed to the human author only. Do not add AI `Co-authored-by` lines, bot `Signed-off-by`, or “Generated by” trailers.

Deploy runs when `main` updates and the Pages workflow finishes green (Actions tab).
