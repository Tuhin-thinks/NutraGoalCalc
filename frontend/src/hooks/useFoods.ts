import { useEffect, useState, useCallback } from "react"
import { getFoods, ALL_CATEGORIES } from "@/lib/api"
import type { FoodSummary, Category } from "@/lib/types"

let cachedFoods: FoodSummary[] | null = null

export function clearFoodCache() {
  cachedFoods = null
}

export function useFoods(category?: string) {
  const [foods, setFoods] = useState<FoodSummary[]>(cachedFoods ?? [])
  const [loading, setLoading] = useState(!cachedFoods)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFoods(category && category !== "all" ? category : undefined)
      const filtered: FoodSummary[] =
        category && category !== "all"
          ? data.foods.filter((f) => f.category === category)
          : data.foods
      if (!category || category === "all") {
        cachedFoods = data.foods
      }
      setFoods(filtered)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load foods")
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    if (cachedFoods && (!category || category === "all")) {
      setFoods(cachedFoods)
      setLoading(false)
      return
    }
    load()
  }, [load, category])

  return { foods, loading, error, refetch: load }
}

export function useCategories() {
  const [categories] = useState<Category[]>(ALL_CATEGORIES)
  return categories
}
