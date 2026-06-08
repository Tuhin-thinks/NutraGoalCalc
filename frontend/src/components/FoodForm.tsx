import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ALL_CATEGORIES } from "@/lib/api"
import type { Category, Unit, FoodCreate, FoodDetail } from "@/lib/types"

const UNITS: Unit[] = ["g", "each", "bowl", "scoop", "cup", "tbsp", "tsp", "medium", "large"]

interface FoodFormProps {
  initial?: FoodDetail
  onSave: (data: FoodCreate) => Promise<void>
  onCancel: () => void
}

export function FoodForm({ initial, onSave, onCancel }: FoodFormProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState<Category>(initial?.category ?? "protein")
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? "g")
  const [refWeight, setRefWeight] = useState(initial?.reference_weight_g ?? 100)
  const [protein, setProtein] = useState(initial?.protein_g ?? 0)
  const [carbs, setCarbs] = useState(initial?.carbs_g ?? 0)
  const [fat, setFat] = useState(initial?.fat_g ?? 0)
  const [calories, setCalories] = useState(initial?.calories_kcal ?? 0)
  const [fiber, setFiber] = useState(initial?.fiber_g ?? 0)
  const [minInc, setMinInc] = useState(initial?.min_increment ?? 1)
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [saving, setSaving] = useState(false)

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

  function num(v: string, set: (n: number) => void) {
    const n = parseFloat(v)
    if (!isNaN(n)) set(n)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Name *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Homemade Protein Bar" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Unit *</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
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
  )
}
