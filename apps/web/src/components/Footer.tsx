import { SocialIcons } from './social-icons'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-base-content/60">
      <div className="flex flex-col items-center gap-4">
        <SocialIcons iconClassName="size-6" />
        <p>&copy; {year} sharath.ai</p>
      </div>
    </footer>
  )
}