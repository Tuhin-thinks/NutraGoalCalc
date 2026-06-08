import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveWeights } from "@/lib/storage"
import type { TargetStrategy, WeightInputs } from "@/lib/types"

interface WeightInputModalProps {
  open: boolean
  initial?: WeightInputs | null
  onSave: (inputs: WeightInputs) => void
  onClose: () => void
}

export function WeightInputModal({ open, initial, onSave, onClose }: WeightInputModalProps) {
  const [currentWeight, setCurrentWeight] = useState(initial?.currentWeight?.toString() ?? "")
  const [targetWeight, setTargetWeight] = useState(initial?.targetWeight?.toString() ?? "")
  const [strategy, setStrategy] = useState<TargetStrategy>(initial?.strategy ?? "strategy_AI")

  if (!open) return null

  const handleSave = () => {
    const cw = parseFloat(currentWeight)
    const tw = parseFloat(targetWeight)
    if (!cw || !tw || cw <= 0 || tw <= 0) return
    const inputs: WeightInputs = { currentWeight: cw, targetWeight: tw, strategy }
    saveWeights(inputs)
    onSave(inputs)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle>Set Your Targets</CardTitle>
          <CardDescription>
            Enter your current and goal weight to calculate daily macro targets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Current Weight (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="1"
              placeholder="e.g. 80"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Target Weight (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="1"
              placeholder="e.g. 70"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Strategy</label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 p-2.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 has-[:checked]:border-neutral-900 dark:has-[:checked]:border-neutral-100 has-[:checked]:bg-neutral-50 dark:has-[:checked]:bg-neutral-800">
                <input
                  type="radio"
                  name="strategy"
                  value="strategy_AI"
                  checked={strategy === "strategy_AI"}
                  onChange={() => setStrategy("strategy_AI")}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium">strategy_AI</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Based on target weight: calories (target kg × 28), protein (× 1.8), fat (22% calories), carbs (remainder)
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 p-2.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 has-[:checked]:border-neutral-900 dark:has-[:checked]:border-neutral-100 has-[:checked]:bg-neutral-50 dark:has-[:checked]:bg-neutral-800">
                <input
                  type="radio"
                  name="strategy"
                  value="strategy_insta"
                  checked={strategy === "strategy_insta"}
                  onChange={() => setStrategy("strategy_insta")}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium">strategy_insta</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Based on current weight (calories = bw × 24, fat = bw × 0.7) and goal weight (protein = gw × 1.9), carbs = remainder
                  </div>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          {initial && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={!currentWeight || !targetWeight || parseFloat(currentWeight) <= 0 || parseFloat(targetWeight) <= 0}>
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
