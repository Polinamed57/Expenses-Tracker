import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { upsertSnapshot } from '@/lib/snapshots'
import type { Expense } from '@/types/index'

const QUERY_KEY = 'expenses'

interface UseExpensesParams {
  year: number
  month: number
}

export function useExpenses({ year, month }: UseExpensesParams) {
  const { session } = useAuth()

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to = new Date(year, month, 0).toISOString().split('T')[0]

  return useQuery({
    queryKey: [QUERY_KEY, session?.user.id, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', from)
        .lte('expense_date', to)
        .order('expense_date', { ascending: false })

      if (error) throw error
      return data as Expense[]
    },
    enabled: !!session,
  })
}

export function useAddExpense() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (values: Pick<Expense, 'category_id' | 'amount' | 'description' | 'expense_date' | 'is_recurring'>) => {
      const { error } = await supabase.from('expenses').insert({
        ...values,
        user_id: session!.user.id,
      })
      if (error) throw error
      return values
    },
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Expense added')
      const d = new Date(values.expense_date)
      upsertSnapshot(session!.user.id, values.category_id, d.getFullYear(), d.getMonth() + 1)
    },
    onError: () => toast.error('Failed to add expense'),
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Expense> & { id: string }) => {
      const { error } = await supabase
        .from('expenses')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return values
    },
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Expense updated')
      if (values.category_id && values.expense_date) {
        const d = new Date(values.expense_date)
        upsertSnapshot(session!.user.id, values.category_id, d.getFullYear(), d.getMonth() + 1)
      }
    },
    onError: () => toast.error('Failed to update expense'),
  })
}

// Copies recurring expenses from previous month into current month if not already present
export function useSeedRecurringExpenses(year: number, month: number) {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['seed-recurring', session?.user.id, year, month],
    queryFn: async () => {
      const prevDate = new Date(year, month - 2, 1)
      const prevYear = prevDate.getFullYear()
      const prevMonth = prevDate.getMonth() + 1
      const prevFrom = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`
      const prevTo = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0]

      const curFrom = `${year}-${String(month).padStart(2, '0')}-01`
      const curTo = new Date(year, month, 0).toISOString().split('T')[0]

      const [{ data: prevExpenses }, { data: curExpenses }] = await Promise.all([
        supabase.from('expenses').select('*').eq('is_recurring', true).gte('expense_date', prevFrom).lte('expense_date', prevTo),
        supabase.from('expenses').select('category_id').gte('expense_date', curFrom).lte('expense_date', curTo),
      ])

      if (!prevExpenses?.length) return null

      const curCategoryIds = new Set((curExpenses ?? []).map((e) => e.category_id))
      // only copy recurring expenses for categories not yet present this month
      const toInsert = prevExpenses
        .filter((e) => !curCategoryIds.has(e.category_id))
        .map((e) => ({
          user_id: session!.user.id,
          category_id: e.category_id,
          amount: e.amount,
          description: e.description,
          is_recurring: true,
          expense_date: curFrom,
        }))

      if (!toInsert.length) return null

      const { error } = await supabase.from('expenses').insert(toInsert)
      if (error) throw error

      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      return toInsert.length
    },
    enabled: !!session,
    staleTime: Infinity, // only run once per month/session
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (expense: Pick<Expense, 'id' | 'category_id' | 'expense_date'>) => {
      const { error } = await supabase.from('expenses').delete().eq('id', expense.id)
      if (error) throw error
      return expense
    },
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Expense deleted')
      const d = new Date(expense.expense_date)
      upsertSnapshot(session!.user.id, expense.category_id, d.getFullYear(), d.getMonth() + 1)
    },
    onError: () => toast.error('Failed to delete expense'),
  })
}
