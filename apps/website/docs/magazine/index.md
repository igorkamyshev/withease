---
sidebar: false
rss: false
---

# Magazine

The collection of articles about Effector and related topics. It is not a replacement for the [official documentation](https://effector.dev), but it can help you to understand some concepts better.

::: tip
You can read With Ease Magazine in the [RSS format](/feed.rss).
:::

<script setup>
    import { data as categories } from './articles.data'
</script>

<div v-for="category in categories">
  <h2>{{ category.text }}</h2>
  <ul>
    <li v-for="article in category.items"><a :href="article.link">{{ article.text }}</a></li>
  </ul>
</div>
