import { notFound, redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/header'
import { getJobPostAction } from '@/lib/jobs/actions'
import { getUser } from '@/lib/auth/actions'

// Dynamically import JobPostingForm for better performance
const JobPostingForm = dynamic(
  () => import('@/components/jobs/job-posting-form').then(mod => ({ default: mod.JobPostingForm })),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

interface EditJobPageProps {
  params: Promise<{
    id: string
  }>
}


export default async function EditJobPage({ params }: EditJobPageProps) {
  // Await params to resolve the Promise
  const resolvedParams = await params
  const [job, user] = await Promise.all([
    getJobPostAction(resolvedParams.id),
    getUser()
  ])

  if (!user) {
    redirect('/auth/login')
  }

  if (!job) {
    notFound()
  }

  // Ensure user can only edit their own job postings
  if (job.user_id !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Job Posting
            </h1>
            <p className="text-gray-600">
              Update your job posting details and requirements.
            </p>
          </div>

          <JobPostingForm job={job} />
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: EditJobPageProps) {
  // Await params to resolve the Promise
  const resolvedParams = await params
  const job = await getJobPostAction(resolvedParams.id)
  
  if (!job) {
    return {
      title: 'Edit Job - Not Found',
      description: 'The requested job posting could not be found.',
    }
  }

  return {
    title: `Edit: ${job.title} at ${job.company}`,
    description: `Edit job posting: ${job.title}`,
  }
} 