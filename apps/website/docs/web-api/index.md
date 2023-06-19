# web-api

Web API bindings — network status, tab visibility, and more

## Installation

First, you need to install integration:

::: code-group

```sh [pnpm]
pnpm install @withease/web-api
```

```sh [yarn]
yarn add @withease/web-api
```

```sh [npm]
npm install @withease/web-api
```

:::

## Available integrations

<script setup>
    import { data as apis } from './apis.data'
</script>

<ul>
    <li v-for="api in apis"><a :href="api.url">{{ api.frontmatter.title }}</a></li>
</ul>
