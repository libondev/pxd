<script lang="ts" setup>
import * as icons from '@gdsicon/vue'
import { useCopyClick, useMessage } from 'pxd'
import { debounce } from 'pxd/utils/debounce'
import { uncapitalize } from 'pxd/utils/format'
import { throttle } from 'pxd/utils/throttle'

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

  const matchRegex = new RegExp(value, 'i')

  return allIcons.filter(({ name }) => matchRegex.test(name))
}

const handleSearch = debounce((value: string) => {
  window.history.replaceState(history.state, '', `${route.path}?q=${value}`)

  filteredComponents.value = getFilteredComponents(value)
}, 300)

const onIconClick = throttle(async (ev: MouseEvent) => {
  const target = (ev.target as HTMLElement).closest<HTMLElement>('.icon-item')

  if (!target) {
    return
  }

  const iconName = target.dataset.name!
  let contents = iconName

  if (copyType.value === 'import') {
    const filename = uncapitalize(iconName.replace('Icon', ''))
    const quote = quoteTypeMap[quoteType.value] || '\''
    contents = `import ${iconName} from ${quote}@gdsicon/vue/${filename}${quote}`
  } else if (copyType.value === 'element') {
    contents = `<${iconName} />`
  }

  await copyText(contents)
  useMessage.success(`Copied successful:\n${contents}`)
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
      allow-clear
      @update:model-value="handleSearch"
    />
  </div>

  <div class="mt-4 gap-4 flex">
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

  <ul class="py-4 px-0! gap-4 md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] grid grid-cols-2" @click="onIconClick">
    <li v-for="{ name, icon } of filteredComponents" :key="name" :data-name="name" class="icon-item align-center m-0! p-4 flex cursor-default list-none flex-col justify-center overflow-hidden rounded-lg border text-center select-none hover:bg-background-200 active:bg-background-hover motion-safe:transition-colors">
      <Component :is="icon" class="my-2 mx-auto" />

      <p class="m-0! pt-2 truncate text-13px text-foreground-secondary">
        {{ name }}
      </p>
    </li>
  </ul>

  <PMessage />
</template>
