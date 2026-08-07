<script lang="ts" setup>
import type {
  ListProps,
  ListOption,
  ListOptionEntry,
  ListOptionGroup,
  ListOptionSelected,
  ListEmits,
} from './types'
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useListNavigation } from '../../composables/use-list-navigation'
import {
  type ListContext,
  provideListContext,
  provideListNestedContext,
  useListFilterContext,
  useListNestedContext,
} from '../../contexts/list'
import { cachedOff, cachedOn } from '../../utils/event'
import { isServer } from '../../utils/is'
import PListNested from '../_internal/list-nested.vue'
import PListGroup from '../list-group/index.vue'
import PListItem from '../list-item/index.vue'

defineOptions({
  name: 'PList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListProps>(), {
  loop: true,
  options: () => [],
  toggleOnKeyPress: true,
  defaultActiveIndex: -1,
})

const emits = defineEmits<ListEmits>()

const containerRef = shallowRef<HTMLElement>()
const parentNestedContext = useListNestedContext(null)
const parentListContext = parentNestedContext?.list ?? null
const parentPanelHidden = parentNestedContext?.hidden ?? shallowRef(false)
const isRootList = !parentListContext
const rootProps = parentListContext?.props ?? props
const activeList = parentListContext?.activeList ?? shallowRef<ListContext | null>(null)
const childLists = new WeakMap<HTMLElement, ListContext>()
const listComponent = getCurrentInstance()!.type

let parentItem: HTMLElement | undefined
let listContext: ListContext

function isListOptionGroup(option: ListOptionEntry): option is ListOptionGroup {
  return option.type === 'group'
}

function resolveOptionByValue(
  value: ListOptionSelected['value'],
  options: ListOptionEntry[] = rootProps.options ?? [],
): ListOption | undefined {
  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      const matchedOption = resolveOptionByValue(value, entry.options)
      if (matchedOption) {
        return matchedOption
      }
    } else if (entry.value === value) {
      return entry
    } else if (entry.children?.length) {
      const matchedOption = resolveOptionByValue(value, entry.children)
      if (matchedOption) {
        return matchedOption
      }
    }
  }
}

function toSelectedOption(option: ListOption): ListOptionSelected {
  const { as, children, keywords, onClick, ...selectedOption } = option

  return selectedOption
}

function toListItemProps(option: ListOption): Record<string, any> {
  const { children, onClick, ...itemProps } = option

  return itemProps
}

function hasChildren(option: ListOption): boolean {
  return !!option.children?.length
}

const renderOptions = computed(() => {
  return props.options.map((entry, index) => ({
    entry,
    index,
    key: isListOptionGroup(entry) ? `group-${index}-${entry.label ?? ''}` : String(entry.value),
  }))
})

function emitRootSelect(value: ListOptionSelected['value'], ev: MouseEvent) {
  const option = resolveOptionByValue(value)

  if (option) {
    option.onClick?.(toSelectedOption(option), ev)
    emits('select', toSelectedOption(option), ev)
  }
}

const onRootSelect = parentListContext?.onRootSelect ?? emitRootSelect
const onToggle = parentListContext?.onToggle ?? (() => emits('toggle'))

function getChildList(item: HTMLElement): ListContext | undefined {
  return childLists.get(item)
}

function registerChildList(item: HTMLElement, childList: ListContext): void {
  childLists.set(item, childList)
}

function unregisterChildList(item: HTMLElement): void {
  childLists.delete(item)
}

function activate(): void {
  activeList.value = listContext
}

function activateFirst(): void {
  setFirstAsActive()
  activate()
}

function enterItem(item: HTMLElement): void {
  const childList = getChildList(item)

  if (childList) {
    childList.activateFirst()
    return
  }

  item.click()
}

function enterChild(item: HTMLElement): void {
  getChildList(item)?.activateFirst()
}

function leaveToParent(): void {
  setActiveIndex(-1)
  parentListContext?.activate()
}

function onItemSelect(value: ListOptionSelected['value'], ev: MouseEvent): void {
  const item = ev.currentTarget as HTMLElement | null
  const childList = item ? getChildList(item) : undefined

  if (childList) {
    childList.activateFirst()
    return
  }

  onRootSelect(value, ev)
}

const {
  activeIndex,
  isEmpty,
  onKeydown,
  setActiveIndex,
  registerItem,
  unregisterItem,
  onPointerOver,
  refreshItems,
  setFirstAsActive,
} = useListNavigation(containerRef, {
  loop: rootProps.loop,
  itemSelector: `[data-list-item]:not([data-disabled="true"],[hidden])`,
  itemFilter: (item, container) =>
    item.closest<HTMLElement>('[data-list-container]') === container && !item.closest('[hidden]'),
  toggleOnKeyPress: rootProps.toggleOnKeyPress,
  defaultActiveIndex: isRootList ? rootProps.defaultActiveIndex : -1,
  onToggle,
  onEnter: enterItem,
  onLeft: parentListContext ? leaveToParent : undefined,
  onRight: enterChild,
  onActivate: activate,
})

const filterCtx = useListFilterContext(null)

if (filterCtx) {
  watch(
    () => filterCtx.searchValue.value.trim(),
    async () => {
      await refreshItems()
      setFirstAsActive()
    },
  )
}

listContext = {
  props: rootProps,
  activeIndex,
  setActiveIndex,
  registerItem,
  unregisterItem,
  onItemSelect,
  onRootSelect,
  onToggle,
  activeList,
  activate,
  activateFirst,
  onKeydown,
  registerChildList,
  unregisterChildList,
  getChildList,
}

if (isRootList) {
  activeList.value = listContext

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        cachedOff(document, 'keydown', onRootKeydown)
        cachedOn(document, 'keydown', onRootKeydown)
      } else {
        activeList.value?.setActiveIndex(-1)
        activeList.value = listContext
        setActiveIndex(-1)
        cachedOff(document, 'keydown', onRootKeydown)
      }
    },
  )
}

provideListContext(listContext)
provideListNestedContext({ list: listContext, hidden: parentPanelHidden })

function onRootKeydown(ev: KeyboardEvent): void {
  activeList.value?.onKeydown(ev)
}

onMounted(async () => {
  if (parentListContext) {
    parentItem =
      parentNestedContext?.parentItem?.value ??
      containerRef.value?.closest<HTMLElement>('[data-list-item]') ??
      undefined
    if (parentItem) {
      parentListContext.registerChildList(parentItem, listContext)
    }
    return
  }

  if (isServer()) {
    return
  }

  cachedOn(document, 'keydown', onRootKeydown)
})

onBeforeUnmount(() => {
  if (parentItem && parentListContext) {
    parentListContext.unregisterChildList(parentItem)
  }

  if (isRootList) {
    cachedOff(document, 'keydown', onRootKeydown)
  }
})

defineExpose({
  isEmpty,
  refreshItems,
  setActiveIndex,
  setFirstAsActive,
})
</script>

<template>
  <ul
    ref="containerRef"
    role="list"
    tabindex="-1"
    data-list-container
    class="pxd-list m-0 p-2 max-w-full list-none overflow-auto bg-background-100 outline-none"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <template v-for="option in renderOptions" :key="option.key">
      <PListGroup v-if="isListOptionGroup(option.entry)" :label="option.entry.label">
        <template v-if="$slots.group" #label>
          <slot name="group" :group="option.entry" :index="option.index" />
        </template>

        <PListItem
          v-for="(item, itemIndex) in option.entry.options"
          :key="itemIndex"
          :has-children="hasChildren(item)"
          v-bind="toListItemProps(item)"
        >
          <template v-if="$slots.item">
            <slot
              name="item"
              :item="item"
              :index="itemIndex"
              :group="option.entry"
              :group-index="option.index"
            />
          </template>

          <template v-if="hasChildren(item)" #children>
            <PListNested
              :component="listComponent"
              :options="item.children ?? []"
              :slots="$slots"
              class="pxd-list--nested min-w-48 max-w-80 shadow-lg fixed z-50 max-h-[min(80dvh,800px)] rounded-lg border"
              @click.stop
            />
          </template>
        </PListItem>
      </PListGroup>

      <PListItem
        v-else
        :has-children="hasChildren(option.entry)"
        v-bind="toListItemProps(option.entry)"
      >
        <template v-if="$slots.item">
          <slot name="item" :item="option.entry" :index="option.index" />
        </template>

        <template v-if="hasChildren(option.entry)" #children>
          <PListNested
            :component="listComponent"
            :options="option.entry.children ?? []"
            :slots="$slots"
            class="pxd-list--nested min-w-48 max-w-80 shadow-lg fixed z-50 max-h-[min(80dvh,800px)] rounded-lg border"
            @click.stop
          />
        </template>
      </PListItem>
    </template>

    <p
      v-if="empty"
      role="presentation"
      class="py-7.5 text-sm text-center text-foreground-secondary"
    >
      <slot name="empty" />
    </p>
  </ul>
</template>
