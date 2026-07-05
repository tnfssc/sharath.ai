import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="px-4">
      <nav className="mx-auto flex max-w-5xl items-center justify-between py-3">
        <Link to="/" className="text-foreground no-underline">
          <img src="/icon.svg" alt="sharath.ai" className="size-7 rounded-lg logo-invert-light" />
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}
