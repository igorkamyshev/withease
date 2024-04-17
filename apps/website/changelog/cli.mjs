import glob from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { markdown } from 'markdown';
import { resolve } from 'node:path';

const files = await promisify(glob)(
  '../../{packages,deleted_packages}/*/CHANGELOG.md',
  {
    absolute: true,
  }
);

const changelogs = await Promise.all(
  files.map((file) =>
    readFile(file, 'UTF-8')
      .then((content) => content.toString())
      .then(parseChangelog)
  )
);

for (const { name, content } of changelogs) {
  const filePath = resolve('docs', name, 'CHANGELOG.md');

  await writeFile(filePath, content);
}

// --- // ---

async function parseChangelog(content) {
  const [_1, header] = markdown.parse(content);

  const name = header.at(2).replace('@withease/', '');

  return { name, content };
}
