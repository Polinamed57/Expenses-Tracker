import { useState } from 'react'
import { AddCategoryDialog } from './AddCategoryDialog'
import type { Category, MonthlyTotal } from '@/types/index'

interface CategoryCardProps {
  category: Category
  total?: MonthlyTotal
}

export function CategoryCard({ category, total }: CategoryCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  const spent = total?.total ?? 0
  const limit = category.budget_limit
  const progress = limit ? Math.min((spent / limit) * 100, 100) : null
  const percentage = limit ? Math.round((spent / limit) * 100) : null
  const isOverBudget = limit !== null && spent > limit

  // gradient spans full track so visible portion reflects usage; red pulse when over budget
  const gradientSize = progress !== null && progress > 0
    ? `${(10000 / progress).toFixed(1)}% 100%`
    : '100% 100%'

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="card-hover group flex aspect-square w-full flex-col rounded-xl border border-border bg-card text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ padding: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {category.icon ? (
            <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{category.icon}</span>
          ) : (
            <span
              style={{
                backgroundColor: category.color,
                width: '10px',
                height: '10px',
                borderRadius: '9999px',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
          )}
          <span className="truncate text-xs font-extrabold uppercase tracking-widest">{category.name}</span>
        </div>

        <div className="flex flex-1 items-center">
          <p
            className={isOverBudget ? 'text-destructive' : ''}
            style={{ fontSize: '26px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
          >
            ${spent.toFixed(0)}
          </p>
        </div>

        {progress !== null && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-muted-foreground">
              {percentage}% of ${limit!.toFixed(0)}
            </p>
            <div style={{ height: '6px', borderRadius: '9999px', backgroundColor: 'rgba(150,150,150,0.25)' }}>
              <div
                style={{
                  height: '6px',
                  width: isOverBudget ? '100%' : `${progress}%`,
                  borderRadius: '9999px',
                  background: isOverBudget
                    ? 'linear-gradient(to right, #ff4444, #ff0000)'
                    : 'linear-gradient(to right, #4ade80, #facc15, #f97316, #ef4444)',
                  backgroundSize: isOverBudget ? undefined : gradientSize,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        )}
      </button>

      <AddCategoryDialog open={editOpen} onOpenChange={setEditOpen} editing={category} />
    </>
  )
}
