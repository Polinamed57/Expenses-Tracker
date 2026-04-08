import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { Expense } from '@/types/index'

export interface MonthPoint {
  label: string
  total: number
  year: number
  month: number
}

export function useExpenseHistory(months: number) {
  const { session } = useAuth()

  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const fromStr = from.toISOString().split('T')[0]
  const toStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expense-history', session?.user.id, months],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', fromStr)
        .lte('expense_date', toStr)

      if (error) throw error
      return data as Pick<Expense, 'amount' | 'expense_date'>[]
    },
    enabled: !!session,
  })

  const points = useMemo<MonthPoint[]>(() => {
    const buckets: Record<string, MonthPoint> = {}

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      buckets[key] = {
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        total: 0,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      }
    }

    for (const expense of expenses) {
      const d = new Date(expense.expense_date + 'T00:00:00')
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (buckets[key]) {
        buckets[key].total += Number(expense.amount)
      }
    }

    return Object.values(buckets)
  }, [expenses, months])

  return { points, isLoading }
}
