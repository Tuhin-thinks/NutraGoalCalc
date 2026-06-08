import { useEffect, useState } from "react"
import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryBadge } from "@/components/CategoryBadge"
import { FoodForm } from "@/components/FoodForm"
import { clearFoodCache } from "@/hooks/useFoods"
import { getFoods, getFoodDetail, createFood, updateFood, deleteFood } from "@/lib/api"
import { categoryColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { FoodSummary, FoodCreate, FoodDetail } from "@/lib/types"

interface CustomFoodsPageProps {
  onBack: () => void
}

export function CustomFoodsPage({ onBack }: CustomFoodsPageProps) {
  const [foods, setFoods] = useState<FoodSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<FoodDetail | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await getFoods()
        if (!cancelled) setFoods(data.foods)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey])

  const filtered = search.trim()
    ? foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods

  function bump() { setRefreshKey((k) => k + 1) }

  async function handleCreate(data: FoodCreate) {
    await createFood(data)
    clearFoodCache()
    setShowForm(false)
    bump()
  }

  async function handleUpdate(data: FoodCreate) {
    if (!editId) return
    await updateFood(editId, data)
    clearFoodCache()
    setEditId(null)
    setEditData(undefined)
    bump()
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    await deleteFood(id)
    clearFoodCache()
    bump()
  }

  async function openEdit(food: FoodSummary) {
    const detail = await getFoodDetail(food.id)
    setEditId(food.id)
    setEditData(detail)
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-neutral-500">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-neutral-800">Manage Foods</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Food
        </Button>
      </header>

      {/* Search */}
      <div className="p-4 pb-0">
        <Input placeholder="Search foods…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Food list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">No foods found.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((food) => {
              const color = categoryColor(food.category)
              return (
                <div
                  key={food.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2.5",
                    "border-l-4",
                    color.border,
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-neutral-900">
                      {food.name}
                      {food.is_custom && (
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">custom</span>
                      )}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                      <span>{food.unit}</span>
                      <span>·</span>
                      <span>{food.min_increment} step</span>
                    </div>
                  </div>
                  <CategoryBadge category={food.category} />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-blue-500" title="Edit" onClick={() => openEdit(food)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500" title="Delete" onClick={() => handleDelete(food.id, food.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal overlay for create/edit form */}
      {(showForm || editData) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-12">
          <div className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-neutral-800">
              {editData ? "Edit Food" : "Add Custom Food"}
            </h2>
            <FoodForm
              initial={editData}
              onSave={editData ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false)
                setEditId(null)
                setEditData(undefined)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
