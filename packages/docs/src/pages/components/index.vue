<script setup>
import OverviewCard from '@/components/OverviewCard.vue'
import { components } from '@/consts/components'
</script>

<template>
  <h1 class="text-2xl font-medium">
    Overview
  </h1>

  <div class="flex flex-wrap gap-5 mt-6">
    <template v-for="{ camelized, name } in components" :key="name">
      <OverviewCard :name="camelized">
        {{ camelized }}
      </OverviewCard>
    </template>
  </div>
</template>
