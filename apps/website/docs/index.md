---
layout: home

markdownStyles: false

hero:
  name: Effector
  text: with ease
  tagline: A set of libraries and recipes to make frontend development easier thanks to Effector
  image:
    src: /logo.svg
    alt: With Ease
  actions:
    - theme: brand
      text: Magazine
      link: /magazine/
    - theme: alt
      text: View on GitHub
      link: https://github.com/igorkamyshev/withease

features:
  - icon: 🌐
    title: i18next
    details: A powerful internationalization framework based on i18next
    link: /i18next/
    linkText: Get Started
  - icon: 🪝
    title: redux
    details: Minimalistic package to allow simpler migration from Redux to Effector
    link: /redux/
    linkText: Get Started
  - icon: 👩🏽‍💻
    title: web-api
    details: Web API bindings — network status, tab visibility, and more
    link: /web-api/
    linkText: Get Started
  - icon: 📄
    title: contracts
    details: Extremely small library to validate data from external sources
    link: /contracts/
    linkText: Get Started
  - icon: 👩‍🏭
    title: factories
    details: Set of helpers to create factories in your application
    link: /factories/
    linkText: Get Started
---

<script setup>
  import VPHero from 'vitepress/dist/client/theme-default/components/VPHero.vue'
  import VPFeatures from 'vitepress/dist/client/theme-default/components/VPFeatures.vue'

  import { ecosystem } from './ecosystem.ts'

  const actions = [
    {
      theme: 'alt',
      text: 'Principles',
      link: '/statements/ecosystem/'
    },
  ]
</script>

<VPHero
  name="Effector's"
  text="ecosystem"
  tagline="Apart from With Ease, there are other libs that can help you to build an app with Effector. There is a list of the most stable and useful ones."
  :actions="actions"
/>
<VPFeatures :features="ecosystem" />
