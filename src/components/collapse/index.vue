<script lang="ts" setup>
import type { CollapseEmits, CollapseProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed, shallowRef, watch } from 'vue'
import { useCollapseMotion } from '../../composables/_internal/use-collapse-motion.js'
import { useCollapseGroupContext } from '../../contexts/collapse.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PCollapse',
  inheritAttrs: false,
})

const uid = getUniqueId()
const props = defineProps<CollapseProps>()
const emits = defineEmits<CollapseEmits>()

const collapseGroup = useCollapseGroupContext()
const internalExpand = shallowRef(props.expand)

const isExpanded = computed(() =>
  collapseGroup ? collapseGroup.expandedIds.value.has(uid) : internalExpand.value,
)
const { contentRef, detailsOpen, isLeaving, skipEnterMotion } = useCollapseMotion(isExpanded)

function setExpanded(expanded: boolean, exclusive = false) {
  if (collapseGroup) {
    const ids = collapseGroup.expandedIds.value
    if (exclusive && !collapseGroup.props.multiple) {
      ids.clear()
    }
    if (expanded) {
      ids.add(uid)
    } else {
      ids.delete(uid)
    }
    return
  }

  internalExpand.value = expanded
}

function onToggleClick(ev: MouseEvent) {
  emits('toggle', ev)
  setExpanded(!isExpanded.value, true)
}

function onDetailsToggle(ev: Event) {
  const details = ev.currentTarget as HTMLDetailsElement

  // Find-in-page / fragment navigation opens <details> natively.
  if (details.open && !isExpanded.value) {
    skipEnterMotion()
    setExpanded(true, true)
  }
}

watch(
  () => props.expand,
  (expand) => setExpanded(!!expand),
  { immediate: true },
)
</script>

<template>
  <details
    class="pxd-collapse group/collapse border-b"
    v-bind="$attrs"
    :open="detailsOpen"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-collapse--trigger pe-1 group/collapse flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center justify-between border-none bg-transparent font-inherit self-focus-ring outline-none"
      @click.prevent="onToggleClick"
    >
      <h3 class="pxd-collapse--title m-0 min-w-0 flex-1 font-inherit text-inherit">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>

      <ChevronDownIcon
        class="size-4 shrink-0 motion-safe:transition-transform"
        :class="{ '-rotate-180': detailsOpen }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-collapse--content"
      :class="{
        'motion-safe:transition-[height]': isExpanded || isLeaving,
      }"
    >
      <slot />
    </div>
  </details>
</template>

<style>
.pxd-collapse--trigger {
  padding-block: var(--collapse-padding, 24px);
  font-size: var(--collapse-font-size, 24px);
  font-weight: var(--collapse-font-weight, 600);
}
</style>
