import { categoryColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { ItemBreakdown } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface ItemsBreakdownProps {
  items: ItemBreakdown[]
}

export function ItemsBreakdown({ items }: ItemsBreakdownProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-neutral-600">Per-Item Breakdown</h4>
      {items.map((item) => {
        const color = categoryColor(
          // Infer category from food id prefix — frontend doesn't have the full schema
          item.food_id.startsWith("chicken") || item.food_id.includes("whey") || item.food_id.includes("egg") || item.food_id.includes("paneer") || item.food_id.includes("soya") || item.food_id.includes("sardine") || item.food_id.includes("sprouts") || item.food_id.includes("curd") || item.food_id.includes("milk")
            ? "protein"
            : item.food_id.includes("rice") || item.food_id.includes("oats") || item.food_id.includes("roti")
              ? "carbs"
              : item.food_id.includes("apple") || item.food_id.includes("banana") || item.food_id.includes("orange") || item.food_id.includes("berries")
                ? "fruit"
                : item.food_id.includes("salad") || item.food_id.includes("broccoli") || item.food_id.includes("spinach") || item.food_id.includes("tomato") || item.food_id.includes("carrot")
                  ? "vegetable"
                  : item.food_id.includes("flax") || item.food_id.includes("psyllium")
                    ? "fiber"
                    : "fat",
        )
        return (
          <div key={item.food_id} className={cn("rounded-md border border-neutral-200 bg-white px-3 py-2", "border-l-4", color.border)}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">{item.name}</span>
              <span className="text-xs text-neutral-400">
                {item.quantity} {item.unit}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500">
              <span>{item.nutrition.calories_kcal.toFixed(0)} kcal</span>
              <span>P {item.nutrition.protein_g.toFixed(1)}g</span>
              <span>C {item.nutrition.carbs_g.toFixed(1)}g</span>
              <span>F {item.nutrition.fat_g.toFixed(1)}g</span>
              {item.nutrition.fiber_g > 0 && <span>Fib {item.nutrition.fiber_g.toFixed(1)}g</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ItemsBreakdownSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}
