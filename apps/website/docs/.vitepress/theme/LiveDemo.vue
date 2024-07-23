<script setup>
import { Sandpack } from 'sandpack-vue3';

import repositoryPackageJson from '../../../../../package.json';
import webApiRaw from '../../../../../packages/web-api/dist/web-api.js?raw';

const repositoryVersions = {
  ...repositoryPackageJson.dependencies,
  ...repositoryPackageJson.devDependencies,
};

const props = defineProps(['demoFile']);

const files = {
  '/src/App.vue': props.demoFile,
  ...localPackage({ name: 'web-api', content: webApiRaw }),
};

const customSetup = {
  dependencies: {
    effector: repositoryVersions['effector'],
    'effector-vue': repositoryVersions['effector-vue'],
  },
};

function localPackage({ name, content }) {
  return {
    [`/node_modules/@withease/${name}/package.json`]: {
      hidden: true,
      code: JSON.stringify({
        name: `@withease/${name}`,
        main: './index.js',
      }),
    },
    [`/node_modules/@withease/${name}/index.js`]: {
      hidden: true,
      code: content,
    },
  };
}
</script>

<template>
  <Sandpack
    template="vue3"
    theme="auto"
    :files="files"
    :customSetup="customSetup"
  />
</template>
