import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { FoodPicker } from "@/components/FoodPicker"
import { ItemsTable, type ItemEntry } from "@/components/ItemsTable"
import { ResultsPanel } from "@/components/ResultsPanel"
import { WeightInputModal } from "@/components/WeightInputModal"
import { useDebouncedCalculate } from "@/hooks/useDebouncedCalculate"
import { useTargets } from "@/hooks/useTargets"
import { loadItems, saveItems, exportAllData, importAllData } from "@/lib/storage"
import { saveDiaryEntry, getToday, loadDiary } from "@/lib/diary"
import type { FoodSummary, CalculationItem, WeightInputs, TargetComparisonResponse } from "@/lib/types"

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
  onNavigateToDiary: () => void
}

export function HomePage({ onNavigateToFoods, onNavigateToDiary }: HomePageProps) {
  const [items, setItems] = useState<ItemEntry[]>(initItems)
  const { targets, weightInputs, needsWeights, refresh } = useTargets()
  const [showWeightsModal, setShowWeightsModal] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [resultCache, setResultCache] = useState<TargetComparisonResponse | null>(null)

  const calculationItems: CalculationItem[] = useMemo(
    () => items.map((it) => ({ food_id: it.food.id, quantity: it.quantity })),
    [items],
  )

  const { result, loading, error } = useDebouncedCalculate(calculationItems, targets)

  useEffect(() => {
    if (result) setResultCache(result)
  }, [result])

  const sorted: ItemEntry[] = useMemo(
    () => [...items].sort((a, b) => b.lastTouched - a.lastTouched),
    [items],
  )

  useEffect(() => {
    saveItems(items)
  }, [items])

  useEffect(() => {
    if (items.length > 0 && needsWeights) {
      setShowWeightsModal(true)
    }
  }, [items, needsWeights])

  const handleAddFood = useCallback((food: FoodSummary) => {
    const now = Date.now()
    setItems((prev) => {
      if (prev.some((it) => it.food.id === food.id)) return prev
      return [...prev, { id: nextId(), food, quantity: food.unit === "g" ? 100 : 1, lastTouched: now }]
    })
  }, [])

  const handleAddItems = useCallback((entries: Array<{ food: FoodSummary; quantity: number }>) => {
    const now = Date.now()
    setItems((prev) => {
      const existing = new Set(prev.map((it) => it.food.id))
      const newEntries = entries
        .filter(({ food }) => !existing.has(food.id))
        .map(({ food, quantity }) => ({ id: nextId(), food, quantity, lastTouched: now }))
      return [...prev, ...newEntries]
    })
  }, [])

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    const now = Date.now()
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity, lastTouched: now } : it)))
  }, [])

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const handleRetry = useCallback(() => {
    setItems((prev) => [...prev])
  }, [])

  const handleWeightsSave = useCallback((_inputs: WeightInputs) => {
    refresh()
    setShowWeightsModal(false)
  }, [refresh])

  const handleExport = useCallback(() => {
    const data = exportAllData(resultCache)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "nutragocalc-export.json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported")
  }, [resultCache])

  const handleImport = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (importAllData(data)) {
          toast.success("Data imported — reloading…")
          setTimeout(() => window.location.reload(), 500)
        } else {
          toast.error("Invalid export file")
        }
      } catch {
        toast.error("Failed to parse file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }, [])

  const handleSaveToDiary = useCallback(() => {
    const today = getToday()
    const diary = loadDiary()
    if (diary[today] && diary[today].items.length > 0) {
      const overwrite = window.confirm("Replace existing diary entry for today?")
      if (!overwrite) return
    }
    saveDiaryEntry(today, items)
    toast.success("Saved to diary")
  }, [items])

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <WeightInputModal
        open={showWeightsModal}
        initial={weightInputs}
        onSave={handleWeightsSave}
        onClose={() => setShowWeightsModal(false)}
      />

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥗</span>
          <h1 className="text-lg font-bold text-neutral-800">NutraGoalCalc</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          {weightInputs && (
            <button
              onClick={() => setShowWeightsModal(true)}
              className="hidden md:inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-0.5 text-xs hover:border-neutral-300 hover:text-neutral-700"
            >
              {weightInputs.currentWeight} kg → {weightInputs.targetWeight} kg
              <span className="ml-1 rounded bg-neutral-100 px-1 text-[10px] font-medium">{weightInputs.strategy}</span>
            </button>
          )}
          {!weightInputs && (
            <button
              onClick={() => setShowWeightsModal(true)}
              className="hidden md:inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-0.5 text-xs hover:border-neutral-300 hover:text-neutral-700"
            >
              Set targets
            </button>
          )}
          {items.length > 0 && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          )}
          {items.length > 0 && (
            <button onClick={handleSaveToDiary} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700">
              Save to Diary
            </button>
          )}
          <button onClick={handleExport} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700">
            Export
          </button>
          <button onClick={handleImport} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700">
            Import
          </button>
          <button onClick={onNavigateToDiary} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700">
            Diary
          </button>
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
              <FoodPicker onAddFood={handleAddFood} onAddItems={handleAddItems} items={sorted} />
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
              needsWeights={needsWeights}
              onOpenWeights={() => setShowWeightsModal(true)}
              weightInputs={weightInputs}
              targets={targets}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
