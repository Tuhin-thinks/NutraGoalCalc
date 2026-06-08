# NutraGoalCalc Backend — API Usage

## Getting Started

```bash
# Install dependencies & start the dev server
uv sync
uv run uvicorn nvc.main:app --reload --port 8000
```

Interactive docs (OpenAPI): http://localhost:8000/docs

---

## Catalogue Read Endpoints

### `GET /api/v1/healthz`

Liveness probe.

```json
// Response 200
{ "status": "ok" }
```

### `GET /api/v1/foods`

List all foods with optional `?category=` filter.

```bash
curl http://localhost:8000/api/v1/foods
curl "http://localhost:8000/api/v1/foods?category=protein"
```

```json
// Response 200
{
  "count": 30,
  "foods": [
    {
      "id": "chicken_breast_100g",
      "name": "Chicken Breast (airfried/grilled)",
      "category": "protein",
      "unit": "g"
    }
  ]
}
```

### `GET /api/v1/foods/{food_id}`

Fetch a single food entry by its `id`. Returns 404 if not found.

```bash
curl http://localhost:8000/api/v1/foods/chicken_breast_100g
```

```json
// Response 200
{
  "id": "chicken_breast_100g",
  "name": "Chicken Breast (airfried/grilled)",
  "category": "protein",
  "unit": "g"
}
```

### `GET /api/v1/categories`

List distinct food categories with food counts.

```json
// Response 200
{
  "count": 6,
  "categories": [
    { "category": "carbs", "count": 3 },
    { "category": "fat", "count": 2 },
    { "category": "fiber", "count": 2 },
    { "category": "fruit", "count": 4 },
    { "category": "protein", "count": 13 },
    { "category": "vegetable", "count": 6 }
  ]
}
```

### `GET /api/v1/targets`

Return catalogue metadata and the daily macro targets.

```json
// Response 200
{
  "metadata": { "name": "Body Recomposition Nutrition Tracker", "version": "1.0", ... },
  "daily_targets": {
    "calories_kcal": { "min": 1800, "max": 2100 },
    "protein_g":     { "min": 110,  "max": 130 },
    "carbs_g":       { "min": 160,  "max": 220 },
    "fat_g":         { "min": 50,   "max": 65 }
  }
}
```

---

## Calculation Endpoints

### `POST /api/v1/calculate`

Compute **total** nutritional values for one or more food entries.

Each item's `quantity` is expressed in the **food's native unit** as defined in the catalogue:
- `"g"` → quantity in grams (e.g. `200` for 200g)
- `"each"`, `"scoop"`, `"bowl"`, `"cup"`, `"tbsp"`, `"tsp"`, `"medium"`, `"large"` → count (e.g. `2` for 2 eggs, `1` for 1 scoop)

**Scaling rule:**
- For `unit == "g"`: nutrition = `nutrition_per_unit × (quantity / reference_weight_g)`
- For all other units: nutrition = `nutrition_per_unit × quantity`

```bash
curl -X POST http://localhost:8000/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "food_id": "chicken_breast_100g", "quantity": 200 },
      { "food_id": "whey_isolate_1_scoop", "quantity": 1 }
    ]
  }'
```

```json
// Response 200
{
  "totals": {
    "protein_g": 85.0,
    "carbs_g": 1.5,
    "fat_g": 7.5,
    "calories_kcal": 445.0,
    "fiber_g": 0.0
  },
  "items": [
    {
      "food_id": "chicken_breast_100g",
      "name": "Chicken Breast (airfried/grilled)",
      "quantity": 200.0,
      "unit": "g",
      "scaling_factor": 2.0,
      "nutrition": {
        "protein_g": 60.0,
        "carbs_g": 0.0,
        "fat_g": 7.0,
        "calories_kcal": 330.0,
        "fiber_g": 0.0
      }
    },
    {
      "food_id": "whey_isolate_1_scoop",
      "name": "Whey Isolate (1 scoop, water mixed)",
      "quantity": 1.0,
      "unit": "scoop",
      "scaling_factor": 1.0,
      "nutrition": {
        "protein_g": 25.0,
        "carbs_g": 1.5,
        "fat_g": 0.5,
        "calories_kcal": 115.0,
        "fiber_g": 0.0
      }
    }
  ]
}
```

### `POST /api/v1/calculate/with-targets`

Same as `/calculate` but also returns a **target comparison** showing how the calculated totals relate to the daily macro targets defined in the catalogue.

```bash
curl -X POST http://localhost:8000/api/v1/calculate/with-targets \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "food_id": "chicken_breast_100g", "quantity": 200 }
    ]
  }'
```

```json
// Response 200
{
  "totals": { "protein_g": 60.0, "carbs_g": 0.0, "fat_g": 7.0, "calories_kcal": 330.0, "fiber_g": 0.0 },
  "items": [ /* ... per-item breakdowns ... */ ],
  "target_comparison": [
    {
      "nutrient": "calories_kcal",
      "current": 330.0,
      "min": 1800.0,
      "max": 2100.0,
      "percent_of_midpoint": 16.9
    },
    {
      "nutrient": "protein_g",
      "current": 60.0,
      "min": 110.0,
      "max": 130.0,
      "percent_of_midpoint": 50.0
    },
    {
      "nutrient": "carbs_g",
      "current": 0.0,
      "min": 160.0,
      "max": 220.0,
      "percent_of_midpoint": 0.0
    },
    {
      "nutrient": "fat_g",
      "current": 7.0,
      "min": 50.0,
      "max": 65.0,
      "percent_of_midpoint": 12.2
    }
  ]
}
```

---

## Error Responses

| Status | Condition | Example `detail` |
|---|---|---|
| `404` | Unknown `food_id` | `"food 'nope' not found"` |
| `422` | Empty `items` array | `"List should have at least 1 item"` |
| `422` | Negative/zero `quantity` | `"Input should be greater than 0"` |

---

## Example Meal Calculation

```json
POST /api/v1/calculate
{
  "items": [
    { "food_id": "chicken_breast_100g", "quantity": 200 },
    { "food_id": "cooked_rice_1_cup",   "quantity": 1 },
    { "food_id": "mixed_salad_1_bowl",  "quantity": 1 },
    { "food_id": "mustard_oil_1_tsp",   "quantity": 2 }
  ]
}
```

Returns totals for a lunch meal: chicken + rice + salad + oil.
