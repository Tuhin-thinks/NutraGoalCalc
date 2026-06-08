import type { DailyTargets, NutritionTotals, TargetComparisonEntry, TargetStrategy } from "@/lib/types"

const NUTRIENT_KEYS: Array<{ nutrient: keyof DailyTargets; attr: keyof NutritionTotals }> = [
  { nutrient: "calories_kcal", attr: "calories_kcal" },
  { nutrient: "protein_g", attr: "protein_g" },
  { nutrient: "carbs_g", attr: "carbs_g" },
  { nutrient: "fat_g", attr: "fat_g" },
  { nutrient: "fiber_g", attr: "fiber_g" },
]

export function computeTargets(
  currentKg: number,
  targetKg: number,
  strategy: TargetStrategy,
): DailyTargets {
  if (strategy === "strategy_AI") {
    const calMid = targetKg * 28
    const proteinMid = targetKg * 1.8
    const fatMid = (calMid * 0.22) / 9
    const carbsMid = (calMid - proteinMid * 4 - fatMid * 9) / 4

    const fiberMid = (calMid / 1000) * 14

    return {
      calories_kcal: { min: Math.round(calMid - 200), max: Math.round(calMid + 200) },
      protein_g: { min: Math.round(proteinMid * 0.85), max: Math.round(proteinMid * 1.15) },
      fat_g: { min: Math.round(fatMid * 0.8), max: Math.round(fatMid * 1.2) },
      carbs_g: { min: Math.round(carbsMid * 0.85), max: Math.round(carbsMid * 1.15) },
      fiber_g: { min: Math.round(fiberMid * 0.8), max: Math.round(fiberMid * 1.2) },
    }
  }

  const cal = currentKg * 24
  const protein = targetKg * 1.9
  const fat = currentKg * 0.7
  const carbs = (cal - (protein * 4 + fat * 9)) / 4

  const fiber = (cal / 1000) * 14

  return {
    calories_kcal: { min: Math.round(cal * 0.9), max: Math.round(cal * 1.1) },
    protein_g: { min: Math.round(protein * 0.9), max: Math.round(protein * 1.1) },
    fat_g: { min: Math.round(fat * 0.9), max: Math.round(fat * 1.1) },
    carbs_g: { min: Math.round(carbs * 0.9), max: Math.round(carbs * 1.1) },
    fiber_g: { min: Math.round(fiber * 0.9), max: Math.round(fiber * 1.1) },
  }
}

export function computeComparison(
  totals: NutritionTotals,
  targets: DailyTargets,
): TargetComparisonEntry[] {
  return NUTRIENT_KEYS.map(({ nutrient, attr }) => {
    const current = totals[attr]
    const targetRange = targets[nutrient]
    const midpoint = (targetRange.min + targetRange.max) / 2
    const pct = midpoint > 0 ? (current / midpoint) * 100 : 0

    return {
      nutrient: nutrient as string,
      current,
      min: targetRange.min,
      max: targetRange.max,
      percent_of_midpoint: Math.round(pct * 10) / 10,
    }
  })
}
