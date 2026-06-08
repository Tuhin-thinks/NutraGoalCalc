import { useEffect, useState } from "react"
import { getTargets } from "@/lib/api"
import type { DailyTargets } from "@/lib/types"

export function useTargets() {
  const [targets, setTargets] = useState<DailyTargets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getTargets()
      .then((data) => {
        if (!cancelled) setTargets(data.daily_targets)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load targets")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { targets, loading, error }
}
