<script lang="ts" setup>
import components from '@/consts/components.json'
import { useMediaQuery } from 'pxd/composables'
import { isClient } from 'pxd/utils/is'

const searchKeyword = ref('')

const containerRef = shallowRef<HTMLDivElement>()

const filteredComponents = computed(() => {
  return components.filter(({ name }) => name.includes(searchKeyword.value.toLowerCase()))
})

const bookSize = reactive({
  xs: 160,
  sm: 157,
})

const isMobile = useMediaQuery('(max-width: 768px)')

if (isClient) {
  watch([() => isMobile.value, () => containerRef.value], ([value, container]) => {
    if (!container) {
      return
    }

    bookSize.xs = value ? container.clientWidth / 2 - 10 : 160
  }, { immediate: true })
}
</script>

<template>
  <h1 class="text-2xl font-medium">
    Overview
  </h1>

  <PText secondary class="mt-2">
    A total of <span class="font-medium text-foreground">{{ components.length }}</span> components
  </PText>

  <div class="py-4 sticky top-[49.5px] z-10 bg-background border-b">
    <PInput v-model="searchKeyword" placeholder="Search components" allow-clear />
  </div>

  <div ref="containerRef" class="flex flex-wrap gap-4 mt-4 md:-mr-4">
    <template v-for="{ camelized, name } in filteredComponents" :key="name">
      <RouterLink :to="`/components/${name}`">
        <PBook :title="camelized" variant="simple" :width="bookSize">
          <template #icon>
            <PText secondary>
              There should be a preview here.
            </PText>
          </template>
        </PBook>
      </RouterLink>
    </template>
  </div>
</template>

<style lang="postcss">
.pxd-book--title {
  padding-top: 2em;
  font-size: 13cqw;
}
</style>
