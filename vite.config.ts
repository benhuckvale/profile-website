import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

const rawBasePath = process.env.VITE_BASE_PATH || '/'
const basePath = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`

// Plugin to handle extra-pages
function handleExtraPages() {
  return {
    name: 'handle-extra-pages',
    // Serve extra-pages during development
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url || ''

        // Check if this is a request for an extra-page
        // Remove base path and query params
        const cleanPath = url.split('?')[0].replace(basePath, '/')

        // Check if path matches extra-pages pattern
        const match = cleanPath.match(/^\/([^/]+)\/?$/)
        if (match) {
          const pageName = match[1]
          const filePath = join(process.cwd(), 'extra-pages', pageName, 'index.html')

          if (existsSync(filePath)) {
            const content = readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'text/html')
            res.end(content)
            return
          }
        }

        next()
      })
    },
    // Copy extra-pages to dist during build
    closeBundle() {
      const src = 'extra-pages'
      const dest = 'dist'

      // Files to exclude from copying
      const excludeFiles = ['README.md', '.gitignore', '.DS_Store']

      function copyRecursive(srcPath: string, destPath: string) {
        const items = readdirSync(srcPath)

        items.forEach(item => {
          // Skip excluded files
          if (excludeFiles.includes(item) || item.startsWith('.')) {
            return
          }

          const srcItem = join(srcPath, item)
          const destItem = join(destPath, item)
          const stat = statSync(srcItem)

          if (stat.isDirectory()) {
            mkdirSync(destItem, { recursive: true })
            copyRecursive(srcItem, destItem)
          } else {
            copyFileSync(srcItem, destItem)
          }
        })
      }

      try {
        copyRecursive(src, dest)
        console.log('✓ Extra pages copied to dist/')
      } catch (err) {
        console.warn('No extra-pages directory found, skipping...')
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), handleExtraPages()],
  base: basePath,
})
