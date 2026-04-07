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
import { useAddCategory, useUpdateCategory } from '@/hooks/useCategories'
import type { Category } from '@/types/index'

const schema = z.object({
  name: z.string().min(1, 'Enter a name'),
  color: z.string(),
  budget_limit: z.string(),
})

type FormValues = z.infer<typeof schema>

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Category | null
}

export function AddCategoryDialog({ open, onOpenChange, editing }: AddCategoryDialogProps) {
  const addCategory = useAddCategory()
  const updateCategory = useUpdateCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { color: '#6366f1', budget_limit: '' },
  })

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, color: editing.color, budget_limit: editing.budget_limit?.toString() ?? '' })
    } else {
      reset({ name: '', color: '#6366f1', budget_limit: '' })
    }
  }, [editing, open, reset])

  async function onSubmit(values: FormValues) {
    const budget_limit = values.budget_limit ? parseFloat(values.budget_limit) : null
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, name: values.name, color: values.color, budget_limit, icon: editing.icon })
    } else {
      await addCategory.mutateAsync({ name: values.name, color: values.color, budget_limit, icon: null })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Rent" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="budget_limit">Monthly budget limit</Label>
            <Input
              id="budget_limit"
              type="number"
              step="0.01"
              placeholder="Optional"
              {...register('budget_limit')}
            />
            {errors.budget_limit && (
              <p className="text-sm text-destructive">{errors.budget_limit.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="color">Color</Label>
            <input
              id="color"
              type="color"
              className="h-9 w-16 cursor-pointer rounded-md border border-input bg-transparent p-1"
              {...register('color')}
            />
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
