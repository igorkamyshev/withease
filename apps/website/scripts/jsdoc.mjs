import glob from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import * as babelParser from '@babel/parser';
import { parse as parseComment } from 'comment-parser';
import { walk } from 'estree-walker';

const files = await promisify(glob)('../../packages/*/src/**/*.ts', {
  absolute: true,
});

const apis = new Map();

await Promise.all(
  files.map(async (file) => {
    const packageName = file.match(/packages\/([^/]+)\//)[1];

    if (!apis.has(packageName)) {
      apis.set(packageName, []);
    }

    const packageApis = apis.get(packageName);

    const content = await readFile(file, 'utf-8');

    walk(
      babelParser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'estree', 'decorators-legacy'],
      }),
      {
        enter(node) {
          if (node.type !== 'ExportNamedDeclaration') {
            return;
          }

          let kind = '';
          let name = '';
          switch (node.declaration?.type) {
            case 'TSTypeAliasDeclaration':
              name = node.declaration.id.name;
              kind = 'type';
              break;
            case 'FunctionDeclaration':
              name = node.declaration.id.name;
              kind = 'function';
              break;
            case 'VariableDeclaration':
              name = node.declaration.declarations[0].id.name;
              kind = 'variable';
              break;
          }

          const comments =
            node.leadingComments?.filter(
              (comment) => comment.type === 'CommentBlock'
            ) ?? [];

          if (!name || !kind || comments?.length === 0) {
            return;
          }

          const parsedDocs = comments
            .filter((comment) => comment.value.startsWith('*'))
            .flatMap((comment) =>
              // comment-parser requires /* */ around the comment
              parseComment('/*' + comment.value + '*/')
            );

          for (const doc of parsedDocs) {
            const privateTag = doc.tags.find((tag) => tag.tag === 'private');

            if (privateTag) {
              continue;
            }

            packageApis.push({
              kind,
              name,
              description: doc.description,
            });
          }
        },
      }
    );
  })
);

for (const [packageName, packageApis] of apis) {
  if (packageApis.length === 0) {
    continue;
  }

  const filePath = resolve('docs', packageName, 'api.md');

  const content = [
    '# APIs',
    'Full list of available APIs.',
    ...packageApis.flatMap((api) =>
      [
        `## \`${api.name}\` ${
          api.kind === 'type' ? '<Badge text="TypeScript only" />' : ''
        }`,
        ,
        api.description,
      ].filter(Boolean)
    ),
  ].join('\n\n');

  await writeFile(filePath, content);
}
