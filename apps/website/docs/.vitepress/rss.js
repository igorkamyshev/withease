import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { Feed } from 'feed';
import { createContentLoader } from 'vitepress';

export const rss = {
  async onBuildEnd(config) {
    const hostname = 'https://withease.pages.dev';

    const feed = new Feed({
      title: 'With Ease Magazine',
      description:
        'The collection of articles about Effector and related topics. It is not a replacement for the official documentation, but it can help you to understand some concepts better.',
      id: hostname,
      link: hostname,
      language: 'en',
      favicon: `${hostname}/favicon.ico`,
      copyright: 'Copyright (c) 2023-present, Igor Kamyşev',
    });

    const posts = await createContentLoader('/magazine/*.md', {
      excerpt: true,
      render: true,
    }).load();

    posts.sort(
      (a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    );

    for (const { url, excerpt, frontmatter, html } of posts) {
      console.log(rest);
      feed.addItem({
        title: frontmatter.title,
        id: `${hostname}${url}`,
        link: `${hostname}${url}`,
        description: excerpt,
        content: html,
        author: [],
        date: frontmatter.date,
      });
    }

    await writeFile(path.join(config.outDir, 'feed.rss'), feed.rss2());
  },
};
