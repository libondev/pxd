<script lang="ts" setup>
import * as icons from '@gdsicon/vue'
import { useCopyClick, useMessage } from 'pxd'
import { uncapitalize } from 'pxd/utils/format'
import { throttle } from 'pxd/utils/throttle'

const iconCount = Object.keys(icons).length
const allIcons = Object.entries(icons).map(([name, icon]) => ({ name, icon }))

const route = useRoute()
const { copyText } = useCopyClick()

const copyType = ref<'name' | 'import'>('import')
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

const onIconClick = throttle(async (ev: MouseEvent) => {
  const target = (ev.target as HTMLElement).closest<HTMLElement>('.icon-item')

  if (!target) {
    return
  }

  const iconName = target.dataset.name!
  let contents = iconName

  if (copyType.value === 'import') {
    const filename = uncapitalize(iconName.replace('Icon', ''))
    contents = `import ${iconName} from '@gdsicon/vue/${filename}'`
  }

  await copyText(contents)
  useMessage(`Copied successful`, { type: 'success' })
}, 300)
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

    <div class="mt-4 flex justify-end">
      <PSwitchGroup v-model="copyType">
        <PSwitch label="Only name" value="name" />
        <PSwitch label="Full import" value="import" />
      </PSwitchGroup>
    </div>

    <ul class="py-4 !px-0 gap-4 md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] grid grid-cols-2" @click="onIconClick">
      <li v-for="{ name, icon } of filteredComponents" :key="name" :data-name="name" class="icon-item align-center !m-0 p-4 flex cursor-default list-none flex-col justify-center overflow-hidden rounded-lg border text-center select-none hover:bg-background-200 active:bg-background-hover motion-safe:transition-colors">
        <Component :is="icon" class="my-2 mx-auto" />

        <p class="!m-0 pt-2 truncate text-[13px] text-foreground-secondary">
          {{ name }}
        </p>
      </li>
    </ul>

    <PMessage />
  </div>
</template>
