import { useState } from "react"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryColor } from "@/lib/colors"
import { CategoryBadge } from "@/components/CategoryBadge"
import { NutrientPreviewModal } from "@/components/NutrientPreviewModal"
import type { FoodSummary } from "@/lib/types"

interface FoodCardProps {
  food: FoodSummary
  onClick: (food: FoodSummary) => void
}

export function FoodCard({ food, onClick }: FoodCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const color = categoryColor(food.category)
  return (
    <>
      <button
        onClick={() => onClick(food)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-left transition-all hover:shadow-sm dark:hover:shadow-black/20",
          "border-l-4",
          color.border,
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{food.name}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">{food.unit}</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowPreview(true) }}
          className="shrink-0 rounded p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Preview nutrients"
        >
          <Eye className="h-4 w-4" />
        </button>
        <CategoryBadge category={food.category} />
      </button>
      <NutrientPreviewModal food={showPreview ? food : null} onClose={() => setShowPreview(false)} />
    </>
  )
}
