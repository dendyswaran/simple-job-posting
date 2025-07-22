'use client'

import { useState, useTransition } from 'react'
import { signUpAction, signInAction, AuthActionResult } from '@/lib/auth/actions'

interface AuthFormState {
  email: string
  password: string
  errors: {
    email?: string
    password?: string
    general?: string
  }
}

interface UseAuthFormReturn {
  formState: AuthFormState
  isPending: boolean
  updateField: (field: 'email' | 'password', value: string) => void
  validateForm: () => boolean
  handleSignUp: () => Promise<AuthActionResult>
  handleSignIn: () => Promise<AuthActionResult>
  clearErrors: () => void
}

export function useAuthForm(): UseAuthFormReturn {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<AuthFormState>({
    email: '',
    password: '',
    errors: {},
  })

  const updateField = (field: 'email' | 'password', value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }))
  }

  const validateForm = (): boolean => {
    const errors: AuthFormState['errors'] = {}

    if (!formState.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formState.password) {
      errors.password = 'Password is required'
    } else if (formState.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    setFormState(prev => ({ ...prev, errors }))
    return Object.keys(errors).length === 0
  }

  const handleSignUp = async (): Promise<AuthActionResult> => {
    if (!validateForm()) return { success: false, error: 'Please fix validation errors' }

    return new Promise((resolve) => {
      startTransition(async () => {
        const formData = new FormData()
        formData.append('email', formState.email)
        formData.append('password', formState.password)

        try {
          const result = await signUpAction(formData)
          if (!result.success && result.error) {
            setFormState(prev => ({
              ...prev,
              errors: {
                ...prev.errors,
                general: result.error,
              },
            }))
          }
          resolve(result)
        } catch (error) {
          const errorResult = { success: false, error: 'An unexpected error occurred. Please try again.' }
          setFormState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              general: errorResult.error,
            },
          }))
          resolve(errorResult)
        }
      })
    })
  }

  const handleSignIn = async (): Promise<AuthActionResult> => {
    if (!validateForm()) return { success: false, error: 'Please fix validation errors' }

    return new Promise((resolve) => {
      startTransition(async () => {
        const formData = new FormData()
        formData.append('email', formState.email)
        formData.append('password', formState.password)

        try {
          const result = await signInAction(formData)
          if (!result.success && result.error) {
            setFormState(prev => ({
              ...prev,
              errors: {
                ...prev.errors,
                general: result.error,
              },
            }))
          }
          resolve(result)
        } catch (error) {
          const errorResult = { success: false, error: 'An unexpected error occurred. Please try again.' }
          setFormState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              general: errorResult.error,
            },
          }))
          resolve(errorResult)
        }
      })
    })
  }

  const clearErrors = () => {
    setFormState(prev => ({ ...prev, errors: {} }))
  }

  return {
    formState,
    isPending,
    updateField,
    validateForm,
    handleSignUp,
    handleSignIn,
    clearErrors,
  }
} 