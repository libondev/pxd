<script lang="ts" setup>
import fuzzySort from 'fuzzysort'
import { debounce } from 'pxd/utils/timing'
import { useRoute } from 'vue-router'
import allComponents from '@/consts/components.json'
import { shallowRef } from 'vue'

const route = useRoute()
const searchKeyword = shallowRef(route.query.q as string)

const filteredComponents = shallowRef(getFilteredComponents(searchKeyword.value))

function getFilteredComponents(value: string) {
  if (!value) {
    return allComponents
  }

  const results = fuzzySort.go(value, allComponents, { key: 'name' })

  return results.map((result) => result.obj)
}

const handleSearch = debounce((value: string) => {
  window.history.replaceState(history.state, '', `${route.path}?q=${value}`)

  filteredComponents.value = getFilteredComponents(value)
}, 300)

function onTriggerTargetClick(ev: KeyboardEvent) {
  const target = ev.target as HTMLElement

  if (!target) {
    return
  }

  target.click()
}
</script>

<template>
  <h1 class="text-2xl font-medium">Overview</h1>

  <PText secondary class="mt-2">
    A total of
    <span class="font-medium text-foreground">{{ allComponents.length }}</span> components
  </PText>

  <div class="pt-4 pb-2 z-10 bg-background-100">
    <PInput
      v-model="searchKeyword"
      placeholder="Search components"
      clearable
      @input="handleSearch"
    />
  </div>

  <Grids :data="filteredComponents" data-key="name">
    <template #default="{ item }">
      <RouterLink
        :to="`/components/${item.name}`"
        class="pxd-link-button h-28 relative flex w-full cursor-pointer flex-col overflow-hidden self-focus-ring outline-none hover:bg-background-hover focus-visible:z-10 active:bg-background-active motion-safe:transition-colors"
        @keydown.space.prevent="onTriggerTargetClick"
      >
        <div class="px-4 py-3 text-sm truncate">
          {{ item.camelized }}
        </div>
      </RouterLink>
    </template>
  </Grids>

  <template v-if="filteredComponents.length === 0">
    <PEmptyState title="No data" description="No components found" />
  </template>
</template>
