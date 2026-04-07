import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { Category } from '@/types/index'

// Ключ для кэша TanStack Query — по нему он знает что обновить после мутации
const QUERY_KEY = 'categories'

// Читаем все категории текущего пользователя (не архивные)
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

// Добавляем новую категорию
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
    // После успешного добавления — обновляем кэш, UI перерисуется автоматически
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

// Обновляем существующую категорию
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

// Архивируем категорию (не удаляем, чтобы старые расходы остались)
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
