# CLAUDE.md — government_data_verify

This file documents the codebase structure, development workflows, and conventions for AI assistants working in this repository.

## Project Overview

**FACTS & TRUTH** is a React single-page application that presents verified Indian government data across multiple thematic dashboards (economy, unemployment, crime, health, NREGA, etc.). All data is hardcoded inside component files — there is no backend or external API.

## Repository Layout

```
gov_data_verify/
├── .gitignore            ⚠ SECURITY ISSUE — see below
├── .gitignore.pub
├── .vscode/
├── package.json          # Root-level deps (recharts, three.js) — likely unused
├── package-lock.json
├── Documents.docx        # Reference documents
├── Instinct_recognise_tech.docx
├── node_modules/         # Should not be committed
└── All_Data_in/          # ← THE ACTUAL APPLICATION
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    ├── vercel.json
    ├── package.json
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── assets/
        └── components/
            ├── IndiaEconomyDashboard.jsx
            ├── UnemploymentModule.jsx
            ├── PoliticalModule.jsx
            ├── AspirationalDistrictsModule.jsx
            ├── HealthGapsModule.jsx
            ├── CrimesModule.jsx
            ├── NREGAModule.jsx
            ├── SexualViolenceModule.jsx
            └── GlobalFooter.jsx
```

All development work happens inside `All_Data_in/`. The root-level `package.json` is not the application's manifest.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 + `@rolldown/plugin-babel` |
| Routing | React Router DOM v7 |
| Charts | Recharts 3 |
| 3D | three.js (via `three.js` npm package) |
| Compiler | React Compiler (via `babel-plugin-react-compiler`) |
| Linting | ESLint 10 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` |
| Deploy | Vercel (SPA rewrite in `vercel.json`) |
| Language | JavaScript (`.jsx`) — no TypeScript |

## Development Commands

All commands must be run from `All_Data_in/`:

```bash
cd All_Data_in
npm install      # install dependencies
npm run dev      # start dev server (Vite HMR)
npm run build    # production build → dist/
npm run preview  # preview production build locally
npm run lint     # run ESLint
```

## Architecture

### Routing (`src/App.jsx`)

The `App` component defines a sticky navigation bar and a `<Routes>` tree. Each route maps to a single self-contained module component:

| Route | Component |
|---|---|
| `/` | `IndiaEconomyDashboard` |
| `/jobs` | `UnemploymentModule` |
| `/political` | `PoliticalModule` |
| `/social` | `AspirationalDistrictsModule` |
| `/health` | `HealthGapsModule` |
| `/crimes` | `CrimesModule` |
| `/nrega` | `NREGAModule` |
| `/trafficking` | `SexualViolenceModule` |

### Module Components

Each module (`src/components/*Module.jsx`) is a large, self-contained component (16–31 KB) that:
- Embeds its own dataset as JavaScript constants
- Renders charts and tables via Recharts
- Uses inline styles exclusively — no CSS classes or external stylesheet beyond `App.css`/`index.css`
- Has no side effects, no API calls, no external state

### Styling Conventions

- **All styles are inline JSX objects** — do not add CSS files or classnames unless changing the whole approach.
- **Dark theme**: background `#080808` / `#111`, text `#ccc` / `#999`.
- **Accent colour**: `#ff6b00` (orange).
- **Typography**: `'IBM Plex Mono', monospace` for data/labels; `'Bebas Neue', sans-serif` for headings.
- `letterSpacing` is used heavily for uppercase label text.

## Key Conventions

1. **No TypeScript** — keep files as `.jsx`.
2. **No CSS framework** — no Tailwind, no CSS Modules. Use inline style objects.
3. **Data is collocated** — each module file contains its own dataset. Do not split data into separate files unless the component is refactored.
4. **React Compiler is active** — avoid manual `useMemo`/`useCallback` unless the compiler explicitly cannot optimise the case.
5. **ESLint rule**: `no-unused-vars` errors on lowercase names; variables following `^[A-Z_]` pattern are allowed unused.
6. **No tests** — there is currently no test suite. Do not add test infrastructure without discussion.
7. **Recharts pattern** — use `<ResponsiveContainer>` wrapping any chart to ensure responsive layouts.

## Deployment

Deployed to **Vercel**. `All_Data_in/vercel.json` contains a catch-all SPA rewrite:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Vercel's root directory should be set to `All_Data_in`.

## ⚠ Critical Security Issue

**The root `.gitignore` file contains a committed OpenSSH private key.**

Immediate actions required:
1. **Revoke the key immediately** — treat it as fully compromised.
2. Remove the private key from `.gitignore` (the file is misnamed — it is not a gitignore).
3. Use `git filter-repo` or BFG Repo Cleaner to purge the key from all history and force-push.
4. Add `node_modules/` and any key/credential files to a proper `.gitignore`.

Do not commit any secrets, API keys, or private keys to this repository.

## What NOT to Do

- Do not run commands from the repo root — the application lives in `All_Data_in/`.
- Do not commit `node_modules/` (already in some history — do not repeat).
- Do not add TypeScript without explicit agreement — there is no `tsconfig.json`.
- Do not create additional `.gitignore` files that could accidentally hide other content.
- Do not assume `three.js` (the npm package name) provides the same API as the canonical `three` package — the package name on npm is `three`, not `three.js`; this may be a mistake in `package.json`.
