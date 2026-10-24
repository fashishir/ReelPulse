import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Facebook scrape functions run through `npx vercel dev` (default port 3000).
 * Proxied here so `npm run dev` keeps working against the live serverless
 * endpoints.
 */
const VERCEL_DEV_TARGET = 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/rapidapi': {
        target: 'https://instagram-scraper-api2.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rapidapi/, ''),
        secure: true,
      },
      '/api/reels': {
        target: VERCEL_DEV_TARGET,
        changeOrigin: false,
      },
      '/api/refresh': {
        target: VERCEL_DEV_TARGET,
        changeOrigin: false,
      },
    },
  },
})
