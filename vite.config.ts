import path from 'node:path'
import os from 'node:os'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import contentCollections from '@content-collections/vite'
// nub installs dependencies into a global virtual store (pnpm-shaped), which
// lives outside the project root. Vite's dev server only serves files under
// server.fs.allow, so the SSR/module-runner can't import deps otherwise.
const nubVirtualStore = path.join(
  process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), '.cache'),
  'nub',
  'pm',
  'virtual-store',
)

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), nubVirtualStore],
    },
  },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    contentCollections(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
