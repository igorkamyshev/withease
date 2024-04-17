import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  retries: 3,
  maxFailures: 2,
  timeout: 120000,
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'pnpm --filter web-api-demo dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
