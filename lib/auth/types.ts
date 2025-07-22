import { User } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthUser extends User {}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
} 