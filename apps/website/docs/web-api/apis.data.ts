import type { SiteConfig } from 'vitepress';

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export default {
  load() {
    return config.userConfig.themeConfig.sidebar['/web-api/'].at(0).items.at(1)
      .items;
  },
};
