// Auto-generated Supabase types placeholder.
// After setting up your Supabase project, replace this with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          theme: string
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          theme?: string
          created_at?: string
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          theme?: string
        }
      }
      categories: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          budget_limit?: number | null
          sort_order?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          icon?: string | null
          budget_limit?: number | null
          sort_order?: number
          is_archived?: boolean
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          description: string | null
          expense_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          description?: string | null
          expense_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          amount?: number
          description?: string | null
          expense_date?: string
          updated_at?: string
        }
      }
      monthly_snapshots: {
        Row: {
          id: string
          user_id: string
          category_id: string
          year: number
          month: number
          total_amount: number
          budget_limit: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          year: number
          month: number
          total_amount?: number
          budget_limit?: number | null
          updated_at?: string
        }
        Update: {
          total_amount?: number
          budget_limit?: number | null
          updated_at?: string
        }
      }
    }
  }
}
