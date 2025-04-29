<script setup>
import OverviewCard from '@/components/OverviewCard.vue'
import { components } from '@/consts/components'
</script>

<template>
  <DefaultLayout>
    <h1>
      Overview
    </h1>

    <div class="flex flex-wrap gap-5">
      <template v-for="{ camelized, name } in components" :key="name">
        <OverviewCard :name="camelized">
          {{ name }}
        </OverviewCard>
      </template>
    </div>
  </DefaultLayout>
</template>
