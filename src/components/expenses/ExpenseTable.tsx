import { useState } from 'react'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseRow } from './ExpenseRow'
import { AddExpenseDialog } from './AddExpenseDialog'
import { useExpenses } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'

interface ExpenseTableProps {
  year: number
  month: number
}

export function ExpenseTable({ year, month }: ExpenseTableProps) {
  const [addOpen, setAddOpen] = useState(false)
  const { data: expenses = [], isLoading } = useExpenses({ year, month })
  const { data: categories = [] } = useCategories()

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
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
          <div className="divide-y divide-border px-4">
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                category={categoryById[expense.category_id]}
              />
            ))}
          </div>
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
