<script lang="ts" setup>
import type { ListProps, ListOptionSelected, ListEmits } from './types'
import { nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { provideListContext } from '../../contexts/list'
import { cachedOff, cachedOn } from '../../utils/event'
import { isServer } from '../../utils/is'
import { throttle } from '../../utils/throttle'
import PListItem from '../list-item/index.vue'

defineOptions({
  name: 'PList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListProps>(), {
  loop: true,
  options: () => [],
  toggleOnKeyPress: true,
})

const emits = defineEmits<ListEmits>()

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

function resolveNavigationTarget(key: string): string | undefined {
  const len = listItemKeys.length

  if (key === 'Home') {
    return listItemKeys[0]
  }

  if (key === 'End') {
    return listItemKeys[len - 1]
  }

  const dir = PREV_KEYS.includes(key) ? -1 : NEXT_KEYS.includes(key) ? 1 : undefined

  if (dir === undefined) {
    return undefined
  }

  if (!activeValue.value) {
    return dir === -1 ? listItemKeys[len - 1] : listItemKeys[0]
  }

  const index = listItemKeys.indexOf(activeValue.value)

  if (index === -1) {
    return dir === -1 ? listItemKeys[len - 1] : listItemKeys[0]
  }

  if (props.loop) {
    return listItemKeys[(index + dir + len) % len]
  }

  const nextIndex = index + dir
  return nextIndex >= 0 && nextIndex < len ? listItemKeys[nextIndex] : undefined
}

const containerKeydownThrottled = throttle(
  (ev: KeyboardEvent) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
      return
    }

    const { key } = ev

    if (key === 'Enter') {
      listItemsMap.get(activeValue.value)?.click()
      return
    }

    if (key === 'Escape' && props.closeOnPressEscape) {
      emits('escape', ev)
      return
    }

    const newActiveValue = resolveNavigationTarget(key)
    if (newActiveValue === undefined) {
      return
    }

    if (activeValue.value !== newActiveValue) {
      emits('toggle')
      activeValue.value = newActiveValue
    }

    listItemsMap.get(activeValue.value)?.scrollIntoView({ block: 'nearest' })
  },
  100,
  { edges: ['leading'] },
)

function onContainerKeydown(ev: KeyboardEvent) {
  if (!props.toggleOnKeyPress || listItemKeys.length === 0) {
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

function onOptionClick(item: ListOptionSelected, ev: MouseEvent) {
  activeValue.value = ''
  emits('select', ev, item)
}

function updateListItem() {
  cleanupListItem()

  if (!containerRef.value) {
    return
  }

  Array.from(containerRef.value.querySelectorAll<HTMLElement>(itemSelector)).forEach((el) => {
    const key = el.dataset.value!
    listItemsMap.set(key, el)
    listItemKeys.push(key)
  })
}

function cleanupListItem() {
  listItemsMap.clear()
  listItemKeys.splice(0)
}

function isNoVisibleItem() {
  return listItemsMap.size === 0
}

function setActiveValue(newValue: string = '') {
  activeValue.value = newValue
}

function setFirstAsActive() {
  setActiveValue(listItemKeys[0])
}

provideListContext({
  activeValue,
  onOptionClick,
})

onMounted(async () => {
  if (isServer()) {
    return
  }

  await nextTick()

  updateListItem()

  cachedOn(document, 'keydown', onContainerKeydown)
})

onBeforeUnmount(() => {
  cleanupListItem()

  cachedOff(document, 'keydown', onContainerKeydown)
})

defineExpose({
  setActiveValue,
  updateListItem,
  isNoVisibleItem,
  setFirstAsActive,
})
</script>

<template>
  <ul
    ref="containerRef"
    role="list"
    tabindex="-1"
    class="pxd-list m-0 p-0 p-2 max-w-full list-none overflow-auto bg-background-100 outline-none"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <slot>
      <PListItem v-for="(option, index) in options" :key="option.value ?? index" v-bind="option">
        <slot name="item" :item="option" />
      </PListItem>
    </slot>
  </ul>
</template>
