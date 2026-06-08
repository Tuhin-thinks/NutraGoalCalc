import type { Category } from "@/lib/types"

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; light: string }> = {
  protein:   { bg: "bg-protein",   text: "text-protein",   border: "border-protein",   light: "bg-protein/10" },
  carbs:     { bg: "bg-carbs",     text: "text-carbs",     border: "border-carbs",     light: "bg-carbs/10" },
  fruit:     { bg: "bg-fruit",     text: "text-fruit",     border: "border-fruit",     light: "bg-fruit/10" },
  vegetable: { bg: "bg-vegetable", text: "text-vegetable", border: "border-vegetable", light: "bg-vegetable/10" },
  fiber:     { bg: "bg-fiber",     text: "text-fiber",     border: "border-fiber",     light: "bg-fiber/10" },
  fat:       { bg: "bg-fat",       text: "text-fat",       border: "border-fat",       light: "bg-fat/10" },
}

export function categoryColor(category: Category) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.protein
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s
  const h1 = h / 60
  const x = c * (1 - Math.abs((h1 % 2) - 1))
  const m = v - c

  let r = 0, g = 0, b = 0
  if (h1 < 1) { r = c; g = x }
  else if (h1 < 2) { r = x; g = c }
  else if (h1 < 3) { g = c; b = x }
  else if (h1 < 4) { g = x; b = c }
  else if (h1 < 5) { r = x; b = c }
  else { r = c; b = x }

  const r1 = Math.round((r + m) * 255)
  const g1 = Math.round((g + m) * 255)
  const b1 = Math.round((b + m) * 255)

  return `#${r1.toString(16).padStart(2, "0")}${g1.toString(16).padStart(2, "0")}${b1.toString(16).padStart(2, "0")}`
}

export function statusColor(current: number, min: number, max: number): string {
  const range = max - min
  if (range <= 0) return "#ef4444"

  const transitionRatio = 0.25
  const transitionSize = range * transitionRatio

  if (current < min) return "#ef4444"

  if (current < min + transitionSize) {
    const t = (current - min) / transitionSize
    const h = t * 120
    return hsvToHex(h, 1, 1)
  }

  if (current <= max) return "#22c55e"

  if (current < max + transitionSize) {
    const t = (current - max) / transitionSize
    const h = 120 - t * 120
    return hsvToHex(h, 1, 1)
  }

  return "#ef4444"
}

export const CATEGORY_ICONS: Record<Category, string> = {
  protein: "Drumstick",
  carbs: "Wheat",
  fruit: "Apple",
  vegetable: "Salad",
  fiber: "Leaf",
  fat: "Droplet",
}
