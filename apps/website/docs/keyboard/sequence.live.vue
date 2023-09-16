<script setup>
import { trackKeyboard } from '@withease/keyboard';
import { createEvent } from 'effector';
import { onMounted } from 'vue';

const appStarted = createEvent();

const keyboard = trackKeyboard({ setup: appStarted });

const typed = keyboard.sequence('iddqd');

typed.watch(() => alert('Godmod enabled'));

onMounted(appStarted);
</script>

<template>
  <p>Focus this frame and type "iddqd" on the keyboard to enable godmod 🪄</p>
</template>
