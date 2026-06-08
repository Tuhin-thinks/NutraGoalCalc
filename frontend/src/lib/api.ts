import type {
  FoodsListResponse,
  CategoriesResponse,
  CalculationRequest,
  CalculationResponse,
  Category,
  Unit,
  FoodCreate,
  FoodDetail,
} from "@/lib/types"

const BASE = "/api/v1"

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getFoods(category?: string): Promise<FoodsListResponse> {
  const params = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : ""
  return fetchJson(`${BASE}/foods${params}`)
}

export function getCategories(): Promise<CategoriesResponse> {
  return fetchJson(`${BASE}/categories`)
}

export function calculate(req: CalculationRequest): Promise<CalculationResponse> {
  return fetchJson(`${BASE}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })
}

export function getFoodDetail(id: string): Promise<FoodDetail> {
  return fetchJson(`${BASE}/foods/${encodeURIComponent(id)}`)
}

export function createFood(data: FoodCreate): Promise<FoodDetail> {
  return fetchJson(`${BASE}/foods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateFood(id: string, data: FoodCreate): Promise<FoodDetail> {
  return fetchJson(`${BASE}/foods/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteFood(id: string): Promise<void> {
  return fetchJson(`${BASE}/foods/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export const ALL_CATEGORIES: Category[] = [
  "protein",
  "carbs",
  "fruit",
  "vegetable",
  "fiber",
  "fat",
]

export const UNITS: Unit[] = ["g", "each", "bowl", "scoop", "cup", "tbsp", "tsp", "medium", "large"]
