'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { JOB_TYPE_OPTIONS, JOB_STATUS_OPTIONS } from '@/types/job.type'
import type { JobPostFilters } from '@/types/job.type'

interface JobPostFiltersProps {
  filters: JobPostFilters
  onFiltersChange: (filters: JobPostFilters) => void
  showStatusFilter?: boolean
  className?: string
}

export function JobPostFilters({ 
  filters, 
  onFiltersChange, 
  showStatusFilter = false,
  className = ""
}: JobPostFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof JobPostFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeFilterCount = Object.entries(filters).filter(([_, value]) => 
    value && value.length > 0
  ).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`space-y-4 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs, companies..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Job Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Type</label>
          <Select
            value={filters.type || ''}
            onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {JOB_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter (only show if enabled) */}
        {showStatusFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {JOB_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Company Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Input
            placeholder="Company name"
            value={filters.company || ''}
            onChange={(e) => updateFilter('company', e.target.value)}
          />
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            placeholder="Location"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{filters.search}&quot;
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => updateFilter('search', undefined)}
                  />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filters.type}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => updateFilter('type', undefined)}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => updateFilter('status', undefined)}
                  />
                </Badge>
              )}
              {filters.company && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Company: &quot;{filters.company}&quot;
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => updateFilter('company', undefined)}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: &quot;{filters.location}&quot;
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => updateFilter('location', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 