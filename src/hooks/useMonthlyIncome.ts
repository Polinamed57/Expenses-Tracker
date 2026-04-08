import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

const QUERY_KEY = 'monthly-income'

export function useMonthlyIncome(year: number, month: number) {
  const { session } = useAuth()

  return useQuery({
    queryKey: [QUERY_KEY, session?.user.id, year, month],
    queryFn: async () => {
      const { data } = await supabase
        .from('monthly_income')
        .select('amount')
        .eq('user_id', session!.user.id)
        .eq('year', year)
        .eq('month', month)
        .single()

      return data?.amount ? Number(data.amount) : null
    },
    enabled: !!session,
  })
}

export function useSetMonthlyIncome() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async ({ year, month, amount }: { year: number; month: number; amount: number }) => {
      const { error } = await supabase.from('monthly_income').upsert(
        { user_id: session!.user.id, year, month, amount },
        { onConflict: 'user_id,year,month' },
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Income updated')
    },
    onError: () => toast.error('Failed to update income'),
  })
}
