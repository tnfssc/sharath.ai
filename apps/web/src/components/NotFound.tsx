import { Link } from '@tanstack/react-router'

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-6xl font-medium text-base-content/30">404</p>
      <div>
        <h1 className="font-display text-2xl font-medium">Page not found</h1>
        <p className="mt-2 text-sm text-base-content/60">The page you're looking for doesn't exist.</p>
      </div>
      <Link
        to="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  )
}