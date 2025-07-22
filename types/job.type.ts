// Job posting types and interfaces

// Job Type Enum
export type JobType = 'Full-Time' | 'Part-Time' | 'Contract'

// Job Status Enum  
export type JobStatus = 'Active' | 'Inactive'

// Base Job Post Interface
export interface JobPost {
  id: string
  title: string
  company: string
  description: string
  location: string
  type: JobType
  status: JobStatus
  start_date: string
  end_date: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// Job Post Creation Data (without auto-generated fields)
export interface CreateJobPostData {
  title: string
  company: string
  description: string
  location: string
  type: JobType
  status: JobStatus
  start_date: string
  end_date: string | null
}

// Job Post Update Data (partial updates allowed)
export interface UpdateJobPostData {
  title?: string
  company?: string
  description?: string
  location?: string
  type?: JobType
  status?: JobStatus
  start_date?: string
  end_date?: string | null
}

// Job Post Form State
export interface JobPostFormState {
  title: string
  company: string
  description: string
  location: string
  type: JobType
  status: JobStatus
  start_date: string
  end_date: string
  errors: {
    title?: string
    company?: string
    description?: string
    location?: string
    type?: string
    status?: string
    start_date?: string
    end_date?: string
    general?: string
  }
}

// Job Post Filter Options
export interface JobPostFilters {
  type?: JobType
  status?: JobStatus
  search?: string
  company?: string
  location?: string
}

// Job Post List Response
export interface JobPostsResponse {
  data: JobPost[]
  count: number
  error?: string
}

// Paginated Job Posts Response
export interface PaginatedJobPostsResponse {
  data: JobPost[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  error?: string
}

// Pagination Parameters
export interface PaginationParams {
  page?: number
  limit?: number
}

// Job Post Filters with Pagination
export interface JobPostFiltersWithPagination extends JobPostFilters {
  page?: number
  limit?: number
}

// Job Post Action Result
export interface JobPostActionResult {
  success: boolean
  data?: JobPost
  error?: string
}

// Job Type Options for Forms
export const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Contract', label: 'Contract' },
]

// Job Status Options for Forms
export const JOB_STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
] 