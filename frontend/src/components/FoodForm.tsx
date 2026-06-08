import { useState, useCallback, useRef } from "react"
import { Copy, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ALL_CATEGORIES, UNITS } from "@/lib/api"
import type { FoodCreate, FoodDetail } from "@/lib/types"

interface FoodFormProps {
  initial?: FoodDetail
  onSave: (data: FoodCreate) => Promise<void>
  onCancel: () => void
}

function formToJson(data: {
  name: string
  category: string
  unit: string
  refWeight: number
  protein: number
  carbs: number
  fat: number
  calories: number
  fiber: number
  minInc: number
  notes: string
}): string {
  return JSON.stringify(
    {
      name: data.name,
      category: data.category,
      unit: data.unit,
      reference_weight_g: data.refWeight,
      protein_g: data.protein,
      carbs_g: data.carbs,
      fat_g: data.fat,
      calories_kcal: data.calories,
      fiber_g: data.fiber,
      min_increment: data.minInc,
      notes: data.notes.trim() || null,
    },
    null,
    2,
  )
}

const INITIAL_CATEGORIES = [...ALL_CATEGORIES]
const INITIAL_UNITS = [...UNITS]

export function FoodForm({ initial, onSave, onCancel }: FoodFormProps) {
  const [mode, setMode] = useState<"form" | "json">("form")
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState<string>(initial?.category ?? "protein")
  const [unit, setUnit] = useState<string>(initial?.unit ?? "g")
  const [refWeight, setRefWeight] = useState(initial?.reference_weight_g ?? 100)
  const [protein, setProtein] = useState(initial?.protein_g ?? 0)
  const [carbs, setCarbs] = useState(initial?.carbs_g ?? 0)
  const [fat, setFat] = useState(initial?.fat_g ?? 0)
  const [calories, setCalories] = useState(initial?.calories_kcal ?? 0)
  const [fiber, setFiber] = useState(initial?.fiber_g ?? 0)
  const [minInc, setMinInc] = useState(initial?.min_increment ?? 1)
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [jsonText, setJsonText] = useState(() => formToJson({
    name: initial?.name ?? "",
    category: initial?.category ?? "protein",
    unit: initial?.unit ?? "g",
    refWeight: initial?.reference_weight_g ?? 100,
    protein: initial?.protein_g ?? 0,
    carbs: initial?.carbs_g ?? 0,
    fat: initial?.fat_g ?? 0,
    calories: initial?.calories_kcal ?? 0,
    fiber: initial?.fiber_g ?? 0,
    minInc: initial?.min_increment ?? 1,
    notes: initial?.notes ?? "",
  }))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES)
  const [units, setUnits] = useState<string[]>(INITIAL_UNITS)
  const [addingCategory, setAddingCategory] = useState(false)
  const [addingUnit, setAddingUnit] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newUnitName, setNewUnitName] = useState("")
  const catInputRef = useRef<HTMLInputElement>(null)
  const unitInputRef = useRef<HTMLInputElement>(null)

  const handleModeChange = useCallback((newMode: "form" | "json") => {
    if (newMode === "json") {
      setJsonText(formToJson({ name, category, unit, refWeight, protein, carbs, fat, calories, fiber, minInc, notes }))
    }
    setMode(newMode)
    setJsonError(null)
  }, [name, category, unit, refWeight, protein, carbs, fat, calories, fiber, minInc, notes])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
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
    } finally {
      setSaving(false)
    }
  }

  async function handleJsonSubmit() {
    setJsonError(null)
    try {
      const parsed = JSON.parse(jsonText)
      const required = ["name", "category", "unit", "reference_weight_g", "protein_g", "carbs_g", "fat_g", "calories_kcal"]
      for (const field of required) {
        if (!(field in parsed)) {
          setJsonError(`Missing required field: "${field}"`)
          return
        }
      }
      setSaving(true)
      try {
        await onSave({
          name: parsed.name,
          category: parsed.category,
          unit: parsed.unit,
          reference_weight_g: parsed.reference_weight_g,
          protein_g: parsed.protein_g,
          carbs_g: parsed.carbs_g,
          fat_g: parsed.fat_g,
          calories_kcal: parsed.calories_kcal,
          fiber_g: parsed.fiber_g ?? 0,
          min_increment: parsed.min_increment ?? 1,
          notes: parsed.notes ?? null,
        })
      } finally {
        setSaving(false)
      }
    } catch {
      setJsonError("Invalid JSON format")
    }
  }

  const handleCopy = useCallback(() => {
    if (mode === "json" && jsonTextareaRef.current) {
      jsonTextareaRef.current.select()
      navigator.clipboard.writeText(jsonText)
    } else {
      navigator.clipboard.writeText(formToJson({ name, category, unit, refWeight, protein, carbs, fat, calories, fiber, minInc, notes }))
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [mode, jsonText, name, category, unit, refWeight, protein, carbs, fat, calories, fiber, minInc, notes])

  function confirmAddCat(value: string) {
    const trimmed = value.trim()
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed])
      setCategory(trimmed)
    }
    setAddingCategory(false)
    setNewCatName("")
  }

  function confirmAddUnit(value: string) {
    const trimmed = value.trim()
    if (trimmed && !units.includes(trimmed)) {
      setUnits((prev) => [...prev, trimmed])
      setUnit(trimmed)
    }
    setAddingUnit(false)
    setNewUnitName("")
  }

  const startAddCat = useCallback(() => {
    setAddingCategory(true)
    setTimeout(() => catInputRef.current?.focus(), 10)
  }, [])

  const startAddUnit = useCallback(() => {
    setAddingUnit(true)
    setTimeout(() => unitInputRef.current?.focus(), 10)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle + copy button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md border border-neutral-200 p-0.5">
          <button
            onClick={() => handleModeChange("form")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${mode === "form" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            Form
          </button>
          <button
            onClick={() => handleModeChange("json")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${mode === "json" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            JSON
          </button>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>

      {mode === "form" ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Homemade Protein Bar" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Category *</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white outline-none focus:border-neutral-400"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {addingCategory ? (
                  <Input
                    ref={catInputRef}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onBlur={() => confirmAddCat(newCatName)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAddCat(newCatName)
                      if (e.key === "Escape") { setAddingCategory(false); setNewCatName("") }
                    }}
                    placeholder="New category"
                    className="h-10 w-32 text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startAddCat}
                    title="Add category"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Unit *</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white outline-none focus:border-neutral-400"
                >
                  {units.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                {addingUnit ? (
                  <Input
                    ref={unitInputRef}
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    onBlur={() => confirmAddUnit(newUnitName)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAddUnit(newUnitName)
                      if (e.key === "Escape") { setAddingUnit(false); setNewUnitName("") }
                    }}
                    placeholder="New unit"
                    className="h-10 w-32 text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startAddUnit}
                    title="Add unit"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Reference Weight (g) *</label>
            <Input type="number" min={0.1} step={0.1} value={refWeight} onChange={(e) => num(e.target.value, setRefWeight)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Protein (g) *</label>
              <Input type="number" min={0} step={0.1} value={protein} onChange={(e) => num(e.target.value, setProtein)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Carbs (g) *</label>
              <Input type="number" min={0} step={0.1} value={carbs} onChange={(e) => num(e.target.value, setCarbs)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Fat (g) *</label>
              <Input type="number" min={0} step={0.1} value={fat} onChange={(e) => num(e.target.value, setFat)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Calories (kcal) *</label>
              <Input type="number" min={0.1} step={0.1} value={calories} onChange={(e) => num(e.target.value, setCalories)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Fiber (g)</label>
              <Input type="number" min={0} step={0.1} value={fiber} onChange={(e) => num(e.target.value, setFiber)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Min Increment</label>
              <Input type="number" min={0.01} step={0.01} value={minInc} onChange={(e) => num(e.target.value, setMinInc)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Optional notes" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>{saving ? "Saving…" : initial ? "Update" : "Create"}</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-neutral-500">
            Paste JSON matching <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">FoodCreate</code> schema
          </p>
          <textarea
            ref={jsonTextareaRef}
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setJsonError(null) }}
            className="min-h-[280px] resize-none rounded-md border border-neutral-200 bg-white p-3 text-sm font-mono outline-none focus:border-neutral-400"
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
            <Button onClick={handleJsonSubmit} disabled={saving || !jsonText.trim()}>{saving ? "Saving…" : initial ? "Update" : "Create"}</Button>
          </div>
        </div>
      )}
    </div>
  )

  function num(v: string, set: (n: number) => void) {
    const n = parseFloat(v)
    if (!isNaN(n)) set(n)
  }
}
