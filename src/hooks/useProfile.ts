import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { Profile } from '@/types/index'

const QUERY_KEY = 'profile'

export function useProfile() {
  const { session } = useAuth()

  return useQuery({
    queryKey: [QUERY_KEY, session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!session,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (values: Partial<Pick<Profile, 'display_name'>>) => {
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', session!.user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Profile saved')
    },
    onError: () => toast.error('Failed to save profile'),
  })
}
