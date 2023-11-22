<script setup>
import { trackScreenOrientation } from '@withease/web-api';
import { createEvent } from 'effector';
import { useUnit } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const { $type, $angle } = trackScreenOrientation({ setup: appStarted });

const [type, angle] = useUnit([$type, $angle]);

onMounted(appStarted);
</script>

<template>
  <p>
    Screen orientation type: <strong>{{ type }}</strong>
  </p>
  <p>
    Screen orientation angle: <strong>{{ angle }}</strong>
  </p>
</template>
