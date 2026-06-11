import { Trash2, Eye } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/CategoryBadge"
import { NutrientPreviewModal } from "@/components/NutrientPreviewModal"
import { categoryColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { FoodSummary } from "@/lib/types"

export interface ItemEntry {
  id: string
  food: FoodSummary
  quantity: number
  lastTouched: number
}

interface ItemsTableProps {
  items: ItemEntry[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function ItemsTable({ items, onUpdateQuantity, onRemove }: ItemsTableProps) {
  const [previewFood, setPreviewFood] = useState<FoodSummary | null>(null)

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border-2 border-dashed border-neutral-200 dark:border-neutral-700 py-6">
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Pick foods to start tracking</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="sticky top-0 z-10 hidden grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-b border-neutral-200/50 dark:border-neutral-700/50 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm px-1 py-0.5 text-[11px] font-medium text-neutral-400/60 dark:text-neutral-500/60 md:grid">
        <span>Food</span>
        <span></span>
        <span>Qty</span>
        <span></span>
      </div>
      {items.map((entry) => {
        const color = categoryColor(entry.food.category)
        return (
          <div
            key={entry.id}
            className={cn(
              "grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2",
              "border-l-4",
              color.border,
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium">{entry.food.name}</span>
              <CategoryBadge category={entry.food.category} />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreviewFood(entry.food) }}
              className="shrink-0 rounded p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Preview nutrients"
            >
              <Eye className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0.01}
                step={entry.food.min_increment}
                value={entry.quantity}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v) && v >= 0) onUpdateQuantity(entry.id, v)
                }}
                className="h-8 w-20 text-right text-sm"
              />
              <span className="w-8 text-xs text-neutral-400 dark:text-neutral-500">{entry.food.unit}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemove(entry.id)} className="h-8 w-8 text-neutral-400 dark:text-neutral-500 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}

      <NutrientPreviewModal food={previewFood} onClose={() => setPreviewFood(null)} />
    </div>
  )
}
