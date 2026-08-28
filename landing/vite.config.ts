import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/clipboard-router-releases/',
  build: { outDir: 'dist/client' },
  plugins: [react()],
})
