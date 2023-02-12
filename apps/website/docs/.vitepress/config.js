import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "With Ease",
  description: "...",
  lastUpdated: true,
  outDir: "../../../dist/apps/website",
  head: [],
  themeConfig: {
    siteTitle: "With Ease",
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2022-present Igor Kamyşev",
    },
    socialLinks: [],
    editLink: {
      pattern:
        "https://github.com/igorkamyshev/withease/edit/master/apps/website/docs/:path",
    },
    nav: [
      {
        text: "More",
        items: [
          {
            text: "Statements",
            link: "/statements/",
          },
          { text: "Effector", link: "https://effector.dev" },
        ],
      },
    ],
    sidebar: {},
  },
});
