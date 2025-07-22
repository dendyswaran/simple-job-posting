'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthForm } from '@/hooks/use-auth-form'
import Link from 'next/link'
import { useState } from 'react'

export function SignUpForm() {
  const { 
    formState, 
    isPending, 
    updateField, 
    handleSignUp,
    clearErrors 
  } = useAuthForm()
  const [isSuccess, setIsSuccess] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    
    const result = await handleSignUp()
    if (result.success) {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a confirmation link to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Get started with your free account today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="space-y-4"
        >
          {formState.errors.general && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
              {formState.errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formState.email}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={isPending}
              className={formState.errors.email ? 'border-red-500' : ''}
            />
            {formState.errors.email && (
              <p className="text-sm text-red-500">{formState.errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formState.password}
              onChange={(e) => updateField('password', e.target.value)}
              disabled={isPending}
              className={formState.errors.password ? 'border-red-500' : ''}
            />
            {formState.errors.password && (
              <p className="text-sm text-red-500">{formState.errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Sign Up'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
} 