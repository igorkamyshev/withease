<script setup>
import { trackNetworkStatus } from '@withease/web-api';
import { createEvent } from 'effector';
import { useUnit } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const { $online, $offline } = trackNetworkStatus({ setup: appStarted });

const [online, offline] = useUnit([$online, $offline]);

onMounted(appStarted);
</script>

<template>
  <p>
    Client online: <strong>{{ online }}</strong>
  </p>
  <p>
    Client offline: <strong>{{ offline }}</strong>
  </p>
</template>
