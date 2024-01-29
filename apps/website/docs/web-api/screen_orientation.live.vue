<script setup>
import { trackScreenOrientation } from '@withease/web-api';
import { createEvent } from 'effector';
import { useUnit } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const { $type, $angle, $portrait, $landscape } = trackScreenOrientation({
  setup: appStarted,
});

const [type, angle, portrait, landscape] = useUnit([
  $type,
  $angle,
  $portrait,
  $landscape,
]);

onMounted(appStarted);
</script>

<template>
  <p>
    Screen orientation type: <strong>{{ type }}</strong>
  </p>
  <p>
    Screen orientation angle: <strong>{{ angle }}</strong>
  </p>
  <p>
    Is device in portait orientation: <strong>{{ portrait }}</strong>
  </p>
  <p>
    Is device in landscape orientation: <strong>{{ landscape }}</strong>
  </p>
</template>
