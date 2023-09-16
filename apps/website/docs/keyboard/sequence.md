# `keyboard.sequence`

It creates an [_Event_](https://effector.dev/docs/api/effector/event) that triggers after a user types a given sequence on a keyboard in a browser.

## Formulae

```ts
import { trackKeyboard } from '@withease/keyboard';

const keyboard = trackKeyboard(/* ... */);

const typed = keyboard.sequence('iddqd');
```

### Arguments

- `sequence`: _string_ or a [_Store_](https://effector.dev/docs/api/effector/store) with a string contains sequence of keys that should be typed by a user to trigger an [_Event_](https://effector.dev/docs/api/effector/event)

## Live demo

Let us show you a live demo of how it works. _Type "iddqd" on your keyboard to enable godmod._

<script setup lang="ts">
import demoFile from './sequence.live.vue?raw';
</script>

<LiveDemo :demoFile="demoFile" />
