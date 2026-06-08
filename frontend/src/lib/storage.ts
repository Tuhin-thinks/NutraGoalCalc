import type { DiaryEntry, ExportData, WeightInputs } from "@/lib/types"
import { loadDiary } from "@/lib/diary"

const KEY = "nutragocalc_items"
const WEIGHTS_KEY = "nutragocalc_weights"
const DIARY_KEY = "nutragocalc_diary"

export function loadWeights(): WeightInputs | null {
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WeightInputs
  } catch {
    return null
  }
}

export function saveWeights(w: WeightInputs): void {
  try {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(w))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function loadItems(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as DiaryEntry[]
  } catch {
    return []
  }
}

export function saveItems(items: DiaryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function exportAllData(
  result: ExportData["result"],
): ExportData {
  return {
    export_version: "1.0",
    exported_at: new Date().toISOString(),
    weights: loadWeights(),
    items: loadItems(),
    diary: loadDiary(),
    result,
  }
}

export function importAllData(data: ExportData): boolean {
  try {
    if (!data || data.export_version !== "1.0") return false
    if (data.weights) saveWeights(data.weights)
    saveItems(data.items ?? [])
    try {
      localStorage.setItem(DIARY_KEY, JSON.stringify(data.diary ?? {}))
    } catch {
      // silently fail
    }
    return true
  } catch {
    return false
  }
}
