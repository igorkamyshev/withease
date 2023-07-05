import { defineConfig } from 'vitepress';
import { createSidebar } from './sidebar_creator';

export default defineConfig({
  lang: 'en-US',
  title: 'With Ease',
  description:
    'A set of libraries and recipes to make frontend development easier thanks to Effector',
  lastUpdated: true,
  outDir: '../../../dist/apps/website',
  head: [],
  themeConfig: {
    siteTitle: 'With Ease',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Igor Kamyşev',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/igorkamyshev/withease' },
      { icon: 'twitter', link: 'https://twitter.com/EffectorJS' },
      { icon: 'discord', link: 'https://discord.gg/zU9NDR5GpM' },
    ],
    editLink: {
      pattern:
        'https://github.com/igorkamyshev/withease/edit/master/apps/website/docs/:path',
    },
    nav: [
      {
        text: 'Packages',
        items: [
          { text: 'i18next', link: '/i18next/' },
          { text: 'web-api', link: '/web-api/' },
          { text: 'factories', link: '/factories/' },
        ],
      },
      { text: 'Magazine', link: '/magazine/' },
      { text: 'Protocols', link: '/protocols/' },
      {
        text: 'More',
        items: [{ text: 'Effector', link: 'https://effector.dev' }],
      },
    ],
    sidebar: {
      ...createSidebar('i18next', [{ text: 'Get Started', link: '/i18next/' }]),
      ...createSidebar('web-api', [
        { text: 'Get Started', link: '/web-api/' },
        {
          text: 'APIs',
          items: [
            { text: 'Network status', link: '/web-api/network_status' },
            {
              text: 'Page visibility',
              link: '/web-api/page_visibility',
            },
            {
              text: 'Media query',
              link: '/web-api/media_query',
            },
            { text: 'Screen orientation', link: '/web-api/screen_orientation' },
            {
              text: 'Preferred languages',
              link: '/web-api/preferred_languages',
            },
          ],
        },
      ]),
      ...createSidebar('factories', [
        { text: 'Get Started', link: '/factories/' },
        { text: 'Motivation', link: '/factories/motivation' },
        { text: 'Important Caveats', link: '/factories/important_caveats' },
      ]),
      '/magazine/': [
        {
          text: 'Architecture',
          items: [
            {
              text: 'Global variables',
              link: '/magazine/global_variables',
            },
            {
              text: 'Explicit start of the app',
              link: '/magazine/explicit_start',
            },
            {
              text: 'Dependency injection',
              link: '/magazine/dependency_injection',
            },
          ],
        },
        {
          text: 'Effector deep dive',
          items: [
            {
              text: 'Fork API rules',
              link: '/magazine/fork_api_rules',
            },
            {
              text: '.watch calls are (not) weird',
              link: '/magazine/watch_calls',
            },
          ],
        },
        {
          text: 'Recipes',
          items: [
            {
              text: 'Events in UI-frameworks',
              link: '/magazine/handle_events_in_ui_frameworks',
            },
          ],
        },
      ],
      '/protocols/': [
        {
          text: 'Protocols',
          link: '/protocols/',
          items: [
            {
              text: 'Contract',
              link: '/protocols/contract',
            },
            {
              text: '@@unitShape',
              link: 'https://effector.dev/docs/ecosystem-development/unit-shape-protocol',
            },
            {
              text: '@@trigger',
              link: '/protocols/trigger',
            },
          ],
        },
      ],
    },
  },
});
