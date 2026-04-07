import { useMemo } from 'react'
import { useExpenses } from './useExpenses'
import { useCategories } from './useCategories'
import type { MonthlyTotal } from '@/types/index'

interface UseMonthlyTotalsParams {
  year: number
  month: number
}

// Считает итоги по категориям за месяц — питает оба графика (pie и bar)
export function useMonthlyTotals({ year, month }: UseMonthlyTotalsParams) {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses({ year, month })
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

  const totals = useMemo<MonthlyTotal[]>(() => {
    // Группируем расходы по category_id и суммируем amount
    const sumByCategory: Record<string, number> = {}
    for (const expense of expenses) {
      sumByCategory[expense.category_id] =
        (sumByCategory[expense.category_id] ?? 0) + Number(expense.amount)
    }

    // Объединяем с данными категорий (цвет, лимит, имя)
    return categories
      .filter((cat) => sumByCategory[cat.id] !== undefined)
      .map((cat) => ({
        category_id: cat.id,
        category_name: cat.name,
        color: cat.color,
        total: sumByCategory[cat.id],
        budget_limit: cat.budget_limit,
      }))
  }, [expenses, categories])

  return {
    totals,
    isLoading: expensesLoading || categoriesLoading,
  }
}
