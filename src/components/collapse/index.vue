<script lang="ts" setup>
import type { CollapseEmits, CollapseProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useCollapseGroupContext } from '../../contexts/collapse.js'
import { getStyle } from '../../utils/dom.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PCollapse',
  inheritAttrs: false,
})

const uid = getUniqueId()
const props = defineProps<CollapseProps>()
const emits = defineEmits<CollapseEmits>()

const localExpand = shallowRef(props.expand)
const group = useCollapseGroupContext()
const contentRef = shallowRef<HTMLElement | null>(null)
// Stays true during leave so height can animate before `open` is removed.
const detailsOpen = shallowRef(false)

const isExpanded = computed(() => (group ? group.expandedIds.value.has(uid) : localExpand.value))

let ready = false
let skipEnter = false
let motionId = 0
let stopWait: (() => void) | undefined

function clearWait() {
  stopWait?.()
  stopWait = undefined
}

function finish(id: number) {
  if (id !== motionId) {
    return
  }

  clearWait()

  const el = contentRef.value
  if (el) {
    el.style.height = ''
    el.style.overflow = ''
  }

  if (!isExpanded.value) {
    detailsOpen.value = false
  }
}

function animate(expanded: boolean) {
  const el = contentRef.value
  if (!el) {
    return
  }

  const id = ++motionId
  clearWait()

  el.style.overflow = 'hidden'
  el.style.height = expanded ? '0' : `${el.scrollHeight}px`
  void el.offsetHeight
  el.style.height = expanded ? `${el.scrollHeight}px` : '0'

  const done = (event?: Event) => {
    if (event && ((event as TransitionEvent).propertyName !== 'height' || event.target !== el)) {
      return
    }
    finish(id)
  }

  const ms = (Number.parseFloat(getStyle(el).transitionDuration) || 0) * 1000
  if (ms === 0) {
    done()
    return
  }

  el.addEventListener('transitionend', done)
  const timer = window.setTimeout(done, ms + 50)
  stopWait = () => {
    el.removeEventListener('transitionend', done)
    clearTimeout(timer)
  }
}

function setExpanded(expanded: boolean, exclusive = false) {
  if (group) {
    const ids = group.expandedIds.value
    if (exclusive && !group.props.multiple) {
      ids.clear()
    }
    if (expanded) {
      ids.add(uid)
    } else {
      ids.delete(uid)
    }
    return
  }

  localExpand.value = expanded
}

function onToggleClick(ev: MouseEvent) {
  emits('toggle', ev)
  setExpanded(!isExpanded.value, true)
}

function onDetailsToggle(ev: Event) {
  const details = ev.currentTarget as HTMLDetailsElement

  // Find-in-page / fragment navigation opens <details> natively.
  if (details.open && !isExpanded.value) {
    skipEnter = true
    setExpanded(true, true)
  }
}

watch(
  () => props.expand,
  (expand) => setExpanded(!!expand),
  { immediate: true },
)

watch(
  isExpanded,
  async (expanded) => {
    if (expanded) {
      detailsOpen.value = true
    }

    if (!ready) {
      detailsOpen.value = expanded
      return
    }

    if (expanded && skipEnter) {
      skipEnter = false
      return
    }

    await nextTick()
    animate(expanded)
  },
  { immediate: true },
)

onMounted(() => {
  ready = true
})

onBeforeUnmount(clearWait)
</script>

<template>
  <div class="pxd-collapse group/collapse border-b" v-bind="$attrs">
    <details :open="detailsOpen" @toggle="onDetailsToggle">
      <summary
        class="pxd-collapse--trigger pe-1 group/collapse flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center justify-between border-none bg-transparent font-inherit self-focus-ring outline-none"
        :data-state="isExpanded ? 'open' : 'closed'"
        @click.prevent="onToggleClick"
      >
        <h3 class="pxd-collapse--title m-0 min-w-0 flex-1 font-inherit text-inherit">
          <slot name="title">
            {{ title }}
          </slot>
        </h3>

        <ChevronDownIcon
          class="size-4 shrink-0 group-data-[state=open]/collapse:-rotate-180 motion-safe:transition-transform"
        />
      </summary>

      <div
        ref="contentRef"
        class="pxd-collapse--content"
        :class="{
          'pxd-transition--collapse-enter-active': isExpanded,
          'pxd-transition--collapse-leave-active': !isExpanded && detailsOpen,
        }"
      >
        <slot />
      </div>
    </details>
  </div>
</template>

<style>
.pxd-collapse--trigger {
  padding-block: var(--collapse-padding, 24px);
  font-size: var(--collapse-font-size, 24px);
  font-weight: var(--collapse-font-weight, 600);
}

.pxd-collapse--trigger::marker {
  content: none;
}

.pxd-collapse--trigger::-webkit-details-marker {
  display: none;
}

.pxd-transition--collapse-enter-active,
.pxd-transition--collapse-leave-active {
  transition-property: height;
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
}
</style>
