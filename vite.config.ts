import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // For GitHub Pages deployment, uncomment and update the base path
  // base: '/pdf-tailor/',
  
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: false,
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'pdf-vendor': ['pdfjs-dist', 'pdf-lib'],
        }
      }
    }
  }
})
