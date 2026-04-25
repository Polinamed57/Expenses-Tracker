import { useState } from 'react'
import { ChevronDown, Trash2, Receipt } from 'lucide-react'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'

interface OneTimeListProps {
  year: number
  month: number
}

export function OneTimeList({ year, month }: OneTimeListProps) {
  const [open, setOpen] = useState(false)
  const { data: allExpenses = [] } = useExpenses({ year, month })
  const deleteExpense = useDeleteExpense()

  const oneTime = allExpenses.filter((e) => e.category_id == null)
  if (oneTime.length === 0) return null

  const total = oneTime.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent/40 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'rgba(245,158,11,0.12)',
              color: '#f59e0b',
            }}
          >
            <Receipt size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold">One-time expenses</p>
            <p className="text-xs text-muted-foreground">
              {oneTime.length} {oneTime.length === 1 ? 'item' : 'items'} this month
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold tabular-nums">${total.toFixed(2)}</p>
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'none',
              color: 'var(--muted-foreground)',
            }}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4">
          <div className="divide-y divide-border">
            {oneTime.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{expense.description ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(expense.expense_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm font-semibold tabular-nums">${expense.amount.toFixed(2)}</p>
                  <button
                    onClick={() => deleteExpense.mutate(expense)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
