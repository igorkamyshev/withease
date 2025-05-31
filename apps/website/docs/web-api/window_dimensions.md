---
title: Window dimensions
---

# Window dimensions

Allows tracking window dimensions with [_Events_](https://effector.dev/en/api/effector/event/) and [_Stores_](https://effector.dev/docs/api/effector/store).

::: info

Uses [Window: resize event](https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event), [Window: scroll event](https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event), [Window: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) under the hood

:::

## Usage

All you need to do is to create an integration by calling `trackWindowDimensions` with an integration options:

- `setup`: after this [_Event_](https://effector.dev/en/api/effector/event/) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/en/api/effector/event/) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackWindowDimensions } from '@withease/web-api';

const {
  $scrollY,
  $scrollX,
  $innerWidth,
  $innerHeight,
  $outerWidth,
  $outerHeight,
  $screenLeft,
  $screenTop,
} = trackWindowDimensions({
  setup: appStarted,
});
```

Returns an object with:

- `$scrollY`: [_Store_](https://effector.dev/docs/api/effector/store) with the current scroll position on the Y-axis
- `$scrollX`: [_Store_](https://effector.dev/docs/api/effector/store) with the current scroll position on the X-axis
- `$innerWidth`: [_Store_](https://effector.dev/docs/api/effector/store) with the current width of the viewport
- `$innerHeight`: [_Store_](https://effector.dev/docs/api/effector/store) with the current height of the viewport
- `$outerWidth`: [_Store_](https://effector.dev/docs/api/effector/store) with the current width of the entire window
- `$outerHeight`: [_Store_](https://effector.dev/docs/api/effector/store) with the current height of the entire window
- `$screenLeft`: [_Store_](https://effector.dev/docs/api/effector/store) with the current left position of the screen
- `$screenTop`: [_Store_](https://effector.dev/docs/api/effector/store) with the current top position of the screen

## Live demo

Let us show you a live demo of how it works. The following demo displays a `$scrollX`, `$innerWidth`, `$innerHeight`, `$outerWidth`, `$outerHeight`, `$screenLeft`, and `$screenTop` values of the current window dimensions. _Scroll, resize, and move the window to see how it works._

<script setup lang="ts">
import demoFile from './window_dimensions.live.vue?raw';
</script>

<LiveDemo :demoFile="demoFile" />
