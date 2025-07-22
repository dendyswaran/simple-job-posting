'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Clock, Edit, Eye, Calendar } from 'lucide-react'
import type { JobPost } from '@/types/job.type'

interface JobPostCardProps {
  job: JobPost
  showActions?: boolean
  currentUserId?: string
  onEdit?: (job: JobPost) => void
  onDelete?: (job: JobPost) => void
  onToggleStatus?: (job: JobPost) => void
}

export function JobPostCard({ 
  job, 
  showActions = false, 
  currentUserId, 
  onEdit, 
  onToggleStatus 
}: JobPostCardProps) {
  const isOwner = currentUserId && job.user_id === currentUserId
  const canShowActions = showActions && isOwner

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary'
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Full-Time':
        return 'default'
      case 'Part-Time':
        return 'secondary'
      case 'Contract':
        return 'outline'
      default:
        return 'default'
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link href={`/jobs/${job.id}`}>
              <h3 className="font-semibold text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center text-gray-600 mt-1 text-sm">
              <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1 text-sm">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1 text-sm">
              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                Starts {new Date(job.start_date).toLocaleDateString()}
                {job.end_date && ` - Ends ${new Date(job.end_date).toLocaleDateString()}`}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1 ml-3">
            <Badge variant={getStatusBadgeVariant(job.status)}>
              {job.status}
            </Badge>
            <Badge variant={getTypeBadgeVariant(job.type)}>
              {job.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="text-gray-700 text-sm line-clamp-3">
          {job.description.length > 150 
            ? `${job.description.substring(0, 150)}...` 
            : job.description
          }
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/jobs/${job.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Link>
            </Button>

            {canShowActions && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit?.(job)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                <Button
                  variant={job.status === 'Active' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => onToggleStatus?.(job)}
                >
                  {job.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 