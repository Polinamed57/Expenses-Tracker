import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { Goal } from '@/types/index'

const QUERY_KEY = 'goals'

export function useGoals() {
  const { session } = useAuth()

  return useQuery({
    queryKey: [QUERY_KEY, session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Goal[]
    },
    enabled: !!session,
  })
}

export function useAddGoal() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (values: { title: string; target_amount: number; emoji: string | null }) => {
      const { error } = await supabase.from('goals').insert({
        user_id: session!.user.id,
        ...values,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Goal created')
    },
    onError: () => toast.error('Failed to create goal'),
  })
}

export function useAddGoalFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: (goal.current_amount as number) + amount })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Funds added')
    },
    onError: () => toast.error('Failed to add funds'),
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Goal deleted')
    },
    onError: () => toast.error('Failed to delete goal'),
  })
}
