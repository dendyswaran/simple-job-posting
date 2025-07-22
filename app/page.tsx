'use client'

import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Job Posting App
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {user 
                ? `Hello ${user.email}! Manage your job postings and applications in one secure platform.`
                : 'A secure platform for managing job postings and applications. Sign up to get started.'
              }
            </p>
            
            {!user && (
              <div className="flex justify-center space-x-4">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            )}

            {user && (
              <div className="flex justify-center space-x-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            )}
          </section>

          
        </div>
      </main>
    </div>
  )
}
