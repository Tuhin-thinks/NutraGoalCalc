import { useState, useCallback } from "react"
import { Copy } from "lucide-react"
import { ErrorBanner } from "@/components/ErrorBanner"
import { NutrientBar, NutrientBarSkeleton } from "@/components/NutrientBar"
import { ItemsBreakdown, ItemsBreakdownSkeleton } from "@/components/ItemsBreakdown"
import { ALL_CATEGORIES } from "@/lib/api"
import { categoryColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { TargetComparisonResponse, WeightInputs, DailyTargets } from "@/lib/types"

interface ResultsPanelProps {
  result: TargetComparisonResponse | null
  loading: boolean
  error: string | null
  onRetry?: () => void
  needsWeights?: boolean
  onOpenWeights?: () => void
  weightInputs?: WeightInputs | null
  targets?: DailyTargets | null
}

function buildCopyJson(
  result: TargetComparisonResponse,
  weightInputs?: WeightInputs | null,
  targets?: DailyTargets | null,
): string {
  const obj: Record<string, unknown> = {
    food_items: result.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      nutrition_per_serving: item.nutrition,
    })),
    tot_nutrients: result.totals,
  }
  if (weightInputs && targets) {
    obj.profile = {
      current_weight_kg: weightInputs.currentWeight,
      target_weight_kg: weightInputs.targetWeight,
      strategy: weightInputs.strategy,
      daily_targets: targets,
    }
  }
  return JSON.stringify(obj, null, 2)
}

export function ResultsPanel({
  result,
  loading,
  error,
  onRetry,
  needsWeights,
  onOpenWeights,
  weightInputs,
  targets,
}: ResultsPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(buildCopyJson(result, weightInputs, targets))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [result, weightInputs, targets])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-neutral-800">Results</h2>
        {result && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {!result && loading && (
        <div className="space-y-4">
          <NutrientBarSkeleton nutrient="calories_kcal" />
          <NutrientBarSkeleton nutrient="protein_g" />
          <NutrientBarSkeleton nutrient="carbs_g" />
          <NutrientBarSkeleton nutrient="fat_g" />
          <NutrientBarSkeleton nutrient="fiber_g" />
          <ItemsBreakdownSkeleton />
        </div>
      )}

      {!result && !loading && !error && !needsWeights && (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-200 py-16">
          <span className="text-3xl">🍽️</span>
          <p className="mt-2 text-sm text-neutral-400">Add foods to see results</p>
        </div>
      )}

      {!result && !loading && !error && needsWeights && (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-200 py-16">
          <span className="text-3xl">⚖️</span>
          <p className="mt-2 text-sm text-neutral-400">Set your weight targets to see results</p>
          {onOpenWeights && (
            <button
              onClick={onOpenWeights}
              className="mt-3 rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Set Weights
            </button>
          )}
        </div>
      )}

      {result && (
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
            <h4 className="mb-2 text-xs font-semibold uppercase text-neutral-400">Color Legend</h4>
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
    </div>
  )
}
