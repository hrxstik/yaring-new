import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100';
const apiURL = process.env.E2E_API_URL ?? 'http://127.0.0.1:4100/api';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix ../backend run start:e2e',
      url: `${apiURL}/entities`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'cross-env NUXT_IGNORE_LOCK=1 NUXT_PUBLIC_API_URL=http://127.0.0.1:4100/api npm run dev -- --host 127.0.0.1 --port 3100',
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
