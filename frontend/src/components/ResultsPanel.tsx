import { ErrorBanner } from "@/components/ErrorBanner"
import { NutrientBar, NutrientBarSkeleton } from "@/components/NutrientBar"
import { ItemsBreakdown, ItemsBreakdownSkeleton } from "@/components/ItemsBreakdown"
import { useTargets } from "@/hooks/useTargets"
import { ALL_CATEGORIES } from "@/lib/api"
import { categoryColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { TargetComparisonResponse } from "@/lib/types"

interface ResultsPanelProps {
  result: TargetComparisonResponse | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

export function ResultsPanel({ result, loading, error, onRetry }: ResultsPanelProps) {
  const { targets, loading: targetsLoading } = useTargets()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <h2 className="text-lg font-semibold text-neutral-800">Results</h2>
        {targetsLoading && <span className="h-3 w-20 animate-pulse rounded bg-neutral-200" />}
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {!result && loading && (
        <div className="space-y-4">
          <NutrientBarSkeleton nutrient="calories_kcal" />
          <NutrientBarSkeleton nutrient="protein_g" />
          <NutrientBarSkeleton nutrient="carbs_g" />
          <NutrientBarSkeleton nutrient="fat_g" />
          <ItemsBreakdownSkeleton />
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-200 py-16">
          <span className="text-3xl">🍽️</span>
          <p className="mt-2 text-sm text-neutral-400">Add foods to see results</p>
        </div>
      )}

      {result && targets && (
        <>
          <div className="shrink-0 space-y-3">
            {result.target_comparison.map((entry) => (
              <NutrientBar key={entry.nutrient} entry={entry} />
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <ItemsBreakdown items={result.items} />
          </div>

          <div className="shrink-0 rounded-md border border-neutral-200 bg-white p-3">
            <h4 className="mb-2 text-xs font-semibuppercase text-neutral-400">Color Legend</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {ALL_CATEGORIES.map((cat) => {
                const color = categoryColor(cat)
                return (
                  <div key={cat} className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", color.bg)} />
                    {cat}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {result && !targets && !targetsLoading && (
        <ErrorBanner message="Daily targets could not be loaded" />
      )}
    </div>
  )
}
