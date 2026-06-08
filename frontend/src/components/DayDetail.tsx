import { useState, useCallback } from "react"
import { Trash2, CalendarDays } from "lucide-react"
import { CategoryBadge } from "@/components/CategoryBadge"
import { Button } from "@/components/ui/button"
import { categoryColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { DiaryEntry } from "@/lib/types"

interface DayDetailProps {
  date: string
  items: DiaryEntry[]
  onDeleteItem: (itemId: string) => void
  onMoveItem: (itemId: string, newDate: string) => void
  onClearDay: () => void
}

export function DayDetail({ date, items, onDeleteItem, onMoveItem, onClearDay }: DayDetailProps) {
  const [movingId, setMovingId] = useState<string | null>(null)
  const [moveDate, setMoveDate] = useState("")

  const startMove = useCallback((itemId: string) => {
    setMovingId(itemId)
    setMoveDate(date)
  }, [date])

  const confirmMove = useCallback(() => {
    if (movingId && moveDate) {
      onMoveItem(movingId, moveDate)
    }
    setMovingId(null)
    setMoveDate("")
  }, [movingId, moveDate, onMoveItem])

  const cancelMove = useCallback(() => {
    setMovingId(null)
    setMoveDate("")
  }, [])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-200 py-8">
        <span className="text-2xl">📅</span>
        <p className="mt-1 text-sm text-neutral-400">No entries for this day</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
        <Button variant="ghost" size="sm" onClick={onClearDay} className="h-7 text-xs text-red-400 hover:text-red-600">
          Clear day
        </Button>
      </div>
      {items.map((entry) => {
        const color = categoryColor(entry.food.category)
        const isMoving = movingId === entry.id
        return (
          <div
            key={entry.id}
            className={cn("rounded-md border border-neutral-200 bg-white px-3 py-2", "border-l-4", color.border)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium">{entry.food.name}</span>
                <CategoryBadge category={entry.food.category} />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-xs text-neutral-400">{entry.quantity} {entry.food.unit}</span>
                <button
                  onClick={() => startMove(entry.id)}
                  className="rounded p-1 text-neutral-300 hover:text-neutral-500"
                  title="Move to another date"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDeleteItem(entry.id)}
                  className="rounded p-1 text-neutral-300 hover:text-red-500"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {isMoving && (
              <div className="mt-2 flex items-center gap-2 border-t border-neutral-100 pt-2">
                <label className="text-xs text-neutral-500">Move to:</label>
                <input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="h-8 flex-1 rounded border border-neutral-200 px-2 text-xs outline-none focus:border-neutral-400"
                />
                <button
                  onClick={confirmMove}
                  className="rounded bg-neutral-900 px-2 py-1 text-xs text-white"
                >
                  Move
                </button>
                <button
                  onClick={cancelMove}
                  className="rounded px-2 py-1 text-xs text-neutral-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
