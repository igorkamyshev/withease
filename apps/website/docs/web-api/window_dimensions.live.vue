<script setup>
import { trackWindowDimensions } from '@withease/web-api';
import { createEvent } from 'effector';
import { useUnit } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const {
  $scrollX,
  $scrollY,
  $innerWidth,
  $innerHeight,
  $outerWidth,
  $outerHeight,
  $screenTop,
  $screenLeft,
} = trackWindowDimensions({
  setup: appStarted,
});

const {
  scrollX,
  scrollY,
  innerWidth,
  innerHeight,
  outerWidth,
  outerHeight,
  screenTop,
  screenLeft,
} = useUnit({
  $scrollX,
  $scrollY,
  $innerWidth,
  $innerHeight,
  $outerWidth,
  $outerHeight,
  $screenTop,
  $screenLeft,
});

onMounted(appStarted);
</script>

<template>
  <div class="wrapper">
    <h2>Window</h2>
    <p>
      scrollX: <strong>{{ scrollX }}</strong>
    </p>
    <p>
      scrollY: <strong>{{ scrollY }}</strong>
    </p>
    <p>
      innerWidth: <strong>{{ innerWidth }}</strong>
    </p>
    <p>
      innerHeight: <strong>{{ innerHeight }}</strong>
    </p>
    <p>
      outerWidth: <strong>{{ outerWidth }}</strong>
    </p>
    <p>
      outerHeight: <strong>{{ outerHeight }}</strong>
    </p>
    <p>
      screenLeft: <strong>{{ screenLeft }}</strong>
    </p>
    <p>
      screenTop: <strong>{{ screenTop }}</strong>
    </p>
  </div>
</template>

<style lang="css" scoped>
.wrapper {
  min-width: 150vw;
  min-height: 150vh;
}
</style>
