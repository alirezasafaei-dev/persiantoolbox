import fs from 'fs';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['PLAYWRIGHT_TEST_BASE_URL'] ?? 'http://localhost:3100';
const enableFirefox = !process.env['PLAYWRIGHT_SKIP_FIREFOX'];

const resolveExecutable = (envVar: string | undefined, fallbacks: string[]) => {
  if (envVar) {
    return envVar;
  }
  const found = fallbacks.find((candidate) => fs.existsSync(candidate));
  return found;
};

const chromiumPath = resolveExecutable(process.env['PLAYWRIGHT_CHROMIUM_PATH'], [
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]);
const firefoxPath = resolveExecutable(process.env['PLAYWRIGHT_FIREFOX_PATH'], ['/usr/bin/firefox']);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : 2,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env['PLAYWRIGHT_DISABLE_VIDEO'] ? 'off' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
      },
    },
    ...(enableFirefox
      ? [
          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
              ...(firefoxPath ? { launchOptions: { executablePath: firefoxPath } } : {}),
            },
          },
        ]
      : []),
  ],
  webServer: {
    command:
      'NEXT_PUBLIC_ANALYTICS_ID=playwright-e2e pnpm exec next dev --webpack --hostname localhost --port 3100',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
