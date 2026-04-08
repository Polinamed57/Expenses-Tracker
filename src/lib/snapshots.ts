import { supabase } from './supabase'

export async function upsertSnapshot(
  userId: string,
  categoryId: string,
  year: number,
  month: number,
) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('category_id', categoryId)
    .gte('expense_date', from)
    .lte('expense_date', to)

  if (expensesError) return

  const total = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

  const { data: category } = await supabase
    .from('categories')
    .select('budget_limit')
    .eq('id', categoryId)
    .single()

  await supabase.from('monthly_snapshots').upsert(
    {
      user_id: userId,
      category_id: categoryId,
      year,
      month,
      total_amount: total,
      budget_limit: category?.budget_limit ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,category_id,year,month' },
  )
}
