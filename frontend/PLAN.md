# NutraGoalCalc Frontend — Build Plan

## Overview

Single-page React (Vite + TypeScript + Tailwind + shadcn/ui) consuming the
FastAPI backend at `http://localhost:8000/api/v1/...`.

**Fork/read this file first if you are an AI agent picking up this task.**

---

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | Vite 6 |
| Language | TypeScript (strict) |
| Package manager | yarn (v4, see `package.json` → `packageManager`) |
| UI library | React 19 |
| Styling | Tailwind CSS v3 + CSS variables |
| Primitives | shadcn/ui (Radix-based, copied into `src/components/ui/`) |
| Icons | lucide-react |
| State | local `useState` + custom hooks (no Redux/Zustand) |
| Router | none (single page) |
| Charts | none (pure CSS progress bars) |
| Toasts | sonner |

## Folder layout

```
frontend/
├── package.json
├── yarn.lock
├── .gitignore
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json              ← shadcn config
├── src/
│   ├── main.tsx                 ← React entry
│   ├── App.tsx                  ← top layout + Toaster
│   ├── index.css                ← Tailwind directives + CSS vars
│   ├── lib/
│   │   ├── utils.ts             ← cn() helper (shadcn)
│   │   ├── types.ts             ← all API types
│   │   ├── api.ts               ← typed fetch wrappers
│   │   ├── colors.ts            ← per-category color mapping
│   │   └── format.ts            ← number/unit formatters
│   ├── hooks/
│   │   ├── useFoods.ts          ← GET /foods, cached
│   │   ├── useTargets.ts        ← GET /targets, cached
│   │   └── useDebouncedCalculate.ts ← debounced POST + AbortController
│   ├── components/
│   │   ├── ui/                  ← shadcn-generated
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   └── skeleton.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── FoodCard.tsx
│   │   ├── FoodPicker.tsx
│   │   ├── ItemsTable.tsx
│   │   ├── AddItemRow.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── NutrientBar.tsx
│   │   ├── ItemsBreakdown.tsx
│   │   └── ErrorBanner.tsx
│   └── pages/
│       └── HomePage.tsx         ← the single page
└── PLAN.md
```

---

## Design tokens

### Color triangle — per food category

Six hues spaced 60° apart on the color wheel (triadic family):

| Category    | Hue | Tailwind token | Hex (L8)   |
|-------------|-----|----------------|-------------|
| `protein`   | 0°  | `protein`      | `#e11d48`  |
| `carbs`     | 120°| `carbs`        | `#16a34a`  |
| `fat`       | 240°| `fat`          | `#2563eb`  |
| `vegetable` | 60° | `vegetable`    | `#ca8a04`  |
| `fruit`     | 180°| `fruit`        | `#0891b2`  |
| `fiber`     | 300°| `fiber`        | `#a21caf`  |

Usage: category badges, food-card borders, per-item dots in breakdown.

### Progress bar status colors (separate axis)

- **Under target** (`current < min`): `#ef4444` (red)
- **In range** (`min ≤ current ≤ max`): `#eab308` (yellow)
- **Over target** (`current > max`): `#22c55e` (green)

### Layout tokens (in `index.css` CSS variables)

- `--color-surface`: `#fafafa` (page bg)
- `--color-card`: `#ffffff` (card bg)
- `--color-border`: `#e5e7eb` (1px card borders)
- `--radius`: `0.5rem`
- `--header-height`: `4rem`

---

## Layout

### Desktop (≥768px)

```
+---------------------------------------------+
|  Header (app name + targets pill)            |
+------------------------+---------------------+
| LEFT (1/2 width)       | RIGHT (1/2 width)   |
| — CategoryFilter chips | — NutrientBar × 4   |
| — Search input         | — ItemsBreakdown    |
| — FoodCard list        | — ColorWheel legend |
| — ItemsTable           |                     |
+------------------------+---------------------+
```

- `grid grid-cols-1 md:grid-cols-2 h-[calc(100dvh-4rem)]`
- Each side: `overflow-y-auto p-4`

### Mobile (<768px)

- Single-column stacked
- Each panel: `h-[calc(100dvh-4rem)]` with `snap-start`
- Container: `h-[calc(100dvh-4rem)] overflow-y-scroll snap-y snap-mandatory`
- User scrolls full-panel-by-full-panel

---

## Component behavior

### Data flow

```
User clicks FoodCard or types in AddItemRow
  → items[] grows in local state
  → useDebouncedCalculate debounces 250ms
    → POST /api/v1/calculate/with-targets
    → updates totals + items + target_comparison
    → ResultsPanel re-renders with transition
```

### Error handling

- **404** → inline ErrorBanner + toast "We don't have that food yet"
- **422** → toast "Quantity must be > 0" for that specific row
- **Network** → inline ErrorBanner + toast "Can't reach server"
- **Loading** → skeleton bars in ResultsPanel, previous data remains visible

### Debounce hook (`useDebouncedCalculate`)

```ts
function useDebouncedCalculate(items: CalculationItem[], ms = 250) {
  const [result, setResult] = useState<TargetComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect + setTimeout debounce
  // AbortController cancels prior in-flight request
  // Returns { result, loading, error }
}
```

---

## Dependency versions (package.json)

```json
{
  "name": "nutragocalc-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "yarn@4.7.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.482.0",
    "sonner": "^2.0.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-label": "^2.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@types/node": "^22.13.10",
    "eslint": "^9.22.0",
    "@eslint/js": "^9.22.0",
    "typescript-eslint": "^8.26.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11"
  }
}
```

---

## Vite dev proxy

```ts
// vite.config.ts
server: {
  proxy: {
    "/api": { target: "http://localhost:8000", changeOrigin: true }
  }
}
```

Allows the frontend to call `fetch("/api/v1/foods")` same-origin during development.

---

## Implementation order

1. **CORS** — one edit to `src/nvc/main.py` in the backend folder
2. **Scaffold** — create all config files + `yarn install`
3. **Design tokens** — `index.css`, `colors.ts`, `types.ts`, `api.ts`
4. **Hooks** — `useFoods`, `useTargets`, `useDebouncedCalculate`
5. **shadcn primitives** — copy manually into `src/components/ui/`
6. **Layout** — `App.tsx` + `HomePage.tsx` + grid + snap-scroll
7. **Left panel** — CategoryFilter, FoodPicker, FoodCard, ItemsTable, AddItemRow
8. **Right panel** — ResultsPanel, NutrientBar, ItemsBreakdown, ColorWheel
9. **Polish** — ErrorBanner, toasts, loading/empty states, keyboard nav
10. **Verify** — `yarn dev`, open browser, confirm proxy works, run through full flow

---

## Known assumptions (do not deviate without asking)

- No router, no auth, no multi-user, no persistence, no offline
- No recharts or charting library — pure CSS bars only
- Backend CORS is added to `src/nvc/main.py` before the frontend runs
- `fiber_g` has no daily target → no progress bar for fiber (shown as a number only)
- The `GET /api/v1/foods` endpoint only returns summary (id/name/category/unit);
  full nutrition data is only available via `POST /api/v1/calculate/with-targets`
