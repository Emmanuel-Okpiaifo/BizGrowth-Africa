import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Inject build timestamp into built HTML so you can verify deployed build (View Source)
const buildTimestampPlugin = () => ({
  name: 'build-timestamp',
  transformIndexHtml(html) {
    const ts = new Date().toISOString()
    return html.replace(
      '</head>',
      `\n    <!-- Admin build: ${ts} -->\n  </head>`
    )
  }
})

// Write .htaccess in dist-admin so index.html is not cached (fixes "deploy but changes don't show")
const adminHtaccessPlugin = () => ({
  name: 'admin-htaccess',
  writeBundle(_, bundle) {
    const outDir = resolve(__dirname, 'dist-admin')
    const htaccess = `# Prevent caching of index.html so admin deploys show new build
<IfModule mod_headers.c>
<Files "index.html">
  Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
</Files>
</IfModule>
`
    try {
      writeFileSync(join(outDir, '.htaccess'), htaccess)
      console.log('✅ Wrote dist-admin/.htaccess (no-cache for index.html)')
    } catch (e) {
      console.warn('⚠️ Could not write .htaccess:', e.message)
    }
  }
})

// Plugin to serve index.admin.html as index.html in dev mode
const adminHtmlPlugin = () => {
  let adminHtml = null
  
  // Pre-load admin HTML
  const adminHtmlPath = resolve(__dirname, 'index.admin.html')
  if (existsSync(adminHtmlPath)) {
    try {
      adminHtml = readFileSync(adminHtmlPath, 'utf-8')
      console.log('✅ Loaded index.admin.html for dev server')
    } catch (error) {
      console.error('❌ Error reading index.admin.html:', error)
    }
  } else {
    console.warn('⚠️ index.admin.html not found at:', adminHtmlPath)
  }

  return {
    name: 'admin-html-plugin',
    configureServer(server) {
      // Intercept HTML requests
      server.middlewares.use((req, res, next) => {
        if ((req.url === '/' || req.url === '/index.html') && adminHtml) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(adminHtml)
          return
        }
        next()
      })
    },
    transformIndexHtml(html, ctx) {
      // Replace index.html content with admin HTML in dev mode
      if (ctx.server && adminHtml) {
        return adminHtml
      }
      return html
    }
  }
}

// Admin-only build configuration for subdomain
export default defineConfig({
  plugins: [react(), adminHtmlPlugin(), buildTimestampPlugin(), adminHtaccessPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist-admin',
    // Ensure all assets are included
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp'],
    rollupOptions: {
      input: './index.admin.html',
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'admin-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image'],
          'icons-vendor': ['@fortawesome/react-fontawesome', '@fortawesome/free-brands-svg-icons', '@fortawesome/free-solid-svg-icons', 'lucide-react']
        }
      }
    }
  }
})
