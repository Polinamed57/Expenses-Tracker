import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
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
}

export function QuickAddExpense({ defaultDate }: QuickAddExpenseProps) {
  const { data: categories = [] } = useCategories()
  const addExpense = useAddExpense()

  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [isSuggesting, setIsSuggesting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedCategory = categories.find((c) => c.id === categoryId)

  useEffect(() => {
    if (!description.trim() || !categories.length) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setIsSuggesting(true)
      try {
        const res = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
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

    await addExpense.mutateAsync({
      category_id: categoryId,
      amount: parsed,
      description: description.trim() || null,
      expense_date: defaultDate,
      is_recurring: false,
    })

    setDescription('')
    setAmount('')
    setCategoryId('')
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      {/* Description with sparkles prefix */}
      <div style={{ position: 'relative', flex: 2, minWidth: 0 }}>
        <Sparkles
          size={14}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isSuggesting ? '#a855f7' : 'var(--muted-foreground)',
            transition: 'color 0.2s ease',
            pointerEvents: 'none',
          }}
        />
        <Input
          placeholder="What did you spend on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ paddingLeft: '30px' }}
        />
      </div>

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
  )
}
