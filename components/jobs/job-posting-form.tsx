'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LexicalEditor } from '@/components/ui/lexical-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useJobForm } from '@/hooks/use-job-form'
import { createJobPostAction, updateJobPostAction } from '@/lib/jobs/actions'
import type { JobPost } from '@/types/job.type'
import { JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS } from '@/types/job.type'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface JobPostingFormProps {
  job?: JobPost
  onSuccess?: () => void
}

export function JobPostingForm({ job, onSuccess }: JobPostingFormProps) {
  const router = useRouter()
  const isEditing = Boolean(job)
  
  const { formState, isPending, updateField, setFormData, handleSubmit } = useJobForm({...job, end_date: job?.end_date || ''})

  const handleFormSubmit = async () => {
    await handleSubmit(async (formData) => {
      const result = isEditing && job
        ? await updateJobPostAction(job.id, formData)
        : await createJobPostAction(formData)
      
      if (result.success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/dashboard')
        }
      }
      
      return result
    })
  }

    // Pre-fill form for editing
    useEffect(() => {
      if (job) {
        console.log(job)
        setFormData({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          type: job.type,
          status: job.status,
          start_date: job.start_date,
          end_date: job.end_date || '',
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your job posting details'
            : 'Fill in the details to create a new job posting'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleFormSubmit()
          }}
          className="space-y-6"
        >
          {formState.errors.general && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
              {formState.errors.general}
            </div>
          )}

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Developer"
              value={formState.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={isPending}
              className={formState.errors.title ? 'border-red-500' : ''}
            />
            {formState.errors.title && (
              <p className="text-sm text-red-500">{formState.errors.title}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="e.g. Acme Corporation"
              value={formState.company}
              onChange={(e) => updateField('company', e.target.value)}
              disabled={isPending}
              className={formState.errors.company ? 'border-red-500' : ''}
            />
            {formState.errors.company && (
              <p className="text-sm text-red-500">{formState.errors.company}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g. New York, NY or Remote"
              value={formState.location}
              onChange={(e) => updateField('location', e.target.value)}
              disabled={isPending}
              className={formState.errors.location ? 'border-red-500' : ''}
            />
            {formState.errors.location && (
              <p className="text-sm text-red-500">{formState.errors.location}</p>
            )}
          </div>

          {/* Start Date and End Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <DatePicker
                date={formState.start_date ? new Date(formState.start_date) : undefined}
                onDateChange={(date) => updateField('start_date', date ? date.toISOString().split('T')[0] : '')}
                placeholder="Select start date"
                disabled={isPending}
                minDate={new Date()}
                className={formState.errors.start_date ? 'border-red-500' : ''}
              />
              {formState.errors.start_date && (
                <p className="text-sm text-red-500">{formState.errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <DatePicker
                date={formState.end_date ? new Date(formState.end_date) : undefined}
                onDateChange={(date) => updateField('end_date', date ? date.toISOString().split('T')[0] : '')}
                placeholder="Select end date"
                disabled={isPending}
                minDate={formState.start_date ? new Date(new Date(formState.start_date).getTime() + 24 * 60 * 60 * 1000) : new Date()}
                className={formState.errors.end_date ? 'border-red-500' : ''}
              />
              {formState.errors.end_date && (
                <p className="text-sm text-red-500">{formState.errors.end_date}</p>
              )}
              <p className="text-xs text-gray-500">Leave empty if the position is ongoing</p>
            </div>
          </div>

          {/* Job Type and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select
                value={formState.type}
                onValueChange={(value) => updateField('type', value)}
                disabled={isPending}
              >
                <SelectTrigger className={formState.errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formState.errors.type && (
                <p className="text-sm text-red-500">{formState.errors.type}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formState.status}
                onValueChange={(value) => updateField('status', value)}
                disabled={isPending}
              >
                <SelectTrigger className={formState.errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formState.errors.status && (
                <p className="text-sm text-red-500">{formState.errors.status}</p>
              )}
            </div>
          </div>

          {/* Job Description with AI Generation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Job Description *</Label>
            </div>
            
            <LexicalEditor
              onChange={(content) => updateField('description', content)}
              placeholder="Describe the job responsibilities, requirements, and qualifications..."
              disabled={isPending}
              error={!!formState.errors.description}
              content={formState.description}
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {formState.errors.description && (
                  <span className="text-red-500">{formState.errors.description}</span>
                )}
              </span>
              <span>
                {formState.description.length}/5000 characters
              </span>
            </div>
            
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Job Posting' : 'Create Job Posting')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 