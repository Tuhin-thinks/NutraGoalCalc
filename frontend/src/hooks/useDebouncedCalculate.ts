import { useEffect, useState, useRef } from "react"
import { calculateWithTargets } from "@/lib/api"
import type { CalculationItem, TargetComparisonResponse } from "@/lib/types"

export function useDebouncedCalculate(items: CalculationItem[], ms = 300) {
  const [result, setResult] = useState<TargetComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      setResult(null)
      setLoading(false)
      setError(null)
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const data = await calculateWithTargets({ items })
        if (!controller.signal.aborted) setResult(data)
      } catch (e: unknown) {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : "Calculation failed")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, ms)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items, ms])

  return { result, loading, error }
}
