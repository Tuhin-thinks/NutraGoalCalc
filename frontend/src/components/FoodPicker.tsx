import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FoodCard } from "@/components/FoodCard"
import { CategoryFilter } from "@/components/CategoryFilter"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useFoods } from "@/hooks/useFoods"
import { getFoods } from "@/lib/api"
import type { FoodSummary } from "@/lib/types"
import type { ItemEntry } from "@/components/ItemsTable"

interface FoodPickerProps {
  onAddFood: (food: FoodSummary) => void
  onAddItems: (items: Array<{ food: FoodSummary; quantity: number }>) => void
  items?: ItemEntry[]
}

function itemsToJson(items: ItemEntry[]): string {
  return JSON.stringify(
    items.map((it) => ({ food_id: it.food.id, quantity: it.quantity })),
    null,
    2,
  )
}

export function FoodPicker({ onAddFood, onAddItems, items }: FoodPickerProps) {
  const [mode, setMode] = useState<"picker" | "json">("picker")
  const [category, setCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const { foods, loading, error } = useFoods(mode === "json" ? "all" : category)
  const [jsonText, setJsonText] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [foodLookup, setFoodLookup] = useState<Map<string, FoodSummary>>(new Map())
  const [copied, setCopied] = useState(false)
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCategory = (cat: string) => {
    setCategory((prev) => (prev === cat ? "all" : cat))
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return foods
    const q = search.toLowerCase()
    return foods.filter((f) => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q))
  }, [foods, search])

  useEffect(() => {
    if (mode === "json" && foodLookup.size === 0) {
      getFoods().then((data) => {
        setFoodLookup(new Map(data.foods.map((f) => [f.id, f])))
      })
    }
  }, [mode, foodLookup.size])

  const handleModeChange = useCallback((newMode: "picker" | "json") => {
    if (newMode === "json" && items && items.length > 0) {
      setJsonText(itemsToJson(items))
    }
    setMode(newMode)
    setJsonError(null)
  }, [items])

  const handleCopy = useCallback(() => {
    const text = mode === "json" ? jsonText : (items ? itemsToJson(items) : "")
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [mode, jsonText, items])

  const handleJsonSubmit = useCallback(() => {
    setJsonError(null)
    try {
      let parsed: unknown = JSON.parse(jsonText)
      let entries: Array<{ food_id: string; quantity: number }> = []

      if (Array.isArray(parsed)) {
        entries = parsed as Array<{ food_id: string; quantity: number }>
      } else if (typeof parsed === "object" && parsed !== null && "food_items" in parsed) {
        entries = (parsed as { food_items: Array<{ food_id: string; quantity: number }> }).food_items
      } else {
        setJsonError("JSON must be an array of {food_id, quantity} or {food_items: [...]}")
        return
      }

      const resolved: Array<{ food: FoodSummary; quantity: number }> = []
      for (const entry of entries) {
        if (!entry.food_id || !entry.quantity || entry.quantity <= 0) {
          setJsonError(`Invalid entry: ${JSON.stringify(entry)}`)
          return
        }
        const food = foodLookup.get(entry.food_id)
        if (!food) {
          setJsonError(`Food not found: "${entry.food_id}"`)
          return
        }
        resolved.push({ food, quantity: entry.quantity })
      }

      if (resolved.length === 0) {
        setJsonError("No valid items to add")
        return
      }

      onAddItems(resolved)
      setJsonText("")
    } catch {
      setJsonError("Invalid JSON format")
    }
  }, [jsonText, foodLookup, onAddItems])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-red-500">Failed to load foods: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Mode toggle + copy button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-700 p-0.5">
          <button
            onClick={() => handleModeChange("picker")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${mode === "picker" ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            Picker
          </button>
          <button
            onClick={() => handleModeChange("json")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${mode === "json" ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            JSON
          </button>
        </div>
        {items && items.length > 0 && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        )}
      </div>

      {mode === "picker" && (
        <>
          <CategoryFilter selected={category} onSelect={handleCategory} />
          <Input
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full shrink-0" />)
              : filtered.map((food) => (
                  <FoodCard key={food.id} food={food} onClick={onAddFood} />
                ))}
            {!loading && filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
                No foods found{search ? ` matching "${search}"` : ""}
              </p>
            )}
          </div>
        </>
      )}

      {mode === "json" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Paste JSON array: <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 text-[11px]">[{"{"}"food_id": "chicken_breast_100g", "quantity": 200{"}"}]</code> or <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 text-[11px]">{"{"}"food_items": [...]{"}"}</code>
          </p>
          <textarea
            ref={jsonTextareaRef}
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setJsonError(null) }}
            placeholder='[{"food_id": "chicken_breast_100g", "quantity": 200}]'
            className="flex min-h-0 flex-1 resize-none rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-sm font-mono outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <Button onClick={handleJsonSubmit} disabled={!jsonText.trim()}>
            Add Items
          </Button>
        </div>
      )}
    </div>
  )
}
