import { useState } from 'react'
import { Pencil, Trash2, Repeat2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { AddExpenseDialog } from './AddExpenseDialog'
import { useDeleteExpense } from '@/hooks/useExpenses'
import type { Expense, Category } from '@/types/index'

interface ExpenseRowProps {
  expense: Expense
  category?: Category
}

export function ExpenseRow({ expense, category }: ExpenseRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteExpense = useDeleteExpense()

  const date = new Date(expense.expense_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {category && (
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
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{category?.name ?? 'Unknown'}</p>
            {expense.description && (
              <p className="truncate text-xs text-muted-foreground">{expense.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {expense.is_recurring && (
            <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" title="Repeats monthly" />
          )}
          <span className="text-xs text-muted-foreground">{date}</span>
          <span className="text-sm font-semibold tabular-nums">${Number(expense.amount).toFixed(2)}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AddExpenseDialog open={editOpen} onOpenChange={setEditOpen} editing={expense} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete expense"
        description="This action cannot be undone."
        onConfirm={() => deleteExpense.mutate({ id: expense.id, category_id: expense.category_id, expense_date: expense.expense_date })}
        isLoading={deleteExpense.isPending}
      />
    </>
  )
}
