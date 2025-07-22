'use client'

import { useState, useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteJobPostAction } from '@/lib/jobs/actions'
import type { JobPost } from '@/types/job.type'

interface DeleteJobDialogProps {
  job: JobPost
  onSuccess?: () => void
  children?: React.ReactNode
}

export function DeleteJobDialog({ job, onSuccess, children }: DeleteJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteJobPostAction(job.id)
        if (result.success) {
          setOpen(false)
          if (onSuccess) {
            onSuccess()
          }
        } else {
          console.error('Failed to delete job posting:', result.error)
        }
      } catch (error) {
        console.error('Error deleting job posting:', error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete the job posting <strong>&quot;{job.title}&quot;</strong> at <strong>{job.company}</strong>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. The job posting will be permanently removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : 'Delete Job Posting'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 