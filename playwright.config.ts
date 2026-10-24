import { defineConfig, devices } from '@playwright/test'

// One smoke test of the full quiz flow against the production build (brief §10).
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 0,
  // Each browser draws the 3D scenes in software here; more parallel browsers starve each other and time out.
  workers: 4,
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  // Chromium on phone and desktop, plus WebKit as iPhone Safari and desktop Safari (D50). Firefox is opt-in
  // (E2E_FIREFOX=1): Playwright's Firefox 157 build doesn't start on the Windows 10 dev machine.
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 14'] } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'] } },
    ...(process.env.E2E_FIREFOX ? [{ name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } }] : []),
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
