import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the real stack: the built API (with MongoDB) and the built site served by
 * `vite preview`, which forwards /api to the API like Vercel does in production.
 *
 * Needs MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in the environment (CI sets them; locally they can
 * come from server/.env if you point MONGODB_URI at a throwaway database). Build first:
 *   npm --prefix server run build && npm --prefix client run build
 */
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /booking\.spec/ },
  ],
  webServer: process.env.E2E_NO_SERVERS
    ? undefined
    : [
        {
          command: 'npm --prefix ../server run seed && npm --prefix ../server start',
          url: 'http://localhost:4000/api/health',
          reuseExistingServer: !CI,
          timeout: 120_000,
        },
        {
          command: 'npm --prefix ../client run preview -- --port 4173 --strictPort',
          url: 'http://localhost:4173',
          reuseExistingServer: !CI,
          timeout: 60_000,
        },
      ],
});
