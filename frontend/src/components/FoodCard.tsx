import { cn } from "@/lib/utils"
import { categoryColor } from "@/lib/colors"
import { CategoryBadge } from "@/components/CategoryBadge"
import type { FoodSummary } from "@/lib/types"

interface FoodCardProps {
  food: FoodSummary
  onClick: (food: FoodSummary) => void
}

export function FoodCard({ food, onClick }: FoodCardProps) {
  const color = categoryColor(food.category)
  return (
    <button
      onClick={() => onClick(food)}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-left transition-all hover:shadow-sm",
        "border-l-4",
        color.border,
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-neutral-900">{food.name}</p>
        <p className="text-xs text-neutral-400">{food.unit}</p>
      </div>
      <CategoryBadge category={food.category} />
    </button>
  )
}
