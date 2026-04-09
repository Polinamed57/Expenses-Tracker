import { useState } from 'react'
import { Pencil } from 'lucide-react'
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
import { useSeedRecurringExpenses } from '@/hooks/useExpenses'
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

interface StatCardProps {
  label: string
  value: string
  alert?: boolean
  onEdit?: () => void
}

function StatCard({ label, value, alert, onEdit }: StatCardProps) {
  return (
    <div className="card-hover rounded-lg border border-border bg-card px-3 py-3 sm:px-4">
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
      <p className={`mt-1 text-lg font-bold tabular-nums sm:text-xl ${alert ? 'text-destructive' : ''}`}>
        {value}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [chartType, setChartType] = useState<ChartType>('pie')
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')

  useSeedRecurringExpenses(year, month)
  const { totals } = useMonthlyTotals({ year, month })
  const { data: income } = useMonthlyIncome(year, month)
  const setIncome = useSetMonthlyIncome()

  const totalSpent = totals.reduce((sum, t) => sum + t.total, 0)
  const overBudgetCount = totals.filter(
    (t) => t.budget_limit !== null && t.total > t.budget_limit,
  ).length
  const totalLimit = totals.reduce((sum, t) => sum + (t.budget_limit ?? 0), 0)
  const remaining = totalLimit - totalSpent

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
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

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <MonthPicker year={year} month={month} onChange={handleMonthChange} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total spent" value={`$${totalSpent.toFixed(2)}`} />
          <StatCard
            label="Total income"
            value={income != null ? `$${income.toFixed(2)}` : '—'}
            onEdit={openIncomeDialog}
          />
          <StatCard
            label="Remaining"
            value={totalLimit > 0 ? `$${remaining.toFixed(2)}` : '—'}
            alert={remaining < 0}
          />
          <StatCard
            label="Over budget"
            value={overBudgetCount === 0 ? 'None' : `${overBudgetCount}`}
            alert={overBudgetCount > 0}
          />
        </div>

        {totalLimit > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall budget</span>
              <span className="font-medium tabular-nums">
                ${totalSpent.toFixed(0)}
                <span className="text-muted-foreground font-normal"> / ${totalLimit.toFixed(0)}</span>
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: 'rgba(150,150,150,0.2)' }}>
              <div
                style={{
                  height: '8px',
                  width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%`,
                  borderRadius: '9999px',
                  background: totalSpent > totalLimit
                    ? 'linear-gradient(to right, #ff4444, #ff0000)'
                    : 'linear-gradient(to right, #4ade80, #facc15, #f97316, #ef4444)',
                  backgroundSize: totalSpent <= totalLimit
                    ? `${(10000 / Math.min((totalSpent / totalLimit) * 100, 100)).toFixed(1)}% 100%`
                    : undefined,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        )}

        <CategoryList totals={totals} />

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
