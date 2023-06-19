import type { SiteConfig } from 'vitepress';

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export default {
  load() {
    const categories = config.userConfig.themeConfig.sidebar['/magazine/'];

    return categories;
  },
};
