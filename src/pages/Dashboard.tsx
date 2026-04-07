import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { MonthPicker } from '@/components/common/MonthPicker'
import { CategoryList } from '@/components/categories/CategoryList'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { useMonthlyTotals } from '@/hooks/useMonthlyTotals'

export default function Dashboard() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { totals } = useMonthlyTotals({ year, month })

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <MonthPicker year={year} month={month} onChange={handleMonthChange} />
        </div>

        <CategoryList totals={totals} />
        <ExpenseTable year={year} month={month} />
      </div>
    </PageShell>
  )
}
