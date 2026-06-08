import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/CategoryBadge"
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

const MAX_VISIBLE = 4

export function ItemsTable({ items, onUpdateQuantity, onRemove }: ItemsTableProps) {
  const [expanded, setExpanded] = useState(false)
  const count = items.length

  if (count === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border-2 border-dashed border-neutral-200 py-6">
        <p className="text-sm text-neutral-400">Pick foods to start tracking</p>
      </div>
    )
  }

  const visible = expanded ? items : items.slice(0, MAX_VISIBLE)
  const hidden = count - visible.length

  return (
    <div className="flex flex-col gap-1.5">
      <div className="hidden grid-cols-[1fr_auto_auto] gap-2 px-1 text-xs font-medium text-neutral-400 md:grid">
        <span>Food</span>
        <span>Qty</span>
        <span></span>
      </div>
      {visible.map((entry) => {
        const color = categoryColor(entry.food.category)
        return (
          <div
            key={entry.id}
            className={cn(
              "grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2",
              "border-l-4",
              color.border,
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium">{entry.food.name}</span>
              <CategoryBadge category={entry.food.category} />
            </div>
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
              <span className="w-8 text-xs text-neutral-400">{entry.food.unit}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemove(entry.id)} className="h-8 w-8 text-neutral-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}

      {hidden > 0 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className={cn(
            "flex items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700",
            expanded && "border-neutral-200",
          )}
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>{hidden} more item{hidden > 1 ? "s" : ""} <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  )
}
