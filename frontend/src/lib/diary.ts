import type { DayEntry, DiaryEntry } from "@/lib/types"

const DIARY_KEY = "nutragocalc_diary"

function today(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function loadDiary(): Record<string, DayEntry> {
  try {
    const raw = localStorage.getItem(DIARY_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveDiaryEntry(date: string, items: DiaryEntry[]): void {
  const diary = loadDiary()
  const now = new Date().toISOString()
  diary[date] = {
    date,
    items,
    created_at: diary[date]?.created_at ?? now,
    updated_at: now,
  }
  try {
    localStorage.setItem(DIARY_KEY, JSON.stringify(diary))
  } catch {
    // silently fail
  }
}

export function deleteDiaryEntry(date: string): void {
  const diary = loadDiary()
  delete diary[date]
  try {
    localStorage.setItem(DIARY_KEY, JSON.stringify(diary))
  } catch {
    // silently fail
  }
}

export function deleteDiaryItem(date: string, itemId: string): void {
  const diary = loadDiary()
  const entry = diary[date]
  if (!entry) return
  entry.items = entry.items.filter((it) => it.id !== itemId)
  entry.updated_at = new Date().toISOString()
  if (entry.items.length === 0) {
    delete diary[date]
  }
  try {
    localStorage.setItem(DIARY_KEY, JSON.stringify(diary))
  } catch {
    // silently fail
  }
}

export function moveDiaryItem(date: string, itemId: string, newDate: string): void {
  const diary = loadDiary()
  const entry = diary[date]
  if (!entry) return
  const item = entry.items.find((it) => it.id === itemId)
  if (!item) return
  entry.items = entry.items.filter((it) => it.id !== itemId)
  if (entry.items.length === 0) {
    delete diary[date]
  }
  const now = new Date().toISOString()
  if (!diary[newDate]) {
    diary[newDate] = {
      date: newDate,
      items: [],
      created_at: now,
      updated_at: now,
    }
  }
  diary[newDate].items.push(item)
  diary[newDate].updated_at = now
  try {
    localStorage.setItem(DIARY_KEY, JSON.stringify(diary))
  } catch {
    // silently fail
  }
}

export function getToday(): string {
  return today()
}
