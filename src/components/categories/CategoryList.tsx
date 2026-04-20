import { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { CategoryCard } from './CategoryCard'
import { AddCategoryDialog } from './AddCategoryDialog'
import { useCategories } from '@/hooks/useCategories'
import type { MonthlyTotal } from '@/types/index'

interface CategoryListProps {
  totals: MonthlyTotal[]
  year: number
  month: number
  highlightCategoryId?: string | null
}

function CategorySkeleton() {
  return (
    <div className="aspect-square w-full rounded-xl border border-border bg-card p-4 animate-pulse flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="mt-auto h-7 w-16 rounded bg-muted" />
    </div>
  )
}

export function CategoryList({ totals, year, month, highlightCategoryId }: CategoryListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const { data: categories = [], isLoading } = useCategories()

  const totalsByCategory = Object.fromEntries(totals.map((t) => [t.category_id, t]))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Categories</h2>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
          {Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
          <Tag className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-xs text-muted-foreground">Add a category to start tracking expenses</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-2 rounded-lg border border-border px-4 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Add category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              total={totalsByCategory[cat.id]}
              year={year}
              month={month}
              isHighlighted={cat.id === highlightCategoryId}
            />
          ))}
          <button
            onClick={() => setAddOpen(true)}
            className="flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: 'var(--card)' }}
            aria-label="Add category"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      )}

      <AddCategoryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
