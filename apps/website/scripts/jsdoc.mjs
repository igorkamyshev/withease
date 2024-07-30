import glob from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import * as babelParser from '@babel/parser';
import { parse as parseComment } from 'comment-parser';
import { asyncWalk } from 'estree-walker';
import prettier from 'prettier';
import { groupBy } from 'lodash-es';

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

    asyncWalk(
      babelParser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'estree', 'decorators-legacy'],
      }),
      {
        async enter(node) {
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
            case 'TSDeclareFunction':
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

            const exampleTags = doc.tags.filter((tag) => tag.tag === 'example');

            let examples = await Promise.all(
              exampleTags.map((tag) =>
                prettier.format(tag.description, { parser: 'babel' })
              )
            );

            const overloadTag = doc.tags.find((tag) => tag.tag === 'overload');

            packageApis.push({
              kind,
              name,
              description: doc.description,
              examples,
              alias: overloadTag?.name,
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

  const groupedApis = groupBy(packageApis, (api) => api.name);

  const filePath = resolve('docs', packageName, 'api.md');

  const content = ['# APIs', 'Full list of available APIs.'];

  for (const [name, overloads] of Object.entries(groupedApis)) {
    const tsOnly = overloads.every((api) => api.kind === 'type');
    content.push(
      `## \`${name}\` ${tsOnly ? '<Badge text="TypeScript only" />' : ''}`
    );

    if (overloads.length === 1) {
      const [onlyOverload] = overloads;
      content.push(onlyOverload.description);
      content.push(
        ...onlyOverload.examples.map((example) => '```ts\n' + example + '\n```')
      );
    } else {
      content.push('Is has multiple overloads 👇');
      for (const overload of overloads) {
        content.push(`### \`${overload.alias ?? overload.name}\``);
        content.push(overload.description);
        content.push(
          ...overload.examples.map((example) => '```ts\n' + example + '\n```')
        );
      }
    }
  }

  await writeFile(filePath, content.join('\n\n'));
}
