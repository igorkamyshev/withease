# keyboard

Keyboard bindings — hot-keys, sequences, and more

## Installation

First, you need to install integration:

::: code-group

```sh [pnpm]
pnpm install @withease/keyboard
```

```sh [yarn]
yarn add @withease/keyboard
```

```sh [npm]
npm install @withease/keyboard
```

:::

## Usage

All you need to do is to create an integration by calling `trackKeyboard` with an integration options:

- `setup`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackKeyboard } from '@withease/keyboard';

const keyboard = trackKeyboard({
  setup: appStarted,
});
```

Returned object has the following properties:

<script setup>
    import { data as apis } from './apis.data'
</script>

<ul>
    <li v-for="api in apis"><a :href="api.link">{{ api.text }}</a></li>
</ul>
