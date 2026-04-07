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
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import { useAddExpense, useUpdateExpense } from '@/hooks/useExpenses'
import type { Expense } from '@/types/index'

const schema = z.object({
  category_id: z.string().min(1, 'Select a category'),
  amount: z.string().min(1, 'Enter an amount'),
  description: z.string().optional(),
  expense_date: z.string().min(1, 'Select a date'),
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { expense_date: defaultDate ?? today, amount: '' },
  })

  useEffect(() => {
    if (editing) {
      reset({
        category_id: editing.category_id,
        amount: String(editing.amount),
        description: editing.description ?? '',
        expense_date: editing.expense_date,
      })
    } else {
      reset({ category_id: '', amount: '', description: '', expense_date: defaultDate ?? today })
    }
  }, [editing, open, reset, defaultDate, today])

  async function onSubmit(values: FormValues) {
    const amount = parseFloat(values.amount)
    const payload = { category_id: values.category_id, amount, description: values.description || null, expense_date: values.expense_date }
    if (editing) {
      await updateExpense.mutateAsync({ id: editing.id, ...payload })
    } else {
      await addExpense.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit expense' : 'New expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select
              defaultValue={editing?.category_id ?? undefined}
              onValueChange={(val) => setValue('category_id', val ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense_date">Date</Label>
            <Input id="expense_date" type="date" {...register('expense_date')} />
            {errors.expense_date && (
              <p className="text-sm text-destructive">{errors.expense_date.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Note (optional)</Label>
            <Input id="description" placeholder="e.g. Monthly rent" {...register('description')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
