import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryCard } from './CategoryCard'
import { AddCategoryDialog } from './AddCategoryDialog'
import { useCategories } from '@/hooks/useCategories'
import type { MonthlyTotal } from '@/types/index'

interface CategoryListProps {
  totals: MonthlyTotal[]
}

export function CategoryList({ totals }: CategoryListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const { data: categories = [], isLoading } = useCategories()

  const totalsByCategory = Object.fromEntries(totals.map((t) => [t.category_id, t]))

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet. Add one to get started.</p>
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
