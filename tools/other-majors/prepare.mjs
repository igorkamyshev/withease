import { readFile, writeFile } from 'node:fs/promises';

import manifest from './manifest.json' assert { type: 'json' };

const [, , versoin] = process.argv;

const oldPackageJson = await readFile('package.json').then((file) =>
  JSON.parse(file.toString())
);

const newVersions = manifest[versoin];

if (!newVersions) {
  throw new Error(`No versions found for ${versoin}`);
}

await writeFile(
  'package.json',
  JSON.stringify(
    {
      ...oldPackageJson,
      devDependencies: applyNewVersions(
        oldPackageJson.devDependencies,
        newVersions
      ),
      dependencies: applyNewVersions(oldPackageJson.dependencies, newVersions),
    },
    null,
    2
  )
);

function applyNewVersions(deps, newVersions) {
  return Object.entries(deps).reduce((acc, [key, value]) => {
    if (newVersions[key]) {
      return { ...acc, [key]: newVersions[key] };
    }

    return { ...acc, [key]: value };
  }, {});
}
