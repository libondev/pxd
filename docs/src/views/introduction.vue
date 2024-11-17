<script setup lang="ts">
import { description, name } from '../../../package.json'
</script>

<template>
  <Section :title="`${name.toUpperCase()} UI`" :description="description" />
</template>
