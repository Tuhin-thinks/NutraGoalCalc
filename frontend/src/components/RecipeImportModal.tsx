import { useState } from "react"
import { X, FileText, Loader2, ArrowLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ALL_CATEGORIES, UNITS, parseRecipe, createFood, ApiError } from "@/lib/api"
import { toast } from "sonner"
import type { FoodSummary, Category, Unit, ParsedRecipe } from "@/lib/types"

interface RecipeImportModalProps {
  open: boolean
  onClose: () => void
  mode: "standalone" | "picker"
  onFoodCreated?: (food: FoodSummary) => void
}

const DEFAULT_CATEGORIES = [...ALL_CATEGORIES]
const DEFAULT_UNITS = [...UNITS]

export function RecipeImportModal({ open, onClose, mode, onFoodCreated }: RecipeImportModalProps) {
  const [step, setStep] = useState<"input" | "preview">("input")
  const [recipeText, setRecipeText] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("Custom Recipe")
  const [category, setCategory] = useState<Category>("protein")
  const [unit, setUnit] = useState<Unit>("g")
  const [refWeight, setRefWeight] = useState(100)
  const [protein, setProtein] = useState(25)
  const [carbs, setCarbs] = useState(30)
  const [fat, setFat] = useState(10)
  const [calories, setCalories] = useState(310)
  const [fiber, setFiber] = useState(3)
  const [minInc, setMinInc] = useState(1)
  const [notes, setNotes] = useState("")

  if (!open) return null

  const handleAnalyze = async () => {
    if (!recipeText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result: ParsedRecipe = await parseRecipe(recipeText)
      setName(result.name)
      setCategory(result.category as Category)
      setUnit(result.unit as Unit)
      setRefWeight(result.reference_weight_g)
      setProtein(result.protein_g)
      setCarbs(result.carbs_g)
      setFat(result.fat_g)
      setCalories(result.calories_kcal)
      setFiber(result.fiber_g)
      setMinInc(result.min_increment)
      setNotes(result.notes ?? "")
      setStep("preview")
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError("Failed to analyze recipe. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep("input")
    setError(null)
  }

  const handleCreate = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const detail = await createFood({
        name: name.trim() || "Custom Recipe",
        category,
        unit,
        reference_weight_g: refWeight,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        calories_kcal: calories,
        fiber_g: fiber,
        min_increment: minInc,
        notes: notes.trim() || null,
      })
      const summary: FoodSummary = {
        id: detail.id,
        name: detail.name,
        category: detail.category,
        unit: detail.unit,
        min_increment: detail.min_increment,
        is_custom: true,
      }
      if (mode === "picker" && onFoodCreated) {
        onFoodCreated(summary)
      }
      toast.success(`"${summary.name}" created from recipe`)
      handleClose()
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError("Failed to create food. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep("input")
    setRecipeText("")
    setLoading(false)
    setSubmitting(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={handleClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl dark:shadow-black/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-5 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Import from Recipe</h2>
          </div>
          <button onClick={handleClose} className="rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 px-5 py-2">
          <div className={`flex items-center gap-1.5 ${step === "input" ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-500"}`}>
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === "input" ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900" : "border border-neutral-300 dark:border-neutral-600"}`}>1</div>
            <span className="text-xs font-medium">Recipe</span>
          </div>
          <ChevronRight className="h-3 w-3 text-neutral-300 dark:text-neutral-600" />
          <div className={`flex items-center gap-1.5 ${step === "preview" ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-500"}`}>
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === "preview" ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900" : "border border-neutral-300 dark:border-neutral-600"}`}>2</div>
            <span className="text-xs font-medium">Nutrients</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {step === "input" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Paste a recipe description or list of ingredients below. We'll extract nutritional information.
              </p>
              <textarea
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder={`e.g. 200g chicken breast, 100g rice, 50g broccoli, 1 tbsp olive oil, salt and pepper to taste`}
                className="min-h-[200px] resize-none rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
              {loading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              )}
            </div>
          )}

          {step === "preview" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Review and adjust the extracted nutritional values before creating the food item.
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipe name" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  >
                    {DEFAULT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                    className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  >
                    {DEFAULT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Reference Weight (g)</label>
                <Input type="number" min={0.1} step={0.1} value={refWeight} onChange={(e) => num(e.target.value, setRefWeight)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Protein (g)</label>
                  <Input type="number" min={0} step={0.1} value={protein} onChange={(e) => num(e.target.value, setProtein)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Carbs (g)</label>
                  <Input type="number" min={0} step={0.1} value={carbs} onChange={(e) => num(e.target.value, setCarbs)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Fat (g)</label>
                  <Input type="number" min={0} step={0.1} value={fat} onChange={(e) => num(e.target.value, setFat)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Calories (kcal)</label>
                  <Input type="number" min={0.1} step={0.1} value={calories} onChange={(e) => num(e.target.value, setCalories)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Fiber (g)</label>
                  <Input type="number" min={0} step={0.1} value={fiber} onChange={(e) => num(e.target.value, setFiber)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Min Increment</label>
                  <Input type="number" min={0.01} step={0.01} value={minInc} onChange={(e) => num(e.target.value, setMinInc)} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  placeholder="Optional notes"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 dark:border-neutral-700 px-5 py-3">
          {step === "input" ? (
            <>
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleAnalyze} disabled={!recipeText.trim() || loading}>
                {loading ? "Analyzing…" : "Analyze Recipe"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={submitting}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Creating…" : mode === "picker" ? "Create & Add" : "Create Food"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  function num(v: string, set: (n: number) => void) {
    const n = parseFloat(v)
    if (!isNaN(n)) set(n)
  }
}
