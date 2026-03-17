import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // This disables sourcemaps for the production build
    sourcemap: false,
  },
  server: {
    port: 5174,
    // This helps the dev server ignore the corrupted lucide-react maps
    sourcemapIgnoreList: (path) => path.includes('node_modules')
  }
})