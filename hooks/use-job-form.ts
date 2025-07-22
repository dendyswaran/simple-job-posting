'use client'

import { useState, useTransition } from 'react'
import type { JobPostFormState, JobType, JobStatus, JobPostActionResult } from '@/types/job.type'

interface UseJobFormReturn {
  formState: JobPostFormState
  isPending: boolean
  updateField: (field: keyof JobPostFormState, value: string) => void
  setFormData: (data: Partial<JobPostFormState>) => void
  validateForm: () => boolean
  handleSubmit: (action: (formData: FormData) => Promise<JobPostActionResult>) => Promise<void>
  clearErrors: () => void
  resetForm: () => void
}

const initialFormState: JobPostFormState = {
  title: '',
  company: '',
  description: '',
  location: '',
  type: 'Full-Time',
  status: 'Active',
  start_date: '',
  end_date: '',
  errors: {},
}

export function useJobForm(initialData?: Partial<JobPostFormState>): UseJobFormReturn {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<JobPostFormState>({
    ...initialFormState,
    ...initialData,
    errors: {},
  })

  const updateField = (field: keyof JobPostFormState, value: string) => {
    if (field === 'errors') return

    setFormState(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }))
  }

  const setFormData = (data: Partial<JobPostFormState>) => {
    setFormState(prev => ({
      ...prev,
      ...data,
      errors: {},
    }))
  }

  const validateForm = (): boolean => {
    const errors: JobPostFormState['errors'] = {}

    // Title validation
    if (!formState.title.trim()) {
      errors.title = 'Job title is required'
    } else if (formState.title.trim().length < 3) {
      errors.title = 'Job title must be at least 3 characters long'
    } else if (formState.title.trim().length > 255) {
      errors.title = 'Job title must be less than 255 characters'
    }

    // Company validation
    if (!formState.company.trim()) {
      errors.company = 'Company name is required'
    } else if (formState.company.trim().length < 2) {
      errors.company = 'Company name must be at least 2 characters long'
    } else if (formState.company.trim().length > 255) {
      errors.company = 'Company name must be less than 255 characters'
    }

    // Description validation
    if (!formState.description.trim()) {
      errors.description = 'Job description is required'
    } else if (formState.description.trim().length < 50) {
      errors.description = 'Job description must be at least 50 characters long'
    } else if (formState.description.trim().length > 5000) {
      errors.description = 'Job description must be less than 5000 characters'
    }

    // Location validation
    if (!formState.location.trim()) {
      errors.location = 'Location is required'
    } else if (formState.location.trim().length < 2) {
      errors.location = 'Location must be at least 2 characters long'
    } else if (formState.location.trim().length > 255) {
      errors.location = 'Location must be less than 255 characters'
    }

    // Type validation
    const validTypes: JobType[] = ['Full-Time', 'Part-Time', 'Contract']
    if (!validTypes.includes(formState.type)) {
      errors.type = 'Please select a valid job type'
    }

    // Status validation
    const validStatuses: JobStatus[] = ['Active', 'Inactive']
    if (!validStatuses.includes(formState.status)) {
      errors.status = 'Please select a valid status'
    }

    // Start date validation
    if (!formState.start_date) {
      errors.start_date = 'Start date is required'
    } else {
      const startDate = new Date(formState.start_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (startDate < today) {
        errors.start_date = 'Start date cannot be in the past'
      }
    }

    // End date validation (optional)
    if (formState.end_date) {
      const endDate = new Date(formState.end_date)
      const startDate = new Date(formState.start_date)
      
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date'
      }
    }

    setFormState(prev => ({ ...prev, errors }))
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (action: (formData: FormData) => Promise<JobPostActionResult>) => {
    if (!validateForm()) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('title', formState.title.trim())
      formData.append('company', formState.company.trim())
      formData.append('description', formState.description.trim())
      formData.append('location', formState.location.trim())
      formData.append('type', formState.type)
      formData.append('status', formState.status)
      formData.append('start_date', formState.start_date)
      formData.append('end_date', formState.end_date)

      try {
        const result = await action(formData)
        if (!result.success && result.error) {
          setFormState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              general: result.error,
            },
          }))
        }
      } catch (error) {
        setFormState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            general: 'An unexpected error occurred. Please try again.',
          },
        }))
      }
    })
  }

  const clearErrors = () => {
    setFormState(prev => ({ ...prev, errors: {} }))
  }

  const resetForm = () => {
    setFormState(initialFormState)
  }

  return {
    formState,
    isPending,
    updateField,
    setFormData,
    validateForm,
    handleSubmit,
    clearErrors,
    resetForm,
  }
} 