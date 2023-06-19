---
sidebar: false
---

# Protocols

Protocols are agreements between two or more parties on how to connect and communicate with each other. They are the foundation of the Effector's ecosystem. They allow you to connect different parts of the ecosystem with each other without direct dependencies.

Some protocols are created by the Effector's committee, and some are provided by the community. The following list contains all known protocols:

<script setup>
    import { data as protocols } from './protocols.data'
</script>

<ul>
    <li v-for="protocol in protocols"><a :href="protocol.link">{{ protocol.text }}</a></li>
</ul>
