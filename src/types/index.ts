export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  theme: 'light' | 'dark' | 'system'
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  budget_limit: number | null
  sort_order: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  amount: number
  description: string | null
  expense_date: string
  created_at: string
  updated_at: string
}

export interface MonthlySnapshot {
  id: string
  user_id: string
  category_id: string
  year: number
  month: number
  total_amount: number
  budget_limit: number | null
  updated_at: string
}

export interface MonthlyTotal {
  category_id: string
  category_name: string
  color: string
  total: number
  budget_limit: number | null
}
