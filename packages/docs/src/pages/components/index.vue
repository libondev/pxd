<script lang="ts" setup>
import { debounce } from 'pxd/utils/debounce'
import { useRoute } from 'vue-router'
import components from '@/consts/components.json'
import OverviewCard from '../../components/OverviewCard.vue'

const route = useRoute()
const searchKeyword = ref(route.query.q as string)

const filteredComponents = shallowRef(getFilteredComponents(searchKeyword.value))

function getFilteredComponents(value: string) {
  if (!value) {
    return components
  }

  const matchRegex = new RegExp(value, 'i')

  return components.filter(({ name }) => matchRegex.test(name))
}

const handleSearch = debounce((value: string) => {
  window.history.replaceState(history.state, '', `${route.path}?q=${value}`)

  filteredComponents.value = getFilteredComponents(value)
}, 300)
</script>

<template>
  <h1 class="text-2xl font-medium">
    Overview
  </h1>

  <PText secondary class="mt-2">
    A total of <span class="font-medium text-foreground">{{ components.length }}</span> components
  </PText>

  <div class="py-4 z-10 border-b bg-background-100">
    <PInput
      v-model="searchKeyword"
      placeholder="Search components"
      allow-clear
      @update:model-value="handleSearch"
    />
  </div>

  <div class="gap-4 mt-4 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
    <template v-for="{ camelized, name } in filteredComponents" :key="name">
      <OverviewCard :name="name" :title="camelized">
        There should be a preview here.
      </OverviewCard>
    </template>
  </div>
</template>
