import { createRequire } from 'node:module';

import manifest from './manifest.json' assert { type: 'json' };

const require = createRequire(import.meta.url);

const { readJsonFile, writeJsonFile } = require('@nx/devkit');

const [, , versoin] = process.argv;

const oldPackageJson = readJsonFile('package.json');

const newVersions = manifest[versoin];

if (!newVersions) {
  throw new Error(`No versions found for ${versoin}`);
}

writeJsonFile('package.json', {
  ...oldPackageJson,
  devDependencies: applyNewVersions(
    oldPackageJson.devDependencies,
    newVersions
  ),
  dependencies: applyNewVersions(oldPackageJson.dependencies, newVersions),
});

function applyNewVersions(deps, newVersions) {
  return Object.entries(deps).reduce((acc, [key, value]) => {
    if (newVersions[key]) {
      return { ...acc, [key]: newVersions[key] };
    }

    return { ...acc, [key]: value };
  }, {});
}
