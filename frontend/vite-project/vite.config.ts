/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-is', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          recharts: ['recharts'],
          ui: ['sonner', 'lucide-react', 'react-qr-code', '@yudiel/react-qr-scanner']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts'
  }
})
