'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/actions'
import { revalidatePath } from 'next/cache'
import type { 
  JobPost, 
  JobPostActionResult,
  JobPostsResponse,
  JobPostFilters 
} from '@/types/job.type'

// Create a new job posting
export async function createJobPostAction(formData: FormData): Promise<JobPostActionResult> {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const title = formData.get('title') as string
  const company = formData.get('company') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as 'Full-Time' | 'Part-Time' | 'Contract'
  const status = formData.get('status') as 'Active' | 'Inactive'
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  // Validation
  if (!title || !company || !description || !location || !type || !status || !start_date) {
    return { success: false, error: 'All required fields must be filled' }
  }

  // Date validation
  const startDate = new Date(start_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (startDate < today) {
    return { success: false, error: 'Start date cannot be in the past' }
  }

  if (end_date) {
    const endDate = new Date(end_date)
    if (endDate <= startDate) {
      return { success: false, error: 'End date must be after start date' }
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_posts')
    .insert({
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      location: location.trim(),
      type,
      status,
      start_date,
      end_date: end_date || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/jobs')
  revalidatePath('/dashboard')
  
  return { success: true, data: data as JobPost }
}

// Update an existing job posting
export async function updateJobPostAction(id: string, formData: FormData): Promise<JobPostActionResult> {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const title = formData.get('title') as string
  const company = formData.get('company') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as 'Full-Time' | 'Part-Time' | 'Contract'
  const status = formData.get('status') as 'Active' | 'Inactive'
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  // Validation
  if (!title || !company || !description || !location || !type || !status || !start_date) {
    return { success: false, error: 'All required fields must be filled' }
  }

  // Date validation
  const startDate = new Date(start_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (startDate < today) {
    return { success: false, error: 'Start date cannot be in the past' }
  }

  if (end_date) {
    const endDate = new Date(end_date)
    if (endDate <= startDate) {
      return { success: false, error: 'End date must be after start date' }
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_posts')
    .update({
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      location: location.trim(),
      type,
      status,
      start_date: start_date,
      end_date: end_date || null,
    })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own posts
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/jobs')
  revalidatePath('/dashboard')
  revalidatePath(`/jobs/${id}`)
  
  return { success: true, data: data as JobPost }
}

// Delete a job posting
export async function deleteJobPostAction(id: string): Promise<JobPostActionResult> {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('job_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only delete their own posts

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/jobs')
  revalidatePath('/dashboard')
  
  return { success: true }
}

// Get a single job posting by ID
export async function getJobPostAction(id: string): Promise<JobPost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as JobPost
}

// Get a single job posting by ID (server action, returns error if not found)
export async function getJobPostByIdAction(id: string): Promise<{ job: JobPost | null, error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    return { job: null, error: error.message }
  }
  return { job: data as JobPost }
}

// Get job postings with optional filters
export async function getJobPostsAction(filters?: JobPostFilters): Promise<JobPostsResponse> {
  const supabase = await createClient()

  let query = supabase
    .from('job_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    // Default to showing only active posts for public view
    query = query.eq('status', 'Active')
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.company) {
    query = query.ilike('company', `%${filters.company}%`)
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    return { data: [], count: 0, error: error.message }
  }

  return { data: data as JobPost[], count: count || 0 }
}

// Get user's own job postings (including inactive ones)
export async function getUserJobPostsAction(): Promise<JobPostsResponse> {
  const user = await getUser()
  
  if (!user) {
    return { data: [], count: 0, error: 'Authentication required' }
  }

  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from('job_posts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], count: 0, error: error.message }
  }

  return { data: data as JobPost[], count: count || 0 }
}

// Get user's own job postings (with filters, secure server action)
export async function getUserJobPostsWithFiltersAction(filters?: JobPostFilters): Promise<JobPostsResponse> {
  const user = await getUser()
  if (!user) {
    return { data: [], count: 0, error: 'Authentication required' }
  }
  const supabase = await createClient()
  let query = supabase
    .from('job_posts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.company) {
    query = query.ilike('company', `%${filters.company}%`)
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    )
  }

  const { data, error, count } = await query
  if (error) {
    return { data: [], count: 0, error: error.message }
  }
  return { data: data as JobPost[], count: count || 0 }
}

// Toggle job posting status (Active/Inactive)
export async function toggleJobPostStatusAction(id: string): Promise<JobPostActionResult> {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const supabase = await createClient()

  // First get the current status
  const { data: currentJob, error: fetchError } = await supabase
    .from('job_posts')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !currentJob) {
    return { success: false, error: 'Job posting not found' }
  }

  // Toggle the status
  const newStatus = currentJob.status === 'Active' ? 'Inactive' : 'Active'

  const { data, error } = await supabase
    .from('job_posts')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/jobs')
  revalidatePath('/dashboard')
  revalidatePath(`/jobs/${id}`)
  
  return { success: true, data: data as JobPost }
} 