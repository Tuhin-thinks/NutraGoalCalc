import { useState, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CalendarGrid } from "@/components/CalendarGrid"
import { DayDetail } from "@/components/DayDetail"
import { loadDiary, deleteDiaryEntry, deleteDiaryItem, moveDiaryItem } from "@/lib/diary"
import type { DiaryEntry } from "@/lib/types"

interface DiaryPageProps {
  onBack: () => void
}

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function DiaryPage({ onBack }: DiaryPageProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(fmt(now.getFullYear(), now.getMonth(), now.getDate()))
  const [diary, setDiary] = useState(() => loadDiary())

  const refresh = useCallback(() => {
    setDiary(loadDiary())
  }, [])

  const hasEntry = useCallback((date: string): boolean => {
    return !!diary[date] && diary[date].items.length > 0
  }, [diary])

  const selectedItems: DiaryEntry[] = useMemo(() => {
    const entry = diary[selectedDate]
    return entry?.items ?? []
  }, [diary, selectedDate])

  const handleDeleteItem = useCallback((itemId: string) => {
    deleteDiaryItem(selectedDate, itemId)
    refresh()
  }, [selectedDate, refresh])

  const handleMoveItem = useCallback((itemId: string, newDate: string) => {
    moveDiaryItem(selectedDate, itemId, newDate)
    refresh()
  }, [selectedDate, refresh])

  const handleClearDay = useCallback(() => {
    deleteDiaryEntry(selectedDate)
    refresh()
  }, [selectedDate, refresh])

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }, [month])

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-5xl flex-col px-4 py-4 md:flex-row md:gap-6">
      {/* Left: Calendar */}
      <div className="flex shrink-0 flex-col md:w-[420px]">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          >
            ← Back to Tracker
          </button>
        </div>
        <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm">
          <button onClick={prevMonth} className="rounded p-1 text-neutral-400 hover:text-neutral-600">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold text-neutral-800">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="rounded p-1 text-neutral-400 hover:text-neutral-600">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 rounded-md bg-white p-3 shadow-sm">
          <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            hasEntry={hasEntry}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>

      {/* Right: Day detail */}
      <div className="mt-4 flex min-h-0 flex-1 flex-col md:mt-0 md:overflow-y-auto">
        <h2 className="mb-3 text-sm font-semibold text-neutral-600">
          {selectedDate}
        </h2>
        <DayDetail
          date={selectedDate}
          items={selectedItems}
          onDeleteItem={handleDeleteItem}
          onMoveItem={handleMoveItem}
          onClearDay={handleClearDay}
        />
        {selectedItems.length > 0 && (
          <div className="mt-4 rounded-md border border-dashed border-neutral-200 bg-neutral-50/50 p-3 text-center text-xs text-neutral-400">
            Use the tracker page to add food items for a day
          </div>
        )}
      </div>
    </div>
  )
}
