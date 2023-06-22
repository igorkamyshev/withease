import type { SiteConfig } from 'vitepress';

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export default {
  load() {
    console.log(config.userConfig.themeConfig.sidebar['/web-api/']);
    const apis = config.userConfig.themeConfig.sidebar['/web-api/']
      .at(0)
      .items.at(1).items;

    return apis;
  },
};
