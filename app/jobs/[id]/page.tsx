import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Building2, MapPin, Clock, Calendar, User, Edit } from 'lucide-react'
import { getJobPostAction } from '@/lib/jobs/actions'
import { getUser } from '@/lib/auth/actions'
import Link from 'next/link'

interface JobPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JobPage({ params }: JobPageProps) {
  const resolvedParams = await params
  const [job, user] = await Promise.all([
    getJobPostAction(resolvedParams.id),
    getUser()
  ])

  if (!job) {
    notFound()
  }

  const isOwner = user && job.user_id === user.id

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
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-3">
                    {job.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>
                        Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {job.status}
                    </Badge>
                    <Badge variant={getTypeBadgeVariant(job.type)}>
                      {job.type}
                    </Badge>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/jobs/${job.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Company</h4>
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-4 h-4 mr-2" />
                    {job.company}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Job Type</h4>
                  <Badge variant={getTypeBadgeVariant(job.type)}>
                    {job.type}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Posted</h4>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {job.updated_at !== job.created_at && (
                                   <div>
                   <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                   <div className="flex items-center text-gray-700">
                     <Clock className="w-4 h-4 mr-2" />
                     {new Date(job.updated_at).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })}
                   </div>
                 </div>
               )}

               <div>
                 <h4 className="font-semibold text-gray-900 mb-2">Start Date</h4>
                 <div className="flex items-center text-gray-700">
                   <Calendar className="w-4 h-4 mr-2" />
                   {new Date(job.start_date).toLocaleDateString('en-US', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric'
                   })}
                 </div>
               </div>

               {job.end_date && (
                 <div>
                   <h4 className="font-semibold text-gray-900 mb-2">End Date</h4>
                   <div className="flex items-center text-gray-700">
                     <Calendar className="w-4 h-4 mr-2" />
                     {new Date(job.end_date).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })}
                   </div>
                 </div>
               )}
              </div>

              {!isOwner && job.status === 'Active' && (
                <>
                  <Separator />
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Interested in this position? Contact the company directly.
                    </p>
                    <Button asChild>
                      <Link href="/auth/login">
                        <User className="w-4 h-4 mr-2" />
                        Apply Now
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {isOwner && (
                <>
                  <Separator />
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      You are the owner of this job posting. You can edit or manage it from your dashboard.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: JobPageProps) {
  const resolvedParams = await params
  const job = await getJobPostAction(resolvedParams.id)
  
  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'The requested job posting could not be found.',
    }
  }

  return {
    title: `${job.title} at ${job.company}`,
    description: job.description.substring(0, 160) + '...',
  }
} 