<script setup>
import { trackMediaQuery } from '@withease/web-api';
import { createEvent } from 'effector';
import { useUnit } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const mq = trackMediaQuery('(max-width: 320px)', {
  setup: appStarted,
});

const matchesSmall = useUnit(mq.$matches);

onMounted(appStarted);
</script>

<template>
  <p v-if="matchesSmall">Query matches small viewport</p>
  <p v-else>Query matches normal viewport</p>
</template>
