import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
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
    mutationFn: async (values: Pick<Expense, 'category_id' | 'amount' | 'description' | 'expense_date'>) => {
      const { error } = await supabase.from('expenses').insert({
        ...values,
        user_id: session!.user.id,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Expense> & { id: string }) => {
      const { error } = await supabase
        .from('expenses')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
