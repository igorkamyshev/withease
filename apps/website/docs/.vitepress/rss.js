import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { Feed } from 'feed';
import { createContentLoader } from 'vitepress';
import { compareAsc } from 'date-fns';

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

    const pages = await createContentLoader('/magazine/*.md', {
      excerpt: true,
      render: true,
    }).load();

    const posts = pages.filter((page) => page.frontmatter.rss ?? true);

    posts.sort((a, b) => compareAsc(b.frontmatter.date, a.frontmatter.date));

    for (const { url, excerpt, frontmatter, html } of posts) {
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
