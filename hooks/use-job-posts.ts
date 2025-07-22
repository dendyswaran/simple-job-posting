'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JobPost, JobPostFilters, PaginatedJobPostsResponse, JobPostFiltersWithPagination } from '@/types/job.type'
import { getPaginatedJobPostsAction, getPaginatedUserJobPostsAction } from '@/lib/jobs/actions'
import { getJobPostByIdAction } from '@/lib/jobs/actions'
import { useRef } from 'react'

interface UseJobPostsReturn {
  jobs: JobPost[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useJobPosts(filters?: JobPostFilters): UseJobPostsReturn {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        // Default to showing only active posts
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

      const { data, error: queryError } = await query

      if (queryError) {
        setError(queryError.message)
      } else {
        setJobs(data as JobPost[])
      }
    } catch (err) {
      setError('Failed to fetch job postings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [filters?.status, filters?.type, filters?.company, filters?.location, filters?.search])

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  }
}

// Hook for user's own job postings
export function useUserJobPosts(filters?: JobPostFilters): UseJobPostsReturn {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPaginatedUserJobPostsAction(filters)
      if (response.error) {
        setError(response.error)
      } else {
        setJobs(response.data)
      }
    } catch (err) {
      setError('Failed to fetch your job postings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserJobs()
  }, [filters?.status, filters?.type, filters?.company, filters?.location, filters?.search])

  return {
    jobs,
    loading,
    error,
    refetch: fetchUserJobs,
  }
}

// Hook for a single job post
interface UseJobPostReturn {
  job: JobPost | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useJobPost(id: string): UseJobPostReturn {
  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJob = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const { job, error } = await getJobPostByIdAction(id)
      if (error) {
        setError(error)
      } else {
        setJob(job)
      }
    } catch (err) {
      setError('Failed to fetch job posting')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJob()
  }, [id])

  return {
    job,
    loading,
    error,
    refetch: fetchJob,
  }
}

// Debounce hook for any value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const handler = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (handler.current) clearTimeout(handler.current)
    handler.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      if (handler.current) clearTimeout(handler.current)
    }
  }, [value, delay])

  return debouncedValue
}

interface UsePaginatedJobPostsReturn {
  jobs: JobPost[]
  pagination: PaginatedJobPostsResponse['pagination'] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Hook for paginated job posts with filters
export function usePaginatedJobPosts(filters?: JobPostFiltersWithPagination): UsePaginatedJobPostsReturn {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [pagination, setPagination] = useState<PaginatedJobPostsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPaginatedJobPostsAction(filters)
      if (response.error) {
        setError(response.error)
        setJobs([])
        setPagination(null)
      } else {
        setJobs(response.data)
        setPagination(response.pagination)
      }
    } catch (err) {
      setError('Failed to fetch job postings')
      setJobs([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [filters?.status, filters?.type, filters?.company, filters?.location, filters?.search, filters?.page, filters?.limit])

  return {
    jobs,
    pagination,
    loading,
    error,
    refetch: fetchJobs,
  }
}

// Hook for paginated user job posts with filters
export function usePaginatedUserJobPosts(filters?: JobPostFiltersWithPagination): UsePaginatedJobPostsReturn {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [pagination, setPagination] = useState<PaginatedJobPostsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPaginatedUserJobPostsAction(filters)
      if (response.error) {
        setError(response.error)
        setJobs([])
        setPagination(null)
      } else {
        setJobs(response.data)
        setPagination(response.pagination)
      }
    } catch (err) {
      setError('Failed to fetch your job postings')
      setJobs([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserJobs()
  }, [filters?.status, filters?.type, filters?.company, filters?.location, filters?.search, filters?.page, filters?.limit])

  return {
    jobs,
    pagination,
    loading,
    error,
    refetch: fetchUserJobs,
  }
} 