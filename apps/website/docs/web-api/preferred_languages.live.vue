<script setup>
import { trackPreferredLanguages } from '@withease/web-api';
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const { $languages } = trackPreferredLanguages({ setup: appStarted });

const languages = useStore($languages);

onMounted(appStarted);
</script>

<template>
  <ol>
    <li v-for="lang in languages">{{ lang }}</li>
  </ol>
</template>
