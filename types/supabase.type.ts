export interface Database {
  public: {
    Tables: {
      job_posts: {
        Row: {
          id: string
          title: string
          company: string
          description: string
          location: string
          type: 'Full-Time' | 'Part-Time' | 'Contract'
          status: 'Active' | 'Inactive'
          start_date: string
          end_date: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          description: string
          location: string
          type: 'Full-Time' | 'Part-Time' | 'Contract'
          status: 'Active' | 'Inactive'
          start_date: string
          end_date?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          description?: string
          location?: string
          type?: 'Full-Time' | 'Part-Time' | 'Contract'
          status?: 'Active' | 'Inactive'
          start_date?: string
          end_date?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      job_type: 'Full-Time' | 'Part-Time' | 'Contract'
      job_status: 'Active' | 'Inactive'
    }
  }
} 