import { SignInForm } from '@/components/auth/signin-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignInForm />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
} 