import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface CalendarGridProps {
  year: number
  month: number
  selectedDate: string | null
  hasEntry: (date: string) => boolean
  onSelectDate: (date: string) => void
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function isToday(date: string): boolean {
  const d = new Date()
  return fmt(d.getFullYear(), d.getMonth(), d.getDate()) === date
}

export function CalendarGrid({ year, month, selectedDate, hasEntry, onSelectDate }: CalendarGridProps) {
  const days = useMemo(() => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startDow = first.getDay()
    const totalDays = last.getDate()
    const cells: Array<{ date: string; day: number; empty: boolean }> = []
    for (let i = 0; i < startDow; i++) {
      cells.push({ date: "", day: 0, empty: true })
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ date: fmt(year, month, d), day: d, empty: false })
    }
    return cells
  }, [year, month])

  return (
    <div className="select-none">
      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-neutral-400">
        {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((cell, i) => {
          if (cell.empty) {
            return <div key={`e${i}`} className="min-h-[56px] rounded-md bg-neutral-50/50" />
          }
          const date = cell.date
          const today = isToday(date)
          const selected = date === selectedDate
          const has = hasEntry(date)
          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                "relative flex min-h-[56px] flex-col items-center justify-start gap-0.5 rounded-md p-1 text-xs transition-colors",
                selected
                  ? "bg-neutral-900 text-white"
                  : today
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-white text-neutral-600 hover:bg-neutral-50",
              )}
            >
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                selected && today && "bg-white/20",
              )}>
                {cell.day}
              </span>
              {has && (
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  selected ? "bg-white" : "bg-neutral-400",
                )} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
