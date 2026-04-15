import { useState, useEffect } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useExpenses, useAddExpense, useDeleteExpense } from '@/hooks/useExpenses'
import { useUpdateCategory } from '@/hooks/useCategories'
import { AddCategoryDialog } from './AddCategoryDialog'
import type { Category, MonthlyTotal } from '@/types/index'

interface CategorySheetProps {
  category: Category
  total?: MonthlyTotal
  year: number
  month: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategorySheet({ category, total, year, month, open, onOpenChange }: CategorySheetProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [limitInput, setLimitInput] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const { data: allExpenses = [] } = useExpenses({ year, month })
  const addExpense = useAddExpense()
  const deleteExpense = useDeleteExpense()
  const updateCategory = useUpdateCategory()

  const expenses = allExpenses.filter((e) => e.category_id === category.id)
  const spent = total?.total ?? 0

  const today = `${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

  useEffect(() => {
    if (open) {
      setLimitInput(category.budget_limit != null ? String(category.budget_limit) : '')
    }
  }, [open, category.budget_limit])

  async function handleAddExpense() {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return
    await addExpense.mutateAsync({
      category_id: category.id,
      amount: parsed,
      description: description.trim() || null,
      expense_date: today,
      is_recurring: false,
    })
    setAmount('')
    setDescription('')
  }

  async function handleSaveLimit() {
    const parsed = parseFloat(limitInput)
    await updateCategory.mutateAsync({
      id: category.id,
      budget_limit: !isNaN(parsed) && parsed > 0 ? parsed : null,
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-[440px] overflow-y-auto">

          <SheetHeader className="flex-row items-center justify-between gap-3 pb-0">
            <div className="flex items-center gap-3">
              {category.icon ? (
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{category.icon}</span>
              ) : (
                <span style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: category.color, flexShrink: 0, display: 'inline-block',
                }} />
              )}
              <SheetTitle>{category.name}</SheetTitle>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Edit category"
            >
              <Pencil size={14} />
            </button>
          </SheetHeader>

          <div className="flex flex-col gap-6 p-4 pt-3">

            {/* Add expense */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">Add expense</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="$0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
                  style={{ width: '90px', flexShrink: 0 }}
                />
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
                />
                <Button
                  onClick={handleAddExpense}
                  disabled={addExpense.isPending || !amount}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Expenses list */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">This month</p>
                <p className="text-sm font-bold tabular-nums">${spent.toFixed(2)}</p>
              </div>
              {expenses.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No expenses yet</p>
              ) : (
                <div className="flex flex-col">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
                    >
                      <div>
                        <p className="text-sm">{expense.description ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.expense_date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold tabular-nums">${expense.amount.toFixed(2)}</p>
                        <button
                          onClick={() => deleteExpense.mutate({
                            id: expense.id,
                            category_id: expense.category_id,
                            expense_date: expense.expense_date,
                          })}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete expense"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly limit */}
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Label htmlFor="sheet-limit">Monthly limit</Label>
              <div className="flex gap-2">
                <Input
                  id="sheet-limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="No limit"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveLimit()}
                />
                <Button
                  variant="outline"
                  onClick={handleSaveLimit}
                  disabled={updateCategory.isPending}
                >
                  Save
                </Button>
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      <AddCategoryDialog open={editOpen} onOpenChange={setEditOpen} editing={category} />
    </>
  )
}
