import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      // Exclude PWA files from worker routing
      outputDir: './dist',
      external: ['__STATIC_CONTENT_MANIFEST'],
      emptyOutDir: false
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  publicDir: 'public',
  build: {
    copyPublicDir: true
  }
})
