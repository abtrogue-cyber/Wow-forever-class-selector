import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Wowhead's model data has no CORS headers, so the browser must see it as same-origin.
// Dev: Vite proxies /modelviewer/* to wow.zamimg.com. Prod equivalent: a Vercel rewrite (see README).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/modelviewer': {
        target: 'https://wow.zamimg.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
