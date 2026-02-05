import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path - will be overridden by GitHub Actions
  // For custom domain: use '/'
  // For github.io/repo-name: use '/repo-name/'
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
  },
})
