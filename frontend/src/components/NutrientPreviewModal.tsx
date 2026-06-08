import { useEffect, useState } from "react"
import { X, Loader2 } from "lucide-react"
import { getFoodDetail } from "@/lib/api"
import { categoryColor } from "@/lib/colors"
import type { FoodSummary, FoodDetail } from "@/lib/types"

interface NutrientPreviewModalProps {
  food: FoodSummary | null
  onClose: () => void
}

export function NutrientPreviewModal({ food, onClose }: NutrientPreviewModalProps) {
  const [detail, setDetail] = useState<FoodDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!food) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)
    getFoodDetail(food.id)
      .then((d) => { if (!cancelled) setDetail(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [food])

  if (!food) return null

  const color = categoryColor(food.category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 shadow-xl dark:shadow-black/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">{food.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${color.light} ${color.text}`}>{food.category}</span>
          </div>
          <button onClick={onClose} className="shrink-0 rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {error && (
          <p className="py-4 text-center text-sm text-red-500">{error}</p>
        )}

        {detail && !loading && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-neutral-50 dark:bg-neutral-800 p-2.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Unit</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{detail.unit}</p>
              </div>
              <div className="rounded-md bg-neutral-50 dark:bg-neutral-800 p-2.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Ref. Weight</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{detail.reference_weight_g}g</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Calories</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{detail.calories_kcal} kcal</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm border-l-4 border-protein">
                <span className="text-neutral-600 dark:text-neutral-400">Protein</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{detail.protein_g}g</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm border-l-4 border-carbs">
                <span className="text-neutral-600 dark:text-neutral-400">Carbs</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{detail.carbs_g}g</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm border-l-4 border-fat">
                <span className="text-neutral-600 dark:text-neutral-400">Fat</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{detail.fat_g}g</span>
              </div>
              {detail.fiber_g > 0 && (
                <div className="flex items-center justify-between rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm border-l-4 border-fiber">
                  <span className="text-neutral-600 dark:text-neutral-400">Fiber</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{detail.fiber_g}g</span>
                </div>
              )}
            </div>

            {detail.notes && (
              <div className="rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Notes</span>
                <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">{detail.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
