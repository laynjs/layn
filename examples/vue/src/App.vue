<script setup lang="ts">
import Section from './Section.vue'
import { layouts } from './layouts'
</script>

<template>
  <div style="font-family: system-ui, sans-serif; padding: 24px; max-width: 940px; margin: 0 auto">
    <Section v-for="spec in layouts" :key="spec.id" :spec="spec" />
  </div>
</template>
