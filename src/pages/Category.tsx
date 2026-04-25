import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Repeat2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PageShell } from '@/components/layout/PageShell'
import { MonthPicker } from '@/components/common/MonthPicker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useCategories, useUpdateCategory } from '@/hooks/useCategories'
import { useExpenses, useAddExpense, useDeleteExpense } from '@/hooks/useExpenses'
import { useMonthlyTotals } from '@/hooks/useMonthlyTotals'
import { useExpenseHistory } from '@/hooks/useExpenseHistory'
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog'

interface MiniStatProps {
  label: string
  value: string
  hint?: string
}

function MiniStat({ label, value, hint }: MiniStatProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-lg font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

interface TrendTooltipPayload {
  payload: { label: string; total: number }
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: TrendTooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground tabular-nums">${item.total.toFixed(2)}</p>
    </div>
  )
}

export default function Category() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const now = new Date()
  const initialYear = Number(searchParams.get('year')) || now.getFullYear()
  const initialMonth = Number(searchParams.get('month')) || now.getMonth() + 1
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [limitInput, setLimitInput] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { data: allExpenses = [] } = useExpenses({ year, month })
  const { totals } = useMonthlyTotals({ year, month })
  const addExpense = useAddExpense()
  const deleteExpense = useDeleteExpense()
  const updateCategory = useUpdateCategory()

  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const { totals: prevTotals } = useMonthlyTotals({ year: prevYear, month: prevMonth })

  const { points: history } = useExpenseHistory(6, id)

  const category = categories.find((c) => c.id === id)

  useEffect(() => {
    if (category) {
      setLimitInput(category.budget_limit != null ? String(category.budget_limit) : '')
    }
  }, [category])

  if (!catsLoading && !category) {
    return <Navigate to="/" replace />
  }

  if (!category) {
    return (
      <PageShell>
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </PageShell>
    )
  }

  const expenses = allExpenses.filter((e) => e.category_id === category.id)
  const total = totals.find((t) => t.category_id === category.id)
  const spent = total?.total ?? 0
  const limit = category.budget_limit
  const progress = limit ? Math.min((spent / limit) * 100, 100) : null
  const percentage = limit ? Math.round((spent / limit) * 100) : null
  const isOverBudget = limit !== null && spent > limit

  const prevSpent = prevTotals.find((t) => t.category_id === category.id)?.total ?? 0
  const delta = spent - prevSpent
  const deltaTone: 'good' | 'bad' | 'neutral' =
    delta === 0 ? 'neutral' : delta < 0 ? 'good' : 'bad'
  const deltaColor =
    deltaTone === 'good' ? '#22c55e' : deltaTone === 'bad' ? '#ef4444' : 'var(--muted-foreground)'
  const deltaArrow = delta > 0 ? '↑' : delta < 0 ? '↓' : ''
  const showDelta = !(spent === 0 && prevSpent === 0)

  const monthsWithSpending = history.filter((p) => p.total > 0)
  const avgMonthly =
    monthsWithSpending.length > 0
      ? monthsWithSpending.reduce((sum, p) => sum + p.total, 0) / monthsWithSpending.length
      : 0

  const largest = expenses.length
    ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
    : null

  const today = `${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

  async function handleAddExpense() {
    if (!category) return
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
    if (!category) return
    const parsed = parseFloat(limitInput)
    await updateCategory.mutateAsync({
      id: category.id,
      budget_limit: !isNaN(parsed) && parsed > 0 ? parsed : null,
    })
  }

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
    setSearchParams({ year: String(y), month: String(m) }, { replace: true })
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-3">
            {category.icon ? (
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{category.icon}</span>
            ) : (
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '9999px',
                  background: category.color,
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
            )}
            <h1 className="text-3xl font-semibold flex-1">{category.name}</h1>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Edit category"
            >
              <Pencil size={16} />
            </button>
            <MonthPicker year={year} month={month} onChange={handleMonthChange} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Spent this month</p>
          <p
            className={`mt-2 text-4xl font-bold tabular-nums ${isOverBudget ? 'text-destructive' : ''}`}
          >
            ${spent.toFixed(2)}
          </p>
          {showDelta && (
            <p className="mt-1 text-xs tabular-nums" style={{ color: deltaColor }}>
              {deltaArrow} ${Math.abs(delta).toFixed(2)}{' '}
              <span style={{ color: 'var(--muted-foreground)' }}>vs last month</span>
            </p>
          )}
          {progress !== null && (
            <div className="mt-4 flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                {percentage}% of ${limit!.toFixed(0)}
              </p>
              <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: 'rgba(150,150,150,0.25)' }}>
                <div
                  style={{
                    height: '8px',
                    width: isOverBudget ? '100%' : `${progress}%`,
                    borderRadius: '9999px',
                    background: isOverBudget
                      ? 'linear-gradient(to right, #ff4444, #ff0000)'
                      : 'linear-gradient(to right, #4ade80, #facc15, #f97316, #ef4444)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MiniStat
            label="Avg / month"
            value={`$${avgMonthly.toFixed(0)}`}
            hint="last 6 months"
          />
          <MiniStat
            label="Largest"
            value={largest ? `$${largest.amount.toFixed(2)}` : '—'}
            hint={largest?.description ?? (largest ? 'No description' : 'No expenses')}
          />
          <MiniStat
            label="Count"
            value={String(expenses.length)}
            hint={expenses.length === 1 ? 'expense' : 'expenses'}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Last 6 months</p>
          <div className="rounded-xl border border-border bg-card p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={history} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<TrendTooltip />} cursor={{ fill: 'rgba(99,102,241,0.12)' }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {history.map((point) => {
                    const isCurrent = point.year === year && point.month === month
                    return (
                      <Cell
                        key={`${point.year}-${point.month}`}
                        fill={category.color}
                        opacity={isCurrent ? 1 : 0.4}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
              style={{ width: '110px', flexShrink: 0 }}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
            />
            <Button onClick={handleAddExpense} disabled={addExpense.isPending || !amount}>
              Add
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Expenses</p>
            <p className="text-sm text-muted-foreground">
              {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card">
            {expenses.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No expenses yet</p>
            ) : (
              <div className="divide-y divide-border px-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{expense.description ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.expense_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {expense.is_recurring && (
                        <Repeat2
                          size={13}
                          className="text-muted-foreground"
                          aria-label="Repeats monthly"
                        />
                      )}
                      <p className="text-sm font-semibold tabular-nums">${expense.amount.toFixed(2)}</p>
                      <button
                        onClick={() => deleteExpense.mutate(expense)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6">
          <Label htmlFor="page-limit">Monthly limit</Label>
          <div className="flex gap-2 max-w-md">
            <Input
              id="page-limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="No limit"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveLimit()}
            />
            <Button variant="outline" onClick={handleSaveLimit} disabled={updateCategory.isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>

      <AddCategoryDialog open={editOpen} onOpenChange={setEditOpen} editing={category} />
    </PageShell>
  )
}
