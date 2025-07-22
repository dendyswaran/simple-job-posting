import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/header'
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

export default async function CreateJobPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/jobs/create')
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Post a New Job
            </h1>
            <p className="text-gray-600">
              Create a job posting to find the perfect candidate for your position.
            </p>
          </div>

          <JobPostingForm />
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Post a Job',
  description: 'Create a new job posting',
} 