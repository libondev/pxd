<script lang="ts" setup>
import * as icons from '@gdsicon/vue'
import fuzzySort from 'fuzzysort'
import { useCopyClick, useMessage } from 'pxd'
import { debounce } from 'pxd/utils/debounce'
import { uncapitalize } from 'pxd/utils/format'
import { throttle } from 'pxd/utils/throttle'

import Grids from '@/components/Grids.vue'

const iconCount = Object.keys(icons).length
const allIcons = Object.entries(icons).map(([name, icon]) => ({ name, icon }))

const route = useRoute()
const { copyText } = useCopyClick()

type CopyType = 'name' | 'import' | 'element' | 'prefix'

const cachedCopyTypeKey = 'fe.icons.copyType'
const cachedCopyType = localStorage.getItem(cachedCopyTypeKey) || 'import'

const cachedCustomPrefixKey = 'fe.icons.customPrefix'
const cachedCustomPrefix = localStorage.getItem(cachedCustomPrefixKey) || ''

const copyType = ref<CopyType>(cachedCopyType as CopyType)
const customPrefix = ref(cachedCustomPrefix as string)

const searchKeyword = ref(route.query.q as string)
const filteredComponents = shallowRef(getFilteredComponents(searchKeyword.value))

function getFilteredComponents(value: string) {
  if (!value) {
    return allIcons
  }

  const results = fuzzySort.go(value, allIcons, { key: 'name' })

  return results.map(result => result.obj)
}

const handleSearch = debounce((value: string) => {
  window.history.replaceState(history.state, '', `${route.path}?q=${value}`)

  filteredComponents.value = getFilteredComponents(value)
}, 300)

function getCopyContents(iconName: string) {
  let contents = iconName

  if (copyType.value === 'import') {
    const filename = uncapitalize(iconName.replace('Icon', ''))
    contents = `import ${iconName} from '@gdsicon/vue/${filename}'`
  } else if (copyType.value === 'element') {
    contents = `<${iconName} />`
  } else if (copyType.value === 'prefix') {
    contents = `<${customPrefix.value}${iconName.replace('Icon', '')} />`
  }

  return contents
}

const onIconClick = throttle(async (ev: MouseEvent) => {
  const target = (ev.target as HTMLElement).closest<HTMLElement>('[data-value]')

  if (!target) {
    return
  }

  const iconName = target.dataset.value!
  const contents = getCopyContents(iconName)

  await copyText(contents)
  useMessage.success('Copied successful')
}, 300)

function handleCopyTypeChange(value: string | number) {
  localStorage.setItem(cachedCopyTypeKey, value as string)
}

function handleCustomPrefixChange(value: string) {
  localStorage.setItem(cachedCustomPrefixKey, value)
}
</script>

<template>
  <h1 class="text-2xl font-medium">
    Icons
  </h1>

  <PText secondary class="mt-2">
    A total of <span class="font-medium text-foreground">{{ iconCount }}</span> icons
  </PText>

  <div class="py-4 z-10 border-b bg-background-100">
    <PInput v-model="searchKeyword" placeholder="Search icons" clearable @update:model-value="handleSearch" />
  </div>

  <div class="my-4 gap-4 flex">
    <PSwitchGroup v-model="copyType" @update:model-value="handleCopyTypeChange">
      <PSwitch label="Import" value="import" />
      <PSwitch label="Element" value="element" />
      <PSwitch label="Name" value="name" />
      <PSwitch label="Prefix" value="prefix">
        <input
          v-model="customPrefix"
          class="w-25 h-full outline-none" placeholder="Prefix element"
          @update:model-value="handleCustomPrefixChange"
        >
      </PSwitch>
    </PSwitchGroup>
  </div>

  <Grids :data="filteredComponents" data-key="name" @click="onIconClick">
    <template #default="{ item }">
      <button
        role="button"
        class="icon-item h-28 px-4 relative w-full appearance-none font-inherit self-focus-ring outline-none hover:bg-background-200 focus-visible:z-10 focus-visible:bg-background-200 active:bg-background-hover motion-safe:transition-colors"
      >
        <Component :is="item.icon" class="my-2 mx-auto" />

        <p class="icon-name m-0! pt-2 relative truncate text-center text-13px text-foreground-secondary">
          {{ getCopyContents(item.name) }}
        </p>
      </button>
    </template>
  </Grids>

  <template v-if="filteredComponents.length === 0">
    <PEmptyState class="col-span-full" title="No data" description="No icons found" />
  </template>

  <PMessage width="175" />
</template>
