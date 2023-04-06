import { PlaywrightTestConfig } from '@playwright/test';

export const baseConfig: PlaywrightTestConfig = {
  retries: 3,
  maxFailures: 2,
  timeout: 120000,
};
