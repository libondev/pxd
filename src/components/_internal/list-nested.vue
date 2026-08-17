<script setup lang="ts">
import type { ListOptionEntry } from '../list/types'
import type { Component, ComponentPublicInstance, PropType, Slot, Slots } from 'vue'
import { autoUpdate, computePosition, flip, hide, offset, shift } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { provideListNestedContext, useListNestedContext } from '../../contexts/list'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'PListNested',
  inheritAttrs: false,
})

const props = defineProps({
  component: {
    type: Object as PropType<Component>,
    required: true,
  },
  options: {
    type: Array as PropType<ListOptionEntry[]>,
    required: true,
  },
  slots: {
    type: Object as PropType<Slots>,
    required: true,
  },
})

const nestedContext = useListNestedContext()!
const anchorRef = shallowRef<HTMLElement>()
const listRef = shallowRef<ComponentPublicInstance>()
const triggerItem = shallowRef<HTMLElement>()
const isReferenceHidden = shallowRef(false)
const isPanelHidden = computed(() => nestedContext.hidden.value || isReferenceHidden.value)

provideListNestedContext({
  list: nestedContext.list,
  parentItem: triggerItem,
  hidden: isPanelHidden,
})

let cleanupAutoUpdate: (() => void) | undefined

function toComponent(slot: Slot): Component {
  return slot as unknown as Component
}

function getListElement(): HTMLElement | undefined {
  const element = listRef.value?.$el
  return element instanceof HTMLElement ? element : undefined
}

function isTriggerOutsideViewport(triggerElement: HTMLElement): boolean {
  const { bottom, left, right, top } = triggerElement.getBoundingClientRect()

  return bottom <= 0 || top >= window.innerHeight || right <= 0 || left >= window.innerWidth
}

async function updatePosition(): Promise<void> {
  const listElement = getListElement()
  const triggerElement = triggerItem.value

  if (!listElement || !triggerElement) {
    return
  }

  const { x, y, middlewareData } = await computePosition(triggerElement, listElement, {
    placement: 'right-start',
    strategy: 'fixed',
    middleware: [offset(4), flip(), shift({ padding: 8 }), hide({ strategy: 'referenceHidden' })],
  })

  isReferenceHidden.value =
    !!middlewareData.hide?.referenceHidden || isTriggerOutsideViewport(triggerElement)

  Object.assign(listElement.style, {
    left: `${x}px`,
    top: `${y}px`,
  })
}

async function initializePosition(): Promise<void> {
  const triggerElement = anchorRef.value?.closest<HTMLElement>('[data-list-item]')

  if (!triggerElement) {
    return
  }

  triggerItem.value = triggerElement
  await nextTick()

  const listElement = getListElement()
  if (!listElement) {
    return
  }

  await updatePosition()
  cleanupAutoUpdate = autoUpdate(triggerElement, listElement, updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
}

onMounted(() => {
  void initializePosition()
})

onBeforeUnmount(() => {
  cleanupAutoUpdate?.()
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>

<template>
  <div ref="anchorRef" hidden>
    <PTeleport to="body">
      <Component
        v-if="triggerItem"
        ref="listRef"
        :is="component"
        v-bind="$attrs"
        :options="options"
        :aria-hidden="isPanelHidden || undefined"
        :data-reference-hidden="isPanelHidden"
        :class="{ 'pointer-events-none invisible': isPanelHidden }"
      >
        <template v-if="slots.group" #group="groupSlotProps">
          <Component :is="toComponent(slots.group)" v-bind="groupSlotProps" />
        </template>

        <template v-if="slots.item" #item="itemSlotProps">
          <Component :is="toComponent(slots.item)" v-bind="itemSlotProps" />
        </template>

        <template v-if="slots.empty" #empty>
          <Component :is="toComponent(slots.empty)" />
        </template>
      </Component>
    </PTeleport>
  </div>
</template>
