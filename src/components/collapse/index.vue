<script lang="ts" setup>
import type { CollapseEmits, CollapseProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useCollapseGroupContext } from '../../contexts/collapse'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PCollapse',
  inheritAttrs: false,
})

const uid = getUniqueId()

const props = defineProps<CollapseProps>()
const emits = defineEmits<CollapseEmits>()

const localExpand = shallowRef(props.expand)
const collapseGroupContext = useCollapseGroupContext()

const isExpanded = computed(() => {
  if (collapseGroupContext) {
    return collapseGroupContext.expandedIds.value.has(uid)
  }

  return localExpand.value
})

function beforeEnter(el: Element) {
  ;(el as HTMLElement).style.height = '0'
  ;(el as HTMLElement).style.overflow = 'hidden'
}

function enter(el: Element) {
  void (el as HTMLElement).offsetHeight
  ;(el as HTMLElement).style.height = `${el.scrollHeight}px`
}

function afterEnter(el: Element) {
  ;(el as HTMLElement).style.height = ''
  ;(el as HTMLElement).style.overflow = ''
}

function beforeLeave(el: Element) {
  ;(el as HTMLElement).style.height = `${el.scrollHeight}px`
  ;(el as HTMLElement).style.overflow = 'hidden'
  void (el as HTMLElement).offsetHeight
}

function leave(el: Element) {
  ;(el as HTMLElement).style.height = '0'
}

function onToggleClick(ev: MouseEvent) {
  const newCheckedState = !isExpanded.value

  emits('toggle', ev)

  if (collapseGroupContext) {
    const ids = collapseGroupContext.expandedIds.value

    if (!collapseGroupContext.props.multiple) {
      ids.clear()
    }

    if (newCheckedState) {
      ids.add(uid)
    } else {
      ids.delete(uid)
    }

    return
  }

  localExpand.value = newCheckedState
}

watch(
  () => props.expand,
  (expand) => {
    if (collapseGroupContext) {
      if (expand) {
        collapseGroupContext.expandedIds.value.add(uid)
      } else {
        collapseGroupContext.expandedIds.value.delete(uid)
      }
    } else {
      localExpand.value = expand
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (props.expand && collapseGroupContext) {
    collapseGroupContext.expandedIds.value.add(uid)
  }
})
</script>

<template>
  <div class="pxd-collapse group/collapse border-b" v-bind="$attrs">
    <h3 class="pxd-collapse--title">
      <button
        class="pxd-collapse--trigger pe-1 group/collapse flex w-full cursor-pointer touch-manipulation appearance-none items-center justify-between border-none bg-transparent font-inherit self-focus-ring outline-none"
        :data-state="isExpanded ? 'open' : 'closed'"
        @click="onToggleClick"
      >
        <slot name="title">
          {{ title }}
        </slot>

        <ChevronDownIcon
          class="size-4 shrink-0 group-data-[state=open]/collapse:-rotate-180 motion-safe:transition-transform"
        />
      </button>
    </h3>

    <Transition
      name="pxd-transition--collapse"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div v-show="isExpanded" class="pxd-collapse--content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style>
.pxd-collapse--trigger {
  padding-block: var(--collapse-padding, 24px);
  font-size: var(--collapse-font-size, 24px);
  font-weight: var(--collapse-font-weight, 600);
}

.pxd-transition--collapse-enter-active,
.pxd-transition--collapse-leave-active {
  transition-property: height;
}
</style>
