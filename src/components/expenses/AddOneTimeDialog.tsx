import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAddExpense } from '@/hooks/useExpenses'

interface AddOneTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate: string
}

export function AddOneTimeDialog({ open, onOpenChange, defaultDate }: AddOneTimeDialogProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(defaultDate)
  const addExpense = useAddExpense()

  useEffect(() => {
    if (open) {
      setAmount('')
      setDescription('')
      setDate(defaultDate)
    }
  }, [open, defaultDate])

  async function handleSubmit() {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return
    await addExpense.mutateAsync({
      category_id: null,
      amount: parsed,
      description: description.trim() || null,
      expense_date: date,
      is_recurring: false,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add one-time expense</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            For purchases that don't fit any tracked category. They count toward your total spent
            but stay separate from category budgets.
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="onetime-amount">Amount</Label>
            <Input
              id="onetime-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="onetime-description">Description</Label>
            <Input
              id="onetime-description"
              placeholder="e.g. Birthday gift"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="onetime-date">Date</Label>
            <Input
              id="onetime-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={addExpense.isPending || !amount}>
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
