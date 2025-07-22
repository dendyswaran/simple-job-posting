'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthActionResult = {
  success: boolean
  error?: string
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const supabase = await createClient()

  // Check if email is already registered
  const { data: existingUser, error: checkError } = await supabase
    .schema('public')
    .from('user_profiles')
    .select('email')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    // Handle specific Supabase auth errors
    if (error.message.includes('User already registered')) {
      return { success: false, error: 'An account with this email already exists' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/')
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    return null
  }
  
  return user
} 