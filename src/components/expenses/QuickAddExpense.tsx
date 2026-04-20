import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import { useAddExpense } from '@/hooks/useExpenses'

interface QuickAddExpenseProps {
  defaultDate: string
  onExpenseAdded?: (categoryId: string) => void
}

export function QuickAddExpense({ defaultDate, onExpenseAdded }: QuickAddExpenseProps) {
  const { data: categories = [] } = useCategories()
  const addExpense = useAddExpense()

  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [isSuggesting, setIsSuggesting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedCategory = categories.find((c) => c.id === categoryId)

  // Parse amount from input like "Starbucks 12" or "12 lunch"
  function parseInput(input: string): { text: string; parsedAmount: string } {
    const match = input.match(/(\d+(\.\d+)?)/)
    if (!match) return { text: input, parsedAmount: '' }
    const parsedAmount = match[1]
    const text = input.replace(match[0], '').trim()
    return { text: text || input, parsedAmount }
  }

  function handleDescriptionChange(value: string) {
    setDescription(value)
    const { parsedAmount } = parseInput(value)
    if (parsedAmount) setAmount(parsedAmount)
  }

  useEffect(() => {
    const text = parseInput(description).text
    if (!text.trim() || !categories.length) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setIsSuggesting(true)
      try {
        const res = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: text,
            categories: categories.map((c) => ({ id: c.id, name: c.name })),
          }),
        })
        const data = await res.json() as { category_id: string | null }
        if (data.category_id) setCategoryId(data.category_id)
      } finally {
        setIsSuggesting(false)
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [description, categories])

  async function handleAdd() {
    const parsed = parseFloat(amount)
    if (!categoryId || isNaN(parsed) || parsed <= 0) return
    const { text } = parseInput(description)

    await addExpense.mutateAsync({
      category_id: categoryId,
      amount: parsed,
      description: text.trim() || null,
      expense_date: defaultDate,
      is_recurring: false,
    })

    toast.success('Expense added')
    onExpenseAdded?.(categoryId)
    setDescription('')
    setAmount('')
    setCategoryId('')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid rgba(124,58,237,0.3)',
        background: 'rgba(124,58,237,0.04)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <Sparkles size={14} style={{ color: '#7c3aed', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
          Quick Add
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#7c3aed',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '4px',
            padding: '1px 6px',
          }}
        >
          AI
        </span>
      </div>

      {/* Description with sparkles prefix */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Sparkles
          size={14}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isSuggesting ? '#7c3aed' : 'var(--muted-foreground)',
            transition: 'color 0.2s ease',
            pointerEvents: 'none',
          }}
        />
        <Input
          placeholder="e.g. Starbucks 12.50"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ paddingLeft: '30px' }}
        />
        {isSuggesting && (
          <p style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px', paddingLeft: '2px' }}>
            Analyzing...
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

      {/* Category */}
      <div style={{ flex: 1.5, minWidth: '120px' }}>
        <Select value={categoryId || undefined} onValueChange={(val) => setCategoryId(val ?? '')}>
          <SelectTrigger className="w-full">
            {selectedCategory ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {selectedCategory.icon ? (
                  <span style={{ fontSize: '13px' }}>{selectedCategory.icon}</span>
                ) : (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedCategory.color, flexShrink: 0, display: 'inline-block' }} />
                )}
                {selectedCategory.name}
              </span>
            ) : (
              <span style={{ color: 'var(--muted-foreground)' }}>Category</span>
            )}
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {cat.icon ? (
                    <span style={{ fontSize: '13px' }}>{cat.icon}</span>
                  ) : (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color, flexShrink: 0, display: 'inline-block' }} />
                  )}
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div style={{ width: '100px', flexShrink: 0 }}>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="$0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
      </div>

      <Button
        onClick={handleAdd}
        disabled={addExpense.isPending || !categoryId || !amount}
      >
        Add
      </Button>
      </div>
    </div>
  )
}
