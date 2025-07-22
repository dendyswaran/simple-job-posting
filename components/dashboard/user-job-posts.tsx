'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JobPostCard } from '@/components/jobs/job-post-card'
import { JobPostFilters } from '@/components/jobs/job-post-filters'
import { DeleteJobDialog } from '@/components/jobs/delete-job-dialog'
import { useUserJobPosts, useDebounce } from '@/hooks/use-job-posts'
import { toggleJobPostStatusAction } from '@/lib/jobs/actions'
import { Plus, Briefcase, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { JobPost, JobPostFilters as FilterType } from '@/types/job.type'

export function UserJobPosts() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterType>({})
  const debouncedFilters = useDebounce(filters, 400)
  const { jobs, loading, error, refetch } = useUserJobPosts(debouncedFilters)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleEdit = (job: JobPost) => {
    router.push(`/jobs/${job.id}/edit`)
  }

  const handleToggleStatus = async (job: JobPost) => {
    setActionLoading(job.id)
    try {
      const result = await toggleJobPostStatusAction(job.id)
      if (result.success) {
        await refetch()
      } else {
        console.error('Failed to toggle status:', result.error)
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteSuccess = async () => {
    await refetch()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Your Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Your Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 mb-4">Error loading your job postings: {error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Your Job Postings
              </CardTitle>
              <CardDescription>
                {jobs.length === 0 
                  ? 'You haven\'t created any job postings yet' 
                  : `${jobs.length} job posting${jobs.length === 1 ? '' : 's'} • ${jobs.length} shown`
                }
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/jobs/create">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Link>
            </Button>
          </div>
        </CardHeader>

        {jobs.length > 0 && (
          <CardContent>
            <div className="space-y-6">
              {/* Filters */}
              <JobPostFilters
                filters={filters}
                onFiltersChange={setFilters}
                showStatusFilter={true}
                className="border-0 shadow-none p-0"
              />

              {/* Job Listings */}
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching job postings</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="relative">
                      <JobPostCard
                        job={job}
                        showActions={true}
                        currentUserId={job.user_id}
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                      />
                      
                      {/* Delete Button */}
                      <div className="absolute top-4 right-4">
                        <DeleteJobDialog
                          job={job}
                          onSuccess={handleDeleteSuccess}
                        />
                      </div>

                      {/* Loading Overlay */}
                      {actionLoading === job.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}

        {jobs.length === 0 && (
          <CardContent>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first job posting to start finding great candidates.
              </p>
              <Button asChild size="lg">
                <Link href="/jobs/create">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Job Posting
                </Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 