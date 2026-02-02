import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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
  plugins: [react(), adminHtmlPlugin()],
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
