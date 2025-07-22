'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { signOutAction } from '@/lib/auth/actions'
import Link from 'next/link'

export function UserNav() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">
        Welcome, {user.email}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign Out
        </Button>
      </form>
    </div>
  )
} 