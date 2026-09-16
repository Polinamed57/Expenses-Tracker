import { useState } from 'react'
import { Pencil, CreditCard, TrendingUp, Target, AlertTriangle, Plus, Receipt } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { MonthPicker } from '@/components/common/MonthPicker'
import { CategoryList } from '@/components/categories/CategoryList'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { ExpenseBarChart } from '@/components/charts/ExpenseBarChart'
import { ChartToggle } from '@/components/charts/ChartToggle'
import type { ChartType } from '@/components/charts/ChartToggle'
import { useMonthlyTotals } from '@/hooks/useMonthlyTotals'
import { useMonthlyIncome, useSetMonthlyIncome } from '@/hooks/useMonthlyIncome'
import { useExpenses, useSeedRecurringExpenses } from '@/hooks/useExpenses'
import { useProfile } from '@/hooks/useProfile'
import { useSelectedMonth } from '@/hooks/useSelectedMonth'
import { useAuth } from '@/providers/AuthProvider'
import { DEMO_EMAIL } from '@/lib/demo'
import { QuickAddExpense } from '@/components/expenses/QuickAddExpense'
import { AddOneTimeDialog } from '@/components/expenses/AddOneTimeDialog'
import { OneTimeList } from '@/components/expenses/OneTimeList'
import { HistoryChart } from '@/components/charts/HistoryChart'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type DeltaTone = 'good' | 'bad' | 'neutral'

interface StatCardDelta {
  text: string
  tone: DeltaTone
  direction: 'up' | 'down' | 'same'
}

interface BuildDeltaOptions {
  format: (value: number) => string
  upIsGood: boolean
  hideWhenBothZero?: boolean
}

function buildDelta(current: number, previous: number, opts: BuildDeltaOptions): StatCardDelta | undefined {
  if (opts.hideWhenBothZero && current === 0 && previous === 0) return undefined
  const diff = current - previous
  if (diff === 0) {
    return { text: 'No change', tone: 'neutral', direction: 'same' }
  }
  const direction: StatCardDelta['direction'] = diff > 0 ? 'up' : 'down'
  const tone: DeltaTone =
    (diff > 0 && opts.upIsGood) || (diff < 0 && !opts.upIsGood) ? 'good' : 'bad'
  return { text: opts.format(Math.abs(diff)), tone, direction }
}

interface StatCardProps {
  label: string
  value: string
  alert?: boolean
  onEdit?: () => void
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  delta?: StatCardDelta
  emptyAction?: { label: string; onClick: () => void }
}

function StatCard({ label, value, alert, onEdit, icon, iconBg, iconColor, delta, emptyAction }: StatCardProps) {
  const deltaColor =
    delta?.tone === 'good' ? '#22c55e' : delta?.tone === 'bad' ? '#ef4444' : 'var(--muted-foreground)'
  const arrow = delta?.direction === 'up' ? '↑' : delta?.direction === 'down' ? '↓' : ''

  const isEmpty = value === '—'
  if (isEmpty && emptyAction) {
    return (
      <button
        onClick={emptyAction.onClick}
        className="card-hover rounded-xl border border-dashed border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: iconBg,
            color: iconColor,
            marginBottom: '12px',
          }}
        >
          {icon}
        </div>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="mt-1 text-sm font-semibold text-primary">
          {emptyAction.label} →
        </p>
      </button>
    )
  }

  return (
    <div className="card-hover rounded-xl border border-border bg-card px-4 py-4">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: iconBg,
          color: iconColor,
          marginBottom: '12px',
        }}
      >
        {icon}
      </div>
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit income"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <p className={`mt-1 text-xl font-bold tabular-nums ${alert ? 'text-destructive' : ''}`}>
        {value}
      </p>
      {delta && (
        <p className="mt-1 text-[11px] tabular-nums" style={{ color: deltaColor }}>
          {arrow} {delta.text} <span style={{ color: 'var(--muted-foreground)' }}>vs last month</span>
        </p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { year, month, setSelectedMonth } = useSelectedMonth()
  const [chartType, setChartType] = useState<ChartType>('pie')
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')
  const [oneTimeOpen, setOneTimeOpen] = useState(false)

  const { session } = useAuth()
  const { data: profile } = useProfile()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.display_name
    ? profile.display_name.split(' ')[0]
    : session?.user.email?.split('@')[0] ?? ''

  useSeedRecurringExpenses(year, month)
  const { totals } = useMonthlyTotals({ year, month })
  const { data: expenses = [] } = useExpenses({ year, month })
  const { data: income } = useMonthlyIncome(year, month)
  const setIncome = useSetMonthlyIncome()

  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const { totals: prevTotals } = useMonthlyTotals({ year: prevYear, month: prevMonth })
  const { data: prevExpenses = [] } = useExpenses({ year: prevYear, month: prevMonth })
  const { data: prevIncome } = useMonthlyIncome(prevYear, prevMonth)

  // include one-time (null category) expenses in totals
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const overBudgetCount = totals.filter(
    (t) => t.budget_limit !== null && t.total > t.budget_limit,
  ).length
  const remaining = income != null ? income - totalSpent : null

  const prevTotalSpent = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const prevOverBudgetCount = prevTotals.filter(
    (t) => t.budget_limit !== null && t.total > t.budget_limit,
  ).length
  const prevRemaining = prevIncome != null ? prevIncome - prevTotalSpent : null

  const spentDelta = buildDelta(totalSpent, prevTotalSpent, {
    format: (n) => `$${n.toFixed(2)}`,
    upIsGood: false,
  })
  const incomeDelta =
    income != null && prevIncome != null
      ? buildDelta(income, prevIncome, { format: (n) => `$${n.toFixed(2)}`, upIsGood: true })
      : undefined
  const remainingDelta =
    remaining != null && prevRemaining != null
      ? buildDelta(remaining, prevRemaining, { format: (n) => `$${n.toFixed(2)}`, upIsGood: true })
      : undefined
  const overBudgetDelta = buildDelta(overBudgetCount, prevOverBudgetCount, {
    format: (n) => String(n),
    upIsGood: false,
    hideWhenBothZero: true,
  })

  function handleMonthChange(y: number, m: number) {
    setSelectedMonth(y, m)
  }

  function openIncomeDialog() {
    setIncomeInput(income !== null ? String(income) : '')
    setIncomeDialogOpen(true)
  }

  async function handleSaveIncome() {
    const amount = parseFloat(incomeInput)
    if (isNaN(amount) || amount < 0) return
    await setIncome.mutateAsync({ year, month, amount })
    setIncomeDialogOpen(false)
  }

  const isDemoUser = session?.user.email === DEMO_EMAIL

  return (
    <PageShell>
      {isDemoUser && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(124,58,237,0.12))',
            border: '1px solid rgba(124,58,237,0.25)',
            color: 'var(--foreground)',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          You're viewing a demo account. Feel free to add expenses and explore.
        </div>
      )}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">👋 {greeting}, {firstName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <MonthPicker year={year} month={month} onChange={handleMonthChange} />
        </div>

        <div className="flex flex-col gap-6">
          <QuickAddExpense defaultDate={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`} />
          <button
            onClick={() => setOneTimeOpen(true)}
            className="group flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-4 py-3 text-left transition-colors hover:border-amber-500/60 hover:bg-amber-500/5 active:border-amber-500 active:bg-amber-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(245,158,11,0.12)',
                color: '#f59e0b',
                flexShrink: 0,
              }}
            >
              <Receipt size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">One-time expense</p>
              <p className="text-xs text-muted-foreground">
                For purchases that don't fit any category
              </p>
            </div>
            <Plus
              size={16}
              className="text-muted-foreground transition-colors group-hover:text-amber-500"
            />
          </button>
        </div>

        <p className="text-sm font-medium text-muted-foreground -mb-5">This month</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total spent"
            value={`$${totalSpent.toFixed(2)}`}
            icon={<CreditCard size={18} />}
            iconBg="rgba(249,115,22,0.12)"
            iconColor="#f97316"
            delta={spentDelta}
          />
          <StatCard
            label="Total income"
            value={income != null ? `$${income.toFixed(2)}` : '—'}
            onEdit={openIncomeDialog}
            icon={<TrendingUp size={18} />}
            iconBg="rgba(34,197,94,0.12)"
            iconColor="#22c55e"
            delta={incomeDelta}
            emptyAction={{ label: 'Set income', onClick: openIncomeDialog }}
          />
          <StatCard
            label="Remaining"
            value={remaining !== null ? `$${remaining.toFixed(2)}` : '—'}
            alert={remaining !== null && remaining < 0}
            icon={<Target size={18} />}
            iconBg={remaining !== null && remaining < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(139,92,246,0.12)'}
            iconColor={remaining !== null && remaining < 0 ? '#ef4444' : '#8b5cf6'}
            delta={remainingDelta}
          />
          <StatCard
            label="Over budget"
            value={overBudgetCount === 0 ? 'None' : `${overBudgetCount}`}
            alert={overBudgetCount > 0}
            icon={<AlertTriangle size={18} />}
            iconBg={overBudgetCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(150,150,150,0.1)'}
            iconColor={overBudgetCount > 0 ? '#ef4444' : '#9ca3af'}
            delta={overBudgetDelta}
          />
        </div>


        <CategoryList totals={totals} year={year} month={month} />

        <OneTimeList year={year} month={month} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Spending breakdown</h2>
            <ChartToggle value={chartType} onChange={setChartType} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            {chartType === 'pie' ? (
              <ExpensePieChart totals={totals} />
            ) : (
              <ExpenseBarChart totals={totals} />
            )}
          </div>
        </div>

        <HistoryChart />

        <ExpenseTable year={year} month={month} />
      </div>

      <AddOneTimeDialog
        open={oneTimeOpen}
        onOpenChange={setOneTimeOpen}
        defaultDate={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
      />

      <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Set income</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="income">
                Income for{' '}
                {new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </Label>
              <Input
                id="income"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveIncome()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIncomeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIncome} disabled={setIncome.isPending}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
