import { cn } from "@/lib/utils"
import { categoryColor } from "@/lib/colors"
import type { Category } from "@/lib/types"

interface CategoryBadgeProps {
  category: Category
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const color = categoryColor(category)
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", color.light, color.text, className)}>
      {category}
    </span>
  )
}
