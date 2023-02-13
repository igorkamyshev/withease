import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "With Ease",
  description:
    "A set of libraries and recipes to make frontend development easier thanks to Effector",
  lastUpdated: true,
  outDir: "../../../dist/apps/website",
  head: [],
  themeConfig: {
    siteTitle: "With Ease",
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2023-present Igor Kamyşev",
    },
    socialLinks: [],
    editLink: {
      pattern:
        "https://github.com/igorkamyshev/withease/edit/master/apps/website/docs/:path",
    },
    nav: [
      { text: "Packages", items: [{ text: "i18next", link: "/i18next/" }] },
      { text: "Magazine", link: "/magazine/" },
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
