import { cn } from "@/lib/utils"
import { categoryColor } from "@/lib/colors"
import { ALL_CATEGORIES } from "@/lib/api"

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "rounded-full px-3 py-1 text-sm font-medium transition-colors",
          selected === "all" || !selected
            ? "bg-neutral-900 text-white"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
        )}
      >
        All
      </button>
      {ALL_CATEGORIES.map((cat) => {
        const color = categoryColor(cat)
        const isActive = selected === cat
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              isActive ? `${color.bg} text-white` : `${color.light} ${color.text} hover:opacity-80`,
            )}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
