import { defineConfig, devices } from '@playwright/test'

// The accessibility checks (npm run test:a11y). They build the site and test it in Chrome,
// once at desktop size and once at phone size.
const port = 4319

export default defineConfig({
  testDir: 'a11y',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite build && npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
})
