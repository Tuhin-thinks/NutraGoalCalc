export type Category = "protein" | "carbs" | "fruit" | "vegetable" | "fiber" | "fat" | (string & {})
export type Unit = "g" | "each" | "bowl" | "scoop" | "cup" | "tbsp" | "tsp" | "medium" | "large" | (string & {})

export interface FoodSummary {
  id: string
  name: string
  category: Category
  unit: Unit
  min_increment: number
  is_custom?: boolean
}

export interface FoodCreate {
  name: string
  category: Category
  unit: Unit
  reference_weight_g: number
  protein_g: number
  carbs_g: number
  fat_g: number
  calories_kcal: number
  fiber_g?: number
  min_increment?: number
  notes?: string | null
}

export interface FoodDetail {
  id: string
  name: string
  category: Category
  unit: Unit
  reference_weight_g: number
  protein_g: number
  carbs_g: number
  fat_g: number
  calories_kcal: number
  fiber_g: number
  min_increment: number
  is_custom: boolean
  notes: string | null
}

export interface FoodsListResponse {
  count: number
  foods: FoodSummary[]
}

export interface CategorySummary {
  category: Category
  count: number
}

export interface CategoriesResponse {
  count: number
  categories: CategorySummary[]
}

export interface MacroRange {
  min: number
  max: number
}

export type TargetStrategy = "strategy_AI" | "strategy_insta"

export interface WeightInputs {
  currentWeight: number
  targetWeight: number
  strategy: TargetStrategy
}

export interface DailyTargets {
  calories_kcal: MacroRange
  protein_g: MacroRange
  carbs_g: MacroRange
  fat_g: MacroRange
  fiber_g: MacroRange
}

export interface CatalogueMetadata {
  name: string
  version: string
  units_supported: Unit[]
  daily_targets: DailyTargets
}

export interface CalculationRequest {
  items: CalculationItem[]
}

export interface CalculationItem {
  food_id: string
  quantity: number
}

export interface NutritionPerUnit {
  protein_g: number
  carbs_g: number
  fat_g: number
  calories_kcal: number
  fiber_g: number
}

export interface NutritionTotals {
  protein_g: number
  carbs_g: number
  fat_g: number
  calories_kcal: number
  fiber_g: number
}

export interface ItemBreakdown {
  food_id: string
  name: string
  quantity: number
  unit: Unit
  scaling_factor: number
  nutrition: NutritionPerUnit
}

export interface CalculationResponse {
  totals: NutritionTotals
  items: ItemBreakdown[]
}

export interface TargetComparisonEntry {
  nutrient: string
  current: number
  min: number
  max: number
  percent_of_midpoint: number
}

export interface TargetComparisonResponse {
  totals: NutritionTotals
  items: ItemBreakdown[]
  target_comparison: TargetComparisonEntry[]
}

export interface DiaryEntry {
  id: string
  food: FoodSummary
  quantity: number
  lastTouched: number
}

export interface DayEntry {
  date: string
  items: DiaryEntry[]
  created_at: string
  updated_at: string
}

export interface ExportData {
  export_version: string
  exported_at: string
  weights: WeightInputs | null
  items: DiaryEntry[]
  diary: Record<string, DayEntry>
  result: TargetComparisonResponse | null
}

export interface CalculationResponseWithTargets extends CalculationResponse {
  target_comparison: TargetComparisonEntry[]
}

export interface ParsedRecipe {
  name: string
  category: Category
  unit: Unit
  reference_weight_g: number
  protein_g: number
  carbs_g: number
  fat_g: number
  calories_kcal: number
  fiber_g: number
  min_increment: number
  notes: string | null
}

export interface LLMStatus {
  configured: boolean
  provider: string | null
}
