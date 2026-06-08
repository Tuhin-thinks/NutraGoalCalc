import type { Unit } from "@/lib/types"

export function formatNutrient(value: number, unit: string): string {
  if (unit === "kcal") return `${Math.round(value)} kcal`
  return `${value.toFixed(1)}g`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatQuantity(value: number, unit: Unit): string {
  const decimals = unit === "g" ? 1 : 0
  return `${value.toFixed(decimals)} ${unit}`
}

export function unitDisplayName(unit: Unit): string {
  const names: Record<string, string> = {
    g: "grams",
    each: "each",
    bowl: "bowl(s)",
    scoop: "scoop(s)",
    cup: "cup(s)",
    tbsp: "tbsp",
    tsp: "tsp",
    medium: "medium",
    large: "large",
  }
  return names[unit] ?? unit
}
