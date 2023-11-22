<script setup>
import { trackPageVisibility } from '@withease/web-api';
import { createEvent, createStore } from 'effector';
import { useUnit } from 'effector-vue/composition';
import { onMounted } from 'vue';

const appStarted = createEvent();

const { visible, hidden } = trackPageVisibility({ setup: appStarted });

const $history = createStore([])
  .on(visible, (state) => [...state, { at: new Date(), action: 'visible' }])
  .on(hidden, (state) => [...state, { at: new Date(), action: 'hidden' }]);

const history = useUnit($history);

onMounted(appStarted);
</script>

<template>
  <p>Event's history:</p>

  <ul>
    <li v-for="event in history">
      {{ event.action }} at {{ event.at.toLocaleTimeString() }}
    </li>
  </ul>

  <span v-if="history.length === 0">No events yet</span>
</template>
