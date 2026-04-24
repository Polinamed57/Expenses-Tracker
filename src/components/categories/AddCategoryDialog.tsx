import { useEffect, useState } from 'react'
import { Ban } from 'lucide-react'
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
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAddCategory, useUpdateCategory, useArchiveCategory, useDeleteCategory, useCategoryHasExpenses } from '@/hooks/useCategories'
import type { Category } from '@/types/index'

const EMOJI_OPTIONS = [
  '🏠', // rent / housing
  '🚗', // car / transport
  '🚌', // public transport
  '✈️', // travel
  '🍕', // food / dining out
  '🍔', // fast food / takeout
  '🛒', // groceries
  '☕', // coffee
  '🍷', // drinks / nights out
  '🛍️', // shopping
  '👕', // clothing
  '💊', // pharmacy
  '🏥', // medical / doctor
  '🏋️', // gym / fitness
  '📚', // education
  '🎮', // games
  '🎬', // movies / cinema
  '🎵', // music / subscriptions
  '📺', // streaming
  '💻', // tech / devices
  '📱', // phone / internet
  '⚡', // utilities
  '🔧', // repairs / maintenance
  '🐾', // pets
  '👶', // kids
  '💇', // personal care / beauty
  '💰', // savings / cash
  '🎁', // gifts
]

const schema = z.object({
  name: z.string().min(1, 'Enter a name'),
  color: z.string(),
  budget_limit: z.string(),
  icon: z.string().nullable(),
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
  const archiveCategory = useArchiveCategory()
  const deleteCategory = useDeleteCategory()
  const { data: hasExpenses } = useCategoryHasExpenses(editing?.id ?? '')
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { color: '#6366f1', budget_limit: '', icon: null },
  })

  const colorValue = watch('color')
  const iconValue = watch('icon')

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, color: editing.color, budget_limit: editing.budget_limit?.toString() ?? '', icon: editing.icon })
    } else {
      reset({ name: '', color: '#6366f1', budget_limit: '', icon: null })
    }
  }, [editing, open, reset])

  async function onSubmit(values: FormValues) {
    const budget_limit = values.budget_limit ? parseFloat(values.budget_limit) : null
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, name: values.name, color: values.color, budget_limit, icon: values.icon ?? null })
    } else {
      await addCategory.mutateAsync({ name: values.name, color: values.color, budget_limit, icon: values.icon ?? null })
    }
    onOpenChange(false)
  }

  async function handleArchive() {
    if (!editing) return
    await archiveCategory.mutateAsync(editing.id)
    setArchiveOpen(false)
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!editing) return
    await deleteCategory.mutateAsync(editing.id)
    setDeleteOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-base font-bold shadow-sm"
                style={{ backgroundColor: colorValue }}
              >
                {watch('name')?.[0]?.toUpperCase() ?? '#'}
              </span>
              <DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Groceries" autoFocus {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Icon <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setValue('icon', null)}
                  title="No icon"
                  aria-label="No icon"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: iconValue === null ? `2px solid ${colorValue}` : '2px solid transparent',
                    background: iconValue === null ? `${colorValue}20` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <Ban size={16} />
                </button>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setValue('icon', iconValue === emoji ? null : emoji)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: iconValue === emoji ? `2px solid ${colorValue}` : '2px solid transparent',
                      background: iconValue === emoji ? `${colorValue}20` : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="budget_limit">Monthly limit</Label>
                <Input
                  id="budget_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="No limit"
                  {...register('budget_limit')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="color">Color</Label>
                <input
                  id="color"
                  type="color"
                  className="h-10 w-14 cursor-pointer rounded-md border border-input bg-transparent p-1"
                  {...register('color')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {editing ? (
                <div className="flex gap-1">
                  {hasExpenses ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setArchiveOpen(true)}
                    >
                      Archive
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {editing ? 'Save changes' : 'Add category'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive category"
        description={`Archive "${editing?.name}"? It will be hidden but past expenses will remain.`}
        onConfirm={handleArchive}
        isLoading={archiveCategory.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete category"
        description={`Delete "${editing?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
      />
    </>
  )
}
