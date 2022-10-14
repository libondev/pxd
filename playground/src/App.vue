<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink tabindex="-1" to="/">Home</RouterLink> |
    <RouterLink tabindex="-1" to="/about">About</RouterLink>
  </nav>

  <RouterView />
</template>
