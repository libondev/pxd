<script lang="ts" setup>
import * as icons from '@gdsicon/vue'
import fuzzysort from 'fuzzysort'
import { useCopyClick, useMessage } from 'pxd'
import { debounce } from 'pxd/utils/debounce'
import { uncapitalize } from 'pxd/utils/format'
import { throttle } from 'pxd/utils/throttle'

import Grids from '@/components/Grids.vue'

const iconCount = Object.keys(icons).length
const allIcons = Object.entries(icons).map(([name, icon]) => ({ name, icon }))

const route = useRoute()
const { copyText } = useCopyClick()

const copyType = ref<'name' | 'import' | 'element'>('import')
const quoteType = ref<'single' | 'double' | 'single-hight'>('single')
const searchKeyword = ref(route.query.q as string)

const filteredComponents = shallowRef(getFilteredComponents(searchKeyword.value))

const quoteTypeMap = {
  'single': '\'',
  'double': '"',
  'single-hight': '`',
}

function getFilteredComponents(value: string) {
  if (!value) {
    return allIcons
  }

  const results = fuzzysort.go(value, allIcons, { key: 'name' })

  return results.map(result => result.obj)
}

const handleSearch = debounce((value: string) => {
  window.history.replaceState(history.state, '', `${route.path}?q=${value}`)

  filteredComponents.value = getFilteredComponents(value)
}, 300)

const onIconClick = throttle(async (ev: MouseEvent) => {
  const target = (ev.target as HTMLElement).closest<HTMLElement>('[data-value]')

  if (!target) {
    return
  }

  const iconName = target.dataset.value!
  let contents = iconName

  if (copyType.value === 'import') {
    const filename = uncapitalize(iconName.replace('Icon', ''))
    const quote = quoteTypeMap[quoteType.value] || '\''
    contents = `import ${iconName} from ${quote}@gdsicon/vue/${filename}${quote}`
  } else if (copyType.value === 'element') {
    contents = `<${iconName} />`
  }

  await copyText(contents)
  useMessage.success('Copied successful')
}, 300)
</script>

<template>
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
      clearable
      @update:model-value="handleSearch"
    />
  </div>

  <div class="my-4 gap-4 flex">
    <PSwitchGroup v-model="copyType">
      <PSwitch label="Import" value="import" />
      <PSwitch label="Element" value="element" />
      <PSwitch label="Name" value="name" />
    </PSwitchGroup>
    <PSwitchGroup v-model="quoteType">
      <PSwitch label="'" value="single" />
      <PSwitch label="&quot;" value="double" />
      <PSwitch label="`" value="single-hight" />
    </PSwitchGroup>
  </div>

  <Grids :data="filteredComponents" data-key="name" @click="onIconClick">
    <template #default="{ item }">
      <button
        role="button"
        class="icon-item h-28 px-4 relative w-full appearance-none self-focus-ring outline-none hover:bg-background-200 focus-visible:z-10 focus-visible:bg-background-200 active:bg-background-hover motion-safe:transition-colors"
      >
        <Component :is="item.icon" class="my-2 mx-auto" />

        <p class="m-0! pt-2 truncate text-center text-13px text-foreground-secondary">
          {{ item.name }}
        </p>
      </button>
    </template>
  </Grids>

  <template v-if="filteredComponents.length === 0">
    <PEmptyState class="col-span-full" title="No data" description="No icons found" />
  </template>

  <PMessage width="175" />
</template>
