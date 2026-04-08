import { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryCard } from './CategoryCard'
import { AddCategoryDialog } from './AddCategoryDialog'
import { useCategories } from '@/hooks/useCategories'
import type { MonthlyTotal } from '@/types/index'

interface CategoryListProps {
  totals: MonthlyTotal[]
}

function CategorySkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
      <div className="h-2 w-full rounded bg-muted" />
      <div className="h-3 w-16 rounded bg-muted" />
    </div>
  )
}

export function CategoryList({ totals }: CategoryListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const { data: categories = [], isLoading } = useCategories()

  const totalsByCategory = Object.fromEntries(totals.map((t) => [t.category_id, t]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
          <Tag className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-xs text-muted-foreground">Add a category to start tracking expenses</p>
          <Button size="sm" className="mt-2" onClick={() => setAddOpen(true)}>
            Add category
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              total={totalsByCategory[cat.id]}
            />
          ))}
        </div>
      )}

      <AddCategoryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
