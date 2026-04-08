import { useState, useMemo } from 'react'
import { Plus, Receipt, ArrowUpDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseRow } from './ExpenseRow'
import { AddExpenseDialog } from './AddExpenseDialog'
import { useExpenses } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import type { Expense } from '@/types/index'

type SortField = 'date' | 'amount' | 'category'
type SortDir = 'asc' | 'desc'

interface ExpenseTableProps {
  year: number
  month: number
}

function exportToCsv(expenses: Expense[], categoryById: Record<string, { name: string }>, year: number, month: number) {
  const rows = [
    ['Date', 'Category', 'Amount', 'Description', 'Recurring'],
    ...expenses.map((e) => [
      e.expense_date,
      categoryById[e.category_id]?.name ?? '',
      e.amount,
      e.description ?? '',
      e.is_recurring ? 'Yes' : 'No',
    ]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${year}-${String(month).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExpenseTable({ year, month }: ExpenseTableProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const { data: expenses = [], isLoading } = useExpenses({ year, month })
  const { data: categories = [] } = useCategories()

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...expenses].sort((a, b) => {
      let cmp = 0
      if (sortField === 'date') cmp = a.expense_date.localeCompare(b.expense_date)
      if (sortField === 'amount') cmp = Number(a.amount) - Number(b.amount)
      if (sortField === 'category') {
        const ca = categoryById[a.category_id]?.name ?? ''
        const cb = categoryById[b.category_id]?.name ?? ''
        cmp = ca.localeCompare(cb)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [expenses, sortField, sortDir, categoryById])

  function SortButton({ field, label }: { field: SortField; label: string }) {
    const active = sortField === field
    return (
      <button
        onClick={() => toggleSort(field)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: '4px',
        }}
      >
        {label}
        <ArrowUpDown style={{ width: '10px', height: '10px' }} />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCsv(expenses, categoryById, year, month)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="divide-y divide-border px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <div className="h-4 w-28 rounded bg-muted" />
                </div>
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No expenses this month</p>
            <p className="text-xs text-muted-foreground">Add your first expense to get started</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '8px 16px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <SortButton field="date" label="Date" />
              <SortButton field="category" label="Category" />
              <SortButton field="amount" label="Amount" />
            </div>
            <div className="divide-y divide-border px-4">
              {sorted.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  category={categoryById[expense.category_id]}
                />
              ))}
            </div>
          </>
        )}

        {expenses.length > 0 && (
          <div className="flex justify-between border-t border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-semibold">${total.toFixed(2)}</span>
          </div>
        )}
      </div>

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} defaultDate={defaultDate} />
    </div>
  )
}
