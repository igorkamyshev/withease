<script setup>
import { trackGeolocation } from '@withease/web-api';
import { useUnit } from 'effector-vue/composition';

const geo = trackGeolocation();

const { latitude, longitude, request } = useUnit({
  latitude: geo.$latitude,
  longitude: geo.$longitude,
  request: geo.request,
});
</script>

<template>
  <p>latitude: {{ latitude }}</p>
  <p>longitude: {{ longitude }}</p>

  <button v-on:click="request">Request geolocation</button>
</template>
