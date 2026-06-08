import { useState, useCallback } from "react"
import { loadWeights } from "@/lib/storage"
import { computeTargets } from "@/lib/target-calculator"

function initState() {
  const w = loadWeights()
  if (w) {
    return {
      targets: computeTargets(w.currentWeight, w.targetWeight, w.strategy),
      weightInputs: w,
      needsWeights: false,
    }
  }
  return { targets: null, weightInputs: null, needsWeights: true }
}

export function useTargets() {
  const [state, setState] = useState(initState)

  const refresh = useCallback(() => {
    const w = loadWeights()
    if (w) {
      setState({
        targets: computeTargets(w.currentWeight, w.targetWeight, w.strategy),
        weightInputs: w,
        needsWeights: false,
      })
    } else {
      setState({ targets: null, weightInputs: null, needsWeights: true })
    }
  }, [])

  return { ...state, refresh }
}
