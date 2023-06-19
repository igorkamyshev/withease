import type { SiteConfig } from 'vitepress';

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export default {
  load() {
    const protocols =
      config.userConfig.themeConfig.sidebar['/protocols/'].at(0).items;

    return protocols;
  },
};
