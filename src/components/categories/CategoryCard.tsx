import { useState } from 'react'
import { Pencil, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { AddCategoryDialog } from './AddCategoryDialog'
import { useArchiveCategory } from '@/hooks/useCategories'
import type { Category, MonthlyTotal } from '@/types/index'

interface CategoryCardProps {
  category: Category
  total?: MonthlyTotal
}

export function CategoryCard({ category, total }: CategoryCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const archiveCategory = useArchiveCategory()

  const spent = total?.total ?? 0
  const limit = category.budget_limit
  const isOverBudget = limit !== null && spent > limit
  const progress = limit ? Math.min((spent / limit) * 100, 100) : null
  const percentage = limit ? Math.round((spent / limit) * 100) : null

  return (
    <>
      <div
        className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-3"
        style={{ borderLeftColor: category.color, borderLeftWidth: '3px' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{category.name}</span>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setArchiveOpen(true)}>
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-2xl font-bold tabular-nums ${isOverBudget ? 'text-destructive' : ''}`}>
            ${spent.toFixed(2)}
          </span>
          {limit !== null && (
            <span className="text-xs text-muted-foreground shrink-0">
              of ${limit.toFixed(2)}
            </span>
          )}
        </div>

        {progress !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentage}% used</span>
              {isOverBudget && (
                <span className="text-destructive font-medium">Over budget</span>
              )}
            </div>
          </div>
        )}
      </div>

      <AddCategoryDialog open={editOpen} onOpenChange={setEditOpen} editing={category} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive category"
        description={`Archive "${category.name}"? It will be hidden but past expenses will remain.`}
        onConfirm={() => archiveCategory.mutate(category.id)}
        isLoading={archiveCategory.isPending}
      />
    </>
  )
}
