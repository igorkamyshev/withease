import type { PlaywrightTestConfig } from '@playwright/test';

import { baseConfig } from '../../playwright.config.base';

const config: PlaywrightTestConfig = {
  ...baseConfig,
  use: { baseURL: 'http://localhost:5173' },
};

export default config;
