import { Progress } from "@/components/ui/progress"
import { statusColor } from "@/lib/colors"
import { formatNutrient, formatPercent } from "@/lib/format"
import type { TargetComparisonEntry } from "@/lib/types"

interface NutrientBarProps {
  entry: TargetComparisonEntry
}

export function NutrientBar({ entry }: NutrientBarProps) {
  const midpoint = (entry.min + entry.max) / 2
  const clamped = Math.min(entry.current, entry.max * 2)
  const progressValue = midpoint > 0 ? (clamped / midpoint) * 100 : 0
  const color = statusColor(entry.current, entry.min, entry.max)

  const nutrientLabel = entry.nutrient
    .replace("_", " ")

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium capitalize text-neutral-700 dark:text-neutral-300">{nutrientLabel}</span>
        <span className="font-semibold" style={{ color }}>
          {formatNutrient(entry.current, entry.nutrient.includes("kcal") ? "kcal" : "g")}
        </span>
      </div>
      <div className="relative">
        <Progress value={Math.min(progressValue, 100)} indicatorColor={color} className="h-3" />
        <div
          className="absolute top-0 h-3 w-0.5 bg-neutral-900/40 dark:bg-white/20"
          style={{ left: `${(entry.min / midpoint) * 50}%` }}
          title={`Min: ${entry.min}`}
        />
        <div
          className="absolute top-0 h-3 w-0.5 bg-neutral-900/40 dark:bg-white/20"
          style={{ left: `${(entry.max / midpoint) * 50}%` }}
          title={`Max: ${entry.max}`}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500">
        <span>min: {entry.min}</span>
        <span>{formatPercent(entry.percent_of_midpoint)} of target</span>
        <span>max: {entry.max}</span>
      </div>
    </div>
  )
}

interface NutrientBarSkeletonProps {
  nutrient: string
}

export function NutrientBarSkeleton({ nutrient }: NutrientBarSkeletonProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium capitalize text-neutral-400 dark:text-neutral-500">{nutrient.replace("_", " ")}</span>
        <span className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="h-3 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
    </div>
  )
}
