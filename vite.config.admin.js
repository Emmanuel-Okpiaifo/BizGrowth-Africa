import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin-only build configuration for subdomain
export default defineConfig({
  plugins: [react()],
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
