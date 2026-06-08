import { useState, useMemo, useCallback, useEffect } from "react"
import { FoodPicker } from "@/components/FoodPicker"
import { ItemsTable, type ItemEntry } from "@/components/ItemsTable"
import { ResultsPanel } from "@/components/ResultsPanel"
import { useDebouncedCalculate } from "@/hooks/useDebouncedCalculate"
import { useTargets } from "@/hooks/useTargets"
import { loadItems, saveItems } from "@/lib/storage"
import type { FoodSummary, CalculationItem } from "@/lib/types"

let idCounter = 0
function nextId() {
  return `item_${++idCounter}`
}

function initItems(): ItemEntry[] {
  const saved = loadItems().map((e) => ({ ...e, lastTouched: e.lastTouched ?? Date.now() }))
  const max = saved.reduce((m, e) => {
    const n = parseInt(e.id.replace("item_", ""), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  idCounter = max
  return saved
}

interface HomePageProps {
  onNavigateToFoods: () => void
}

export function HomePage({ onNavigateToFoods }: HomePageProps) {
  const [items, setItems] = useState<ItemEntry[]>(initItems)
  const { targets } = useTargets()

  const calculationItems: CalculationItem[] = useMemo(
    () => items.map((it) => ({ food_id: it.food.id, quantity: it.quantity })),
    [items],
  )

  const { result, loading, error } = useDebouncedCalculate(calculationItems)

  const sorted: ItemEntry[] = useMemo(
    () => [...items].sort((a, b) => b.lastTouched - a.lastTouched),
    [items],
  )

  const addedIds = useMemo(() => new Set(items.map((it) => it.food.id)), [items])

  useEffect(() => {
    saveItems(items)
  }, [items])

  const handleAddFood = useCallback((food: FoodSummary) => {
    if (addedIds.has(food.id)) return
    const now = Date.now()
    setItems((prev) => [...prev, { id: nextId(), food, quantity: food.unit === "g" ? 100 : 1, lastTouched: now }])
  }, [addedIds])

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    const now = Date.now()
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity, lastTouched: now } : it)))
  }, [])

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const handleRetry = useCallback(() => {
    // Force re-fetch by toggling a dummy state
    setItems((prev) => [...prev])
  }, [])

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥗</span>
          <h1 className="text-lg font-bold text-neutral-800">NutraGoalCalc</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          {targets && (
            <span className="hidden md:inline">
              Target: {targets.calories_kcal.min}-{targets.calories_kcal.max} kcal
            </span>
          )}
          {items.length > 0 && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          )}
          <button onClick={onNavigateToFoods} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700">
            Manage Foods
          </button>
        </div>
      </header>

      {/* Main content — snap-scroll on mobile, 2-col grid on desktop */}
      <div className="snap-container flex-1">
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* LEFT PANEL — only the food list scrolls; items table pins at bottom */}
          <div className="snap-panel flex flex-col border-r border-neutral-200 bg-neutral-50/50 md:h-full">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 pb-0">
              <FoodPicker onAddFood={handleAddFood} />
            </div>
            <div className="shrink-0 p-4 pt-3">
              <ItemsTable
                items={sorted}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            </div>
          </div>

          {/* RIGHT PANEL — fully static, fills viewport */}
          <div className="snap-panel overflow-y-hidden bg-white p-4 md:h-full">
            <ResultsPanel
              result={result}
              loading={loading}
              error={error}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
