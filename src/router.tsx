import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { vtState } from './lib/vt'
import { routeTree } from './routeTree.gen'

import type { ReactNode } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import TanstackQueryProvider, {
  getContext,
} from './integrations/tanstack-query/root-provider'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    // View transitions: wraps every in-app navigation in
    // document.startViewTransition(). Named elements (blog-heading,
    // post-{kind}-{slug}) morph position+size; everything else cross-fades.
    // vtState.active is set here so components can skip entrance animations
    // (framer-motion initial) that would poison the new-state snapshot.
    defaultViewTransition: {
      types: ({ fromLocation, toLocation }) => {
        vtState.active = true
        const fromIndex = fromLocation?.state?.__TSR_index ?? 0
        const toIndex = toLocation?.state?.__TSR_index ?? 0
        return toIndex >= fromIndex ? ['navigate-forward'] : ['navigate-back']
      },
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
