import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  // Build files moved from /assets/ to /static/ once (D49): browsers that cached a 404 for an /assets/ file during
  // a deploy kept it for a year, so every file gets a fresh address. vercel.json makes them revalidate from now on.
  build: { assetsDir: 'static' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
