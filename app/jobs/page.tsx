'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { JobPostCard } from '@/components/jobs/job-post-card'
import { JobPostFilters } from '@/components/jobs/job-post-filters'
import { Button } from '@/components/ui/button'
import { useJobPosts, useDebounce } from '@/hooks/use-job-posts'
import { useAuth } from '@/hooks/use-auth'
import { Plus, Briefcase } from 'lucide-react'
import Link from 'next/link'
import type { JobPostFilters as FilterType } from '@/types/job.type'

export default function JobsPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<FilterType>({})
  const debouncedFilters = useDebounce(filters, 400)
  const { jobs, loading, error } = useJobPosts(debouncedFilters)

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Skeleton */}
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            {/* Jobs Skeleton */}
            <div className="lg:col-span-3">
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading job postings: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Briefcase className="w-8 h-8 mr-3" />
              Job Postings
            </h1>
            <p className="text-gray-600 mt-1">
              {jobs.length === 0 
                ? 'No job postings found' 
                : `${jobs.length} job${jobs.length === 1 ? '' : 's'} available`
              }
            </p>
          </div>

          {user && (
            <Button asChild>
              <Link href="/jobs/create">
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Link>
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobPostFilters
              filters={filters}
              onFiltersChange={setFilters}
              className="sticky top-4"
            />
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  {Object.keys(filters).length > 0
                    ? 'Try adjusting your filters to see more results.'
                    : 'There are no active job postings at the moment.'}
                </p>
                {user && (
                  <Button asChild>
                    <Link href="/jobs/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Post the First Job
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <JobPostCard
                    key={job.id}
                    job={job}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 