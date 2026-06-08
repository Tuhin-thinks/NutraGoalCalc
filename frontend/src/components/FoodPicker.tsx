import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { FoodCard } from "@/components/FoodCard"
import { CategoryFilter } from "@/components/CategoryFilter"
import { Skeleton } from "@/components/ui/skeleton"
import { useFoods } from "@/hooks/useFoods"
import type { FoodSummary } from "@/lib/types"

interface FoodPickerProps {
  onAddFood: (food: FoodSummary) => void
}

export function FoodPicker({ onAddFood }: FoodPickerProps) {
  const [category, setCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const { foods, loading, error } = useFoods(category)

  const filtered = useMemo(() => {
    if (!search.trim()) return foods
    const q = search.toLowerCase()
    return foods.filter((f) => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q))
  }, [foods, search])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-red-500">Failed to load foods: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <CategoryFilter selected={category} onSelect={setCategory} />
      <Input
        placeholder="Search foods..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full shrink-0" />)
          : filtered.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onClick={onAddFood}
              />
            ))}
        {!loading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            No foods found{search ? ` matching "${search}"` : ""}
          </p>
        )}
      </div>
    </div>
  )
}
