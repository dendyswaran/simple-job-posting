'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/actions'
import { revalidatePath } from 'next/cache'
import type { 
  JobPost, 
  JobPostActionResult,
  JobPostsResponse,
  JobPostFilters,
  PaginatedJobPostsResponse,
  JobPostFiltersWithPagination
} from '@/types/job.type'
import { redisClient, cacheKeys, cacheTTL } from '@/lib/redis/client'

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
  
  // Invalidate relevant caches
  await invalidateJobPostCache(data.id, user.id)
  
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
  
  // Invalidate relevant caches
  await invalidateJobPostCache(id, user.id)
  
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
  
  // Invalidate relevant caches
  await invalidateJobPostCache(id, user.id)
  
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

// Default pagination settings
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

// Helper function to create filter hash for caching
function createFilterHash(filters?: JobPostFilters): string {
  if (!filters) return 'none'
  return Buffer.from(JSON.stringify(filters)).toString('base64')
}

// Helper function to calculate pagination metadata
function calculatePagination(page: number, limit: number, totalItems: number) {
  const totalPages = Math.ceil(totalItems / limit)
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

// Get paginated job postings with caching
export async function getPaginatedJobPostsAction(filters?: JobPostFiltersWithPagination): Promise<PaginatedJobPostsResponse> {
  const page = Math.max(1, filters?.page || DEFAULT_PAGE)
  const limit = Math.min(MAX_LIMIT, Math.max(1, filters?.limit || DEFAULT_LIMIT))
  const offset = (page - 1) * limit
  
  // Remove pagination from filters for caching key
  const { page: _, limit: __, ...searchFilters } = filters || {}
  const filterHash = createFilterHash(searchFilters)
  
  // Try to get from cache first
  const cacheKey = cacheKeys.jobPosts(page, limit, filterHash)
  const countCacheKey = cacheKeys.jobPostsCount(filterHash)
  
  try {
    const [cachedData, cachedCount] = await Promise.all([
      redisClient.get(cacheKey),
      redisClient.get(countCacheKey)
    ])
    
    if (cachedData && cachedCount) {
      const jobs = JSON.parse(cachedData) as JobPost[]
      const totalItems = parseInt(cachedCount, 10)
      
      return {
        data: jobs,
        pagination: calculatePagination(page, limit, totalItems),
      }
    }
  } catch (error) {
    console.error('Cache retrieval error:', error)
  }

  // Fetch from database
  const supabase = await createClient()

  // Build count query
  let countQuery = supabase
    .from('job_posts')
    .select('*', { count: 'exact', head: true })

  // Build data query
  let dataQuery = supabase
    .from('job_posts')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  // Apply filters to both queries
  if (searchFilters?.status) {
    countQuery = countQuery.eq('status', searchFilters.status)
    dataQuery = dataQuery.eq('status', searchFilters.status)
  } else {
    // Default to showing only active posts for public view
    countQuery = countQuery.eq('status', 'Active')
    dataQuery = dataQuery.eq('status', 'Active')
  }

  if (searchFilters?.type) {
    countQuery = countQuery.eq('type', searchFilters.type)
    dataQuery = dataQuery.eq('type', searchFilters.type)
  }

  if (searchFilters?.company) {
    countQuery = countQuery.ilike('company', `%${searchFilters.company}%`)
    dataQuery = dataQuery.ilike('company', `%${searchFilters.company}%`)
  }

  if (searchFilters?.location) {
    countQuery = countQuery.ilike('location', `%${searchFilters.location}%`)
    dataQuery = dataQuery.ilike('location', `%${searchFilters.location}%`)
  }

  if (searchFilters?.search) {
    const searchPattern = `title.ilike.%${searchFilters.search}%,description.ilike.%${searchFilters.search}%,company.ilike.%${searchFilters.search}%`
    countQuery = countQuery.or(searchPattern)
    dataQuery = dataQuery.or(searchPattern)
  }

  try {
    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery
    ])

    if (error) {
      return { 
        data: [], 
        pagination: calculatePagination(page, limit, 0),
        error: error.message 
      }
    }

    const totalItems = count || 0
    const jobs = data as JobPost[]

    // Cache the results
    try {
      await Promise.all([
        redisClient.set(cacheKey, JSON.stringify(jobs), cacheTTL.jobPosts),
        redisClient.set(countCacheKey, totalItems.toString(), cacheTTL.jobPostsCount)
      ])
    } catch (cacheError) {
      console.error('Cache storage error:', cacheError)
    }

    return {
      data: jobs,
      pagination: calculatePagination(page, limit, totalItems),
    }
  } catch (err) {
    return { 
      data: [], 
      pagination: calculatePagination(page, limit, 0),
      error: 'Failed to fetch job postings' 
    }
  }
}

// Get user's paginated job postings with caching
export async function getPaginatedUserJobPostsAction(filters?: JobPostFiltersWithPagination): Promise<PaginatedJobPostsResponse> {
  const user = await getUser()
  if (!user) {
    return { 
      data: [], 
      pagination: calculatePagination(1, DEFAULT_LIMIT, 0),
      error: 'Authentication required' 
    }
  }

  const page = Math.max(1, filters?.page || DEFAULT_PAGE)
  const limit = Math.min(MAX_LIMIT, Math.max(1, filters?.limit || DEFAULT_LIMIT))
  const offset = (page - 1) * limit
  
  // Remove pagination from filters for caching key
  const { page: _, limit: __, ...searchFilters } = filters || {}
  const filterHash = createFilterHash(searchFilters)
  
  // Try to get from cache first
  const cacheKey = cacheKeys.userJobPosts(user.id, page, limit, filterHash)
  const countCacheKey = cacheKeys.userJobPostsCount(user.id, filterHash)
  
  try {
    const [cachedData, cachedCount] = await Promise.all([
      redisClient.get(cacheKey),
      redisClient.get(countCacheKey)
    ])
    
    if (cachedData && cachedCount) {
      const jobs = JSON.parse(cachedData) as JobPost[]
      const totalItems = parseInt(cachedCount, 10)
      
      return {
        data: jobs,
        pagination: calculatePagination(page, limit, totalItems),
      }
    }
  } catch (error) {
    console.error('Cache retrieval error:', error)
  }

  const supabase = await createClient()

  // Build count query
  let countQuery = supabase
    .from('job_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Build data query
  let dataQuery = supabase
    .from('job_posts')
    .select('*')
    .eq('user_id', user.id)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  // Apply filters to both queries
  if (searchFilters?.status) {
    countQuery = countQuery.eq('status', searchFilters.status)
    dataQuery = dataQuery.eq('status', searchFilters.status)
  }
  if (searchFilters?.type) {
    countQuery = countQuery.eq('type', searchFilters.type)
    dataQuery = dataQuery.eq('type', searchFilters.type)
  }
  if (searchFilters?.company) {
    countQuery = countQuery.ilike('company', `%${searchFilters.company}%`)
    dataQuery = dataQuery.ilike('company', `%${searchFilters.company}%`)
  }
  if (searchFilters?.location) {
    countQuery = countQuery.ilike('location', `%${searchFilters.location}%`)
    dataQuery = dataQuery.ilike('location', `%${searchFilters.location}%`)
  }
  if (searchFilters?.search) {
    const searchPattern = `title.ilike.%${searchFilters.search}%,description.ilike.%${searchFilters.search}%,company.ilike.%${searchFilters.search}%`
    countQuery = countQuery.or(searchPattern)
    dataQuery = dataQuery.or(searchPattern)
  }

  try {
    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery
    ])

    if (error) {
      return { 
        data: [], 
        pagination: calculatePagination(page, limit, 0),
        error: error.message 
      }
    }

    const totalItems = count || 0
    const jobs = data as JobPost[]

    // Cache the results
    try {
      await Promise.all([
        redisClient.set(cacheKey, JSON.stringify(jobs), cacheTTL.jobPosts),
        redisClient.set(countCacheKey, totalItems.toString(), cacheTTL.jobPostsCount)
      ])
    } catch (cacheError) {
      console.error('Cache storage error:', cacheError)
    }

    return {
      data: jobs,
      pagination: calculatePagination(page, limit, totalItems),
    }
  } catch (err) {
    return { 
      data: [], 
      pagination: calculatePagination(page, limit, 0),
      error: 'Failed to fetch your job postings' 
    }
  }
}

// Enhanced job post retrieval with caching
export async function getJobPostByIdAction(id: string): Promise<{ job: JobPost | null, error?: string }> {
  // Try cache first
  const cacheKey = cacheKeys.jobPost(id)
  try {
    const cachedJob = await redisClient.get(cacheKey)
    if (cachedJob) {
      return { job: JSON.parse(cachedJob) as JobPost }
    }
  } catch (error) {
    console.error('Cache retrieval error:', error)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { job: null, error: error.message }
  }

  const job = data as JobPost
  
  // Cache the result
  try {
    await redisClient.set(cacheKey, JSON.stringify(job), cacheTTL.jobPost)
  } catch (cacheError) {
    console.error('Cache storage error:', cacheError)
  }

  return { job }
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
  
  // Invalidate relevant caches
  await invalidateJobPostCache(id, user.id)
  
  return { success: true, data: data as JobPost }
} 

// Cache invalidation helpers
export async function invalidateJobPostCache(jobId?: string, userId?: string): Promise<void> {
  try {
    const patterns = [
      'jobs:page:*', // All job listing caches
      'jobs:count:*', // All job count caches
    ]
    
    if (userId) {
      patterns.push(`user:${userId}:jobs:*`) // User-specific caches
    }
    
    if (jobId) {
      patterns.push(`job:${jobId}`) // Specific job cache
    }

    await Promise.all(patterns.map(pattern => redisClient.invalidatePattern(pattern)))
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
} 