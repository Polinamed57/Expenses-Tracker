import { useState, useEffect, useRef } from 'react'
import { Pin } from 'lucide-react'
import { CategorySheet } from './CategorySheet'
import { useTogglePinCategory } from '@/hooks/useCategories'
import type { Category, MonthlyTotal } from '@/types/index'

interface CategoryCardProps {
  category: Category
  total?: MonthlyTotal
  year: number
  month: number
  isHighlighted?: boolean
}

function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const start = prevRef.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * eased)
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        prevRef.current = target
        setDisplay(target)
      }
    }

    requestAnimationFrame(tick)
  }, [target, duration])

  return display
}

export function CategoryCard({ category, total, year, month, isHighlighted }: CategoryCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const togglePin = useTogglePinCategory()

  const spent = total?.total ?? 0
  const animatedSpent = useCountUp(spent)
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
        onClick={() => setSheetOpen(true)}
        className={`relative card-hover group flex aspect-square w-full flex-col rounded-xl border border-border bg-card text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isHighlighted ? 'card-shimmer' : ''}`}
        style={{ padding: '12px' }}
      >
        {/* Pin button — visible on hover, always visible when pinned */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePin.mutate({ id: category.id, is_pinned: !category.is_pinned })
          }}
          className={`absolute top-2 right-2 rounded p-0.5 transition-all ${
            category.is_pinned
              ? 'opacity-100 text-violet-500'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-violet-500'
          }`}
          aria-label={category.is_pinned ? 'Unpin' : 'Pin'}
        >
          <Pin size={12} className={category.is_pinned ? 'fill-current' : ''} />
        </button>

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
            ${animatedSpent.toFixed(0)}
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

      <CategorySheet
        category={category}
        total={total}
        year={year}
        month={month}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
