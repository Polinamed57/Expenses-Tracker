import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { Category } from '@/types/index'

const QUERY_KEY = 'categories'

export function useCategories() {
  const { session } = useAuth()

  return useQuery({
    queryKey: [QUERY_KEY, session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_archived', false)
        .order('sort_order')

      if (error) throw error
      return data as Category[]
    },
    enabled: !!session,
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (values: Pick<Category, 'name' | 'color' | 'icon' | 'budget_limit'>) => {
      const { error } = await supabase.from('categories').insert({
        ...values,
        user_id: session!.user.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category added')
    },
    onError: () => toast.error('Failed to add category'),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Category> & { id: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category updated')
    },
    onError: () => toast.error('Failed to update category'),
  })
}

// Archive instead of delete to preserve historical expense data
export function useArchiveCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category archived')
    },
    onError: () => toast.error('Failed to archive category'),
  })
}

export function useUnarchiveCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category restored')
    },
    onError: () => toast.error('Failed to restore category'),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Cannot delete — category has expenses'),
  })
}

export function useCategoryHasExpenses(categoryId: string) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['category-has-expenses', categoryId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId)
      if (error) throw error
      return (count ?? 0) > 0
    },
    enabled: !!session && !!categoryId,
  })
}

export function useAllCategories() {
  const { session } = useAuth()

  return useQuery({
    queryKey: [QUERY_KEY, 'all', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      if (error) throw error
      return data as Category[]
    },
    enabled: !!session,
  })
}
