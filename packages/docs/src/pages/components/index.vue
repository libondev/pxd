<script setup>
import OverviewCard from '@/components/OverviewCard.vue'
import components from '@/consts/components.json'
</script>

<template>
  <h1 class="text-2xl font-medium">
    Overview
  </h1>

  <p class="text-sm text-gray-900">
    A total of <span class="font-medium text-foreground">{{ components.length }}</span> components
  </p>

  <div class="flex flex-wrap gap-5 mt-6">
    <template v-for="{ camelized, name } in components" :key="name">
      <OverviewCard :name="camelized">
        There should be a preview here.
      </OverviewCard>
    </template>
  </div>
</template>
