import glob from 'glob';
import { copyFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { join } from 'node:path';

const files = await promisify(glob)('packages/*/CHANGELOG.md', {
  absolute: true,
});

await Promise.all(
  files.map(async (fileName) => {
    const packageName = fileName.split('/').at(-2);

    await copyFile(
      fileName,
      join('apps/website/docs/', packageName, 'CHANGELOG.md')
    );
  })
);
