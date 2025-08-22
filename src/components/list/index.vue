<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import { nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { provideListContext } from '../../contexts/list'
import { off, on } from '../../utils/events'
import { getCssUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'
import { throttle } from '../../utils/throttle'
import PListItem from '../list-item/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  loop?: boolean
  width?: string | number
  options?: ListOption[]
  keyListener?: boolean
  itemTransition?: boolean
}

defineOptions({
  name: 'PList',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    loop: true,
    options: () => [],
    keyListener: true,
    itemTransition: true,
  },
)

const emits = defineEmits<{
  toggle: []
  select: [MouseEvent, ListOptionSelected]
}>()

const activeValue = shallowRef('')
const containerRef = shallowRef<HTMLElement>()

const ITEM_CLASS = 'pxd-list-item'
const itemSelector = `.${ITEM_CLASS}:not([data-disabled="true"])`

const PREV_KEYS = ['ArrowUp', 'ArrowLeft']
const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const FUNCTION_KEYS = ['Enter', 'Tab', 'Home', 'End']
const PREVENT_DEFAULT_KEYS = [...FUNCTION_KEYS, ...PREV_KEYS, ...NEXT_KEYS]

const listItemKeys: string[] = []
const listItemsMap = new Map<string, HTMLElement>()

const containerKeydownThrottled = throttle((ev: KeyboardEvent) => {
  const { key } = ev

  if (key === 'Tab') {
    return
  }

  if (key === 'Enter') {
    listItemsMap.get(activeValue.value)?.click()
    return
  }

  let newActiveValue = ''

  if (PREV_KEYS.includes(key)) {
    if (activeValue.value) {
      const index = listItemKeys.indexOf(activeValue.value)
      if (props.loop) {
        const prevIndex = (index - 1 + listItemKeys.length) % listItemKeys.length
        newActiveValue = listItemKeys[prevIndex]
      } else if (index > 0) {
        newActiveValue = listItemKeys[index - 1]
      }
    } else {
      newActiveValue = listItemKeys.at(-1)!
    }
  } else if (NEXT_KEYS.includes(key)) {
    if (activeValue.value) {
      const index = listItemKeys.indexOf(activeValue.value)
      if (props.loop) {
        const nextIndex = (index + 1) % listItemKeys.length
        newActiveValue = listItemKeys[nextIndex]
      } else if (index < listItemKeys.length - 1) {
        newActiveValue = listItemKeys[index + 1]
      }
    } else {
      newActiveValue = listItemKeys.at(0)!
    }
  } else if (key === 'Home') {
    newActiveValue = listItemKeys.at(0)!
  } else if (key === 'End') {
    newActiveValue = listItemKeys.at(-1)!
  }

  if (activeValue.value !== newActiveValue) {
    emits('toggle')

    activeValue.value = newActiveValue
  }

  if (!activeValue.value) {
    return
  }

  listItemsMap.get(activeValue.value)?.scrollIntoView({ block: 'nearest' })
}, 100, { edges: ['leading'] })

function onContainerKeydown(ev: KeyboardEvent) {
  if (!props.keyListener || listItemKeys.length === 0) {
    return
  }

  if (PREVENT_DEFAULT_KEYS.includes(ev.key)) {
    ev.preventDefault()
  }

  ev.stopPropagation()
  containerKeydownThrottled(ev)
}

function onPointerOver(ev: PointerEvent) {
  const target = ev.target as HTMLElement
  const listItem = target.closest(`.${ITEM_CLASS}`) as HTMLElement
  const itemValue = listItem?.dataset.value

  if (!listItem || itemValue === undefined) {
    return
  }

  activeValue.value = itemValue
}

function onOptionClick(ev: MouseEvent, item: ListOptionSelected) {
  const { as, onClick, ...option } = item

  activeValue.value = ''
  emits('select', ev, option)
}

provideListContext({
  activeValue,
  onOptionClick,
})

onMounted(async () => {
  if (isServer) {
    return
  }

  await nextTick()

  Array.from(containerRef.value!.querySelectorAll<HTMLElement>(itemSelector)).forEach((el) => {
    const key = el.dataset.value!
    listItemsMap.set(key, el)
    listItemKeys.push(key)
  })

  on(document, 'keydown', onContainerKeydown)
})

onBeforeUnmount(() => {
  listItemsMap.clear()
  listItemKeys.splice(0)

  off(document, 'keydown', onContainerKeydown)
})
</script>

<template>
  <ul
    ref="containerRef"
    role="list"
    tabindex="-1"
    :data-transition="itemTransition"
    class="pxd-list group/list max-w-full"
    :style="{ width: getCssUnitValue(width) }"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <PScrollable class="max-h-68 p-2 rounded-inherit" fader-direction="vertical">
      <slot>
        <PListItem
          v-for="(option, index) in options"
          :key="option.value ?? index"
          v-bind="option"
        />
      </slot>
    </PScrollable>
  </ul>
</template>
