import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import DefaultCatchBoundary from '../components/DefaultCatchBoundary'
import NotFound from '../components/NotFound'
import Footer from '../components/Footer'
import Header from '../components/Header'

import PostHogProvider from '../integrations/posthog/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import { canonicalLink, seo } from '../lib/seo'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

// Set data-theme on <html> from localStorage before first paint to avoid FOUC.
// Defaults to 'halloween' on first visit.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t='halloween';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'sharath.ai',
        description:
          "Sharath — software engineer building AI agents, developer tools, and things that ship.",
        url: 'https://sharath.ai',
      }),
    ],
    links: [
      canonicalLink('https://sharath.ai'),
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/icon.svg',
      },
      {
        rel: 'icon',
        sizes: '256x256',
        type: 'image/png',
        href: '/icon.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '256x256',
        href: '/icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  // Entrance animation on hard page load only. React state adds the
  // `content-enter` class on mount and removes it after 400ms — the class
  // is gone before any in-app navigation can fire, so the animation can
  // never restart. View transitions handle in-app nav separately.
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoad(false), 400)
    return () => clearTimeout(t)
  }, [])
  // Smooth-scroll in-page `#` anchor links, gated by prefers-reduced-motion.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduce ? 'auto' : 'smooth'
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute('href')
      if (!hash || hash === '#') return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior, block: 'start' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <PostHogProvider>
          <Header />
          <main className={isInitialLoad ? 'content-enter' : undefined} style={{ viewTransitionName: 'main-content' }}>{children}</main>
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Footer />
        </PostHogProvider>
        <Scripts />
      </body>
    </html>
  )
}
