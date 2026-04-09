import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import { useAddExpense, useUpdateExpense } from '@/hooks/useExpenses'
import type { Expense } from '@/types/index'

const schema = z.object({
  category_id: z.string().min(1, 'Select a category'),
  amount: z.string().min(1, 'Enter an amount'),
  description: z.string().optional(),
  expense_date: z.string().min(1, 'Select a date'),
  is_recurring: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Expense | null
  defaultDate?: string
}

export function AddExpenseDialog({ open, onOpenChange, editing, defaultDate }: AddExpenseDialogProps) {
  const { data: categories = [] } = useCategories()
  const addExpense = useAddExpense()
  const updateExpense = useUpdateExpense()

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { expense_date: defaultDate ?? today, amount: '', is_recurring: false },
  })

  const selectedCategoryId = watch('category_id')
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  useEffect(() => {
    if (editing) {
      reset({
        category_id: editing.category_id,
        amount: String(editing.amount),
        description: editing.description ?? '',
        expense_date: editing.expense_date,
        is_recurring: editing.is_recurring,
      })
    } else {
      reset({ category_id: '', amount: '', description: '', expense_date: defaultDate ?? today, is_recurring: false })
    }
  }, [editing, open, reset, defaultDate, today])

  async function onSubmit(values: FormValues) {
    const amount = parseFloat(values.amount)
    const payload = {
      category_id: values.category_id,
      amount,
      description: values.description || null,
      expense_date: values.expense_date,
      is_recurring: values.is_recurring,
    }
    if (editing) {
      await updateExpense.mutateAsync({ id: editing.id, ...payload })
    } else {
      await addExpense.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit expense' : 'New expense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-3">
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select
              value={selectedCategoryId || undefined}
              onValueChange={(val) => setValue('category_id', val ?? '')}
            >
              <SelectTrigger className="w-full">
                {selectedCategory ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: selectedCategory.color }}
                    />
                    {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select category</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-xs text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="expense_date">Date</Label>
              <Input id="expense_date" type="date" {...register('expense_date')} />
              {errors.expense_date && (
                <p className="text-xs text-destructive">{errors.expense_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="description" placeholder="e.g. Monthly rent" {...register('description')} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              {...register('is_recurring')}
            />
            <span className="text-sm text-muted-foreground">Repeat monthly</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? 'Save changes' : 'Add expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
