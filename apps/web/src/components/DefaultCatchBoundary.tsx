import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

export default function DefaultCatchBoundary({ reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertCircle className="size-10 text-base-content/40" />
      <div>
        <h1 className="font-display text-2xl font-medium">Something went wrong</h1>
        <p className="mt-2 text-sm text-base-content/60">An unexpected error occurred.</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}