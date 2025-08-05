<script lang="ts" setup>
import * as icons from '@gdsicon/vue'

const iconCount = Object.keys(icons).length
const allIcons = Object.entries(icons).map(([name, icon]) => ({ name, icon }))

const route = useRoute()
const searchKeyword = ref(route.query.q as string)

const filteredComponents = shallowRef(getFilteredComponents(searchKeyword.value))

function getFilteredComponents(value: string) {
  if (!value) {
    return allIcons
  }

  const matchRegex = new RegExp(value, 'i')

  return allIcons.filter(({ name }) => matchRegex.test(name))
}

function handleSearch(value: string) {
  window.history.replaceState(history.state, '', `${route.path}?q=${value}`)

  filteredComponents.value = getFilteredComponents(value)
}
</script>

<template>
  <div class="">
    <h1 class="text-2xl font-medium">
      Icons
    </h1>

    <PText secondary class="mt-2">
      A total of <span class="font-medium text-foreground">{{ iconCount }}</span> icons
    </PText>

    <div class="py-4 z-10 border-b bg-background-100">
      <PInput
        v-model="searchKeyword"
        placeholder="Search icons"
        allow-clear
        @update:model-value="handleSearch"
      />
    </div>

    <ul class="py-4 !px-0 gap-4 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]" style="">
      <li v-for="{ name, icon } of filteredComponents" :key="name" class="align-center !m-0 p-4 flex cursor-default list-none flex-col justify-center overflow-hidden rounded-lg border text-center hover:bg-background-200 active:bg-background-hover motion-safe:transition-colors">
        <component :is="icon" class="my-2 mx-auto" />

        <p class="!m-0 pt-2 text-[13px] text-foreground-secondary">
          {{ name }}
        </p>
      </li>
    </ul>
  </div>
</template>
