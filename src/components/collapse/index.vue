<script lang="ts" setup>
import type { CollapseEmits, CollapseProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useDetailsCollapse } from '../../composables/use-details-collapse.js'
import { useCollapseGroupContext } from '../../contexts/collapse.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PCollapse',
  inheritAttrs: false,
})
const props = withDefaults(defineProps<CollapseProps>(), {
  expand: false,
})
const emits = defineEmits<CollapseEmits>()

const uid = getUniqueId()
const rootRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const collapseGroup = useCollapseGroupContext()

const { isOpen, detailsOpen, onToggleClick, onDetailsToggle } = useDetailsCollapse(
  contentRef,
  () => props.expand,
)

useAgentNode({
  name: 'collapse',
  el: () => rootRef.value,
  state: () => ({ open: isOpen.value }),
  reveals: true,
  actions: {
    setOpen: (open) => {
      isOpen.value = Boolean(open)
    },
    toggle: () => {
      onToggleClick()
    },
  },
})

function onTriggerClick(ev: MouseEvent) {
  emits('toggle', ev)
  onToggleClick()
}

watch(
  () => isOpen.value,
  (open) => {
    const group = collapseGroup

    if (!group || group.props.multiple) {
      return
    }

    if (open) {
      group.openUid.value = uid
    } else if (group.openUid.value === uid) {
      group.openUid.value = ''
    }
  },
  { immediate: true },
)

watch(
  () => collapseGroup?.openUid.value,
  (openUid) => {
    if (openUid && openUid !== uid) {
      isOpen.value = false
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (collapseGroup?.openUid.value === uid) {
    collapseGroup.openUid.value = ''
  }
})
</script>

<template>
  <details
    ref="rootRef"
    data-collapse
    class="pxd-collapse group/collapse border-b"
    v-bind="$attrs"
    :open="detailsOpen"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-collapse--trigger pe-1 group/collapse flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center justify-between border-none bg-transparent font-inherit self-focus-ring outline-none"
      @click.prevent="onTriggerClick"
    >
      <h3 class="pxd-collapse--title m-0 min-w-0 flex-1 font-inherit text-inherit">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>

      <ChevronRightIcon
        class="size-em shrink-0 motion-safe:transition-transform"
        :class="{ 'rotate-90': isOpen }"
      />
    </summary>

    <div
      ref="contentRef"
      class="grid grid-cols-[minmax(0,1fr)] overflow-hidden motion-safe:transition-[grid-template-rows]"
      :class="isOpen ? 'grid-rows-[minmax(0,1fr)]' : 'grid-rows-[minmax(0,0fr)]'"
    >
      <div class="pxd-collapse--content">
        <slot />
      </div>
    </div>
  </details>
</template>

<style>
.pxd-collapse--trigger {
  padding-block: var(--collapse-padding, 1.5rem);
  font-size: var(--collapse-font-size, 1.5rem);
  font-weight: var(--collapse-font-weight, 600);
}
</style>
