<script lang="ts" setup>
import type { PanelConfig } from '../resizable/types'
import type { ResizablePanelProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useResizableContext } from '../../contexts/resizable.js'
import { getUniqueId } from '../../utils/helper.js'
import { isAutoSize } from '../resizable/utils'

defineOptions({
  name: 'PResizablePanel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ResizablePanelProps>(), {
  size: null,
  minSize: 0,
  maxSize: 100,
})

const panelKey = getUniqueId('pxd-panel')
const panelEl = shallowRef<HTMLElement>()

const resizableContext = useResizableContext()

const index = computed(() => resizableContext.getPanelIndex(panelKey))

// The panel registers during setup, so its index is available on the very first
// render. Until the group has laid out there is no size to read and the prop is
// the only thing describing this panel, which keeps the first paint - and the
// server rendered markup - correct. `null` means "not laid out yet, stay flexible";
// a real 0 is a collapsed panel and must render as a 0% basis.
const size = computed<number | null>(() => {
  if (index.value === -1) {
    return 0
  }

  if (!resizableContext.sizes.value.length) {
    return isAutoSize(props.size) ? null : props.size!
  }

  return resizableContext.getPanelSize(index.value)
})

const panelStyle = computed(() => {
  if (size.value === null) {
    return { flexBasis: 'auto', flexGrow: 1, flexShrink: 1 }
  }

  return {
    flexBasis: `${size.value}%`,
    flexGrow: 0,
    // Handles take layout space of their own, so the row is always a little wider
    // than the panels. Shrinking spreads that remainder instead of letting the
    // container clip the last panel.
    flexShrink: 1,
  }
})

const panelConfig = computed<PanelConfig>(() => ({
  id: props.id,
  size: props.size,
  minSize: props.minSize,
  maxSize: props.maxSize,
}))

function register(el?: HTMLElement | null) {
  resizableContext.registerPanel(panelKey, panelConfig.value, el)
}

register()

onMounted(() => {
  register(panelEl.value)
})

watch(panelConfig, () => register(panelEl.value), { flush: 'post' })

watch(
  () => [props.size, props.minSize, props.maxSize],
  () => {
    if (!import.meta.env?.DEV) {
      return
    }

    const { size, minSize, maxSize } = props

    if (minSize < 0 || minSize > 100 || maxSize < 0 || maxSize > 100) {
      console.warn('[pxd] PResizablePanel: min-size and max-size must be between 0 and 100.')
    } else if (minSize > maxSize) {
      console.warn(
        `[pxd] PResizablePanel: min-size (${minSize}) is bigger than max-size (${maxSize}).`,
      )
    } else if (size != null && (size < 0 || size > 100)) {
      console.warn(`[pxd] PResizablePanel: size (${size}) must be between 0 and 100.`)
    }
  },
  { immediate: true, flush: 'post' },
)

onBeforeUnmount(() => {
  resizableContext.unregisterPanel(panelKey)
})
</script>

<template>
  <div
    :id="index >= 0 ? resizableContext.getPanelId(index) : undefined"
    ref="panelEl"
    class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
    :style="panelStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
