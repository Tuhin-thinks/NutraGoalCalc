# NutraGoalCalc

Plan your meals to hit your daily protein, carbs, fat, and fiber targets — calculated from your body weight.

---

## What it does

- Pick foods from a built-in catalogue, set how much you eat, and see instant nutrition totals
- Enter your current weight and goal weight — the app automatically calculates your daily protein, fat, carbs, and fiber targets
- Choose between two calculation strategies: **AI** (goal-weight-based) or **Insta** (your own formula using both current and goal weight)
- Copy any screen's data as JSON to share with an AI coach or save for later

---

## Quick start

You need to install two tools first, then start the backend and frontend.

### Step 1 — Install Python

1. Go to [python.org/downloads](https://python.org/downloads)
2. Download **Python 3.12 or newer** for Windows
3. Run the installer — **check the box** that says "Add Python to PATH", then click Install

### Step 2 — Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** version (left button)
3. Run the installer — just click Next through all the steps

### Step 3 — Open a terminal

1. Press **Windows Key + R**, type `powershell`, and press Enter
2. Navigate to the project folder by typing:

```powershell
cd "C:\Users\tuhin\Documents\PersonalProjects\nutritional_values_calculator"
```

(If you extracted the project somewhere else, use that path instead.)

### Step 4 — Install and start the backend

Run these commands one by one:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
uvicorn src.nvc.main:app --reload --port 8000
```

Leave this terminal window open — the backend is now running.

### Step 5 — Install and start the frontend

Open a **second** PowerShell window and run:

```powershell
cd "C:\Users\tuhin\Documents\PersonalProjects\nutritional_values_calculator\frontend"
npm install
npm run dev
```

### Step 6 — Open the app

Open your browser and go to:

```
http://localhost:5173
```

---

## How to use

1. **Set your weight** — When the app opens, a pop-up asks for your current weight and goal weight. Fill them in and pick a strategy (AI or Insta). These are saved in your browser, so you only do this once.
2. **Pick foods** — Browse or search the food catalogue. Click a food to add it. Adjust the quantity.
3. **See your targets** — The results panel shows your daily targets vs. what you've selected, with colored progress bars.
4. **Copy as JSON** — Click "Copy JSON" to export everything (foods, totals, targets) — paste it into a chat with an AI coach.

---

## Features

- 30+ common foods with full nutritional data
- Weight-based daily targets (no database storage — computed fresh each time)
- Two calculation strategies (AI / Insta)
- Fiber tracking with progress bar
- Category filter — click an active category to reset to "All"
- Search foods by name
- **Form/JSON toggle** on food picker and custom food form — paste or edit data as JSON
- **Copy JSON** buttons on results, food list, and food form for LLM context sharing
- Custom food creation

---

## Tech stack

- **Backend:** Python, FastAPI, SQLAlchemy
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Data:** Local SQLite database (seeded from `nutrition-values.json`)

---

## Author

Created by [tuhin-thinks](mailto:tuhinmitra190221@gmail.com)
