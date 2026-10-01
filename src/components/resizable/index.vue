<script lang="ts" setup>
import type { OrderedChild } from '../../composables/_internal/use-ordered-children.js'
import type { PanelBounds, PanelRange } from '../../contexts/resizable.js'
import type { PanelConfig, ResizableEmits, ResizableProps } from './types'
import { computed, nextTick, shallowRef } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useOrderedChildren } from '../../composables/_internal/use-ordered-children.js'
import { provideResizableContext } from '../../contexts/resizable.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'
import { clamp, isAutoSize, PERCENT_TOTAL, roundSize } from './utils'

defineOptions({
  name: 'PResizable',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

interface PanelChild extends PanelConfig {
  kind: 'panel'
}

interface HandleChild {
  kind: 'handle'
}

type ChildConfig = PanelChild | HandleChild

function isPanelChild(item: OrderedChild<ChildConfig>): item is OrderedChild<PanelChild> {
  return item.payload.kind === 'panel'
}

const props = withDefaults(defineProps<ResizableProps>(), {
  direction: 'horizontal',
  modelValue: null,
})

const emits = defineEmits<ResizableEmits>()

const name = getUniqueId('pxd-resizable')
const containerRef = shallowRef<HTMLElement>()
const registry = useOrderedChildren<ChildConfig>()

const modelValue = useModelValue(props, emits, { withChange: false })
const isControlled = computed(() => !isNil(props.modelValue))
const internalSizes = shallowRef<number[]>([])
const sizes = computed<number[]>(() =>
  isControlled.value ? (props.modelValue ?? []) : internalSizes.value,
)

const seeded = shallowRef(false)
const knownKeys = shallowRef<string[]>([])
// Size every panel started from. Kept so a reset restores one pair without
// recomputing - and discarding - the sizes the user dragged.
const initialSizes = new Map<string, number>()
const collapsedHandles = shallowRef<Record<string, boolean>>({})
// Sizes a pair had before it was collapsed, so expanding gives back what the
// user was working with rather than the configured starting point.
const expandedSizes = new Map<string, number[]>()

const panelChildren = computed(() => registry.items.value.filter(isPanelChild))
const panelKeys = computed(() => panelChildren.value.map((item) => item.key))

const panelIndexByKey = computed(() => {
  const index = new Map<string, number>()

  panelChildren.value.forEach((item, position) => index.set(item.key, position))

  return index
})

// A handle resizes the panels right around it. Reading DOM order instead of
// counting handles keeps a stray or conditionally rendered handle from
// silently shifting every pairing after it.
const rangesByHandle = computed(() => {
  const children = registry.items.value
  const ranges = new Map<string, PanelRange | null>()

  children.forEach((item, position) => {
    if (item.payload.kind !== 'handle') {
      return
    }

    let prevIndex = -1

    for (let i = position - 1; i >= 0; i--) {
      const prev = children[i]!

      if (isPanelChild(prev)) {
        prevIndex = panelIndexByKey.value.get(prev.key) ?? -1
        break
      }
    }

    ranges.set(
      item.key,
      prevIndex >= 0 && prevIndex + 1 < panelKeys.value.length
        ? { prevIndex, nextIndex: prevIndex + 1 }
        : null,
    )
  })

  return ranges
})

function getPanelIndex(key: string) {
  return panelIndexByKey.value.get(key) ?? -1
}

function getPanelId(index: number) {
  return panelChildren.value[index]?.payload.id ?? `${name}-panel-${index}`
}

function getPanelSize(index: number) {
  return sizes.value[index] ?? 0
}

function getPanelBounds(index: number): PanelBounds {
  const payload = panelChildren.value[index]?.payload
  const min = clamp(payload?.minSize ?? 0, 0, PERCENT_TOTAL)

  return { min, max: clamp(payload?.maxSize ?? PERCENT_TOTAL, min, PERCENT_TOTAL) }
}

function getContainerSize() {
  if (!containerRef.value) {
    return 0
  }

  return props.direction === 'horizontal'
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight
}

function panelSizeOf(key: string) {
  const index = knownKeys.value.indexOf(key)

  return index === -1 ? 0 : (sizes.value[index] ?? 0)
}

function setSizes(next: number[]) {
  const current = sizes.value
  const rounded = next.map(roundSize)

  if (
    rounded.length === current.length &&
    rounded.every((size, index) => size === current[index])
  ) {
    return false
  }

  if (!isControlled.value) {
    internalSizes.value = rounded
  }

  modelValue.value = rounded

  return true
}

function resize(range: PanelRange, deltaPercent: number) {
  const current = sizes.value
  const prev = current[range.prevIndex] ?? 0
  const next = current[range.nextIndex] ?? 0
  const prevBounds = getPanelBounds(range.prevIndex)
  const nextBounds = getPanelBounds(range.nextIndex)

  // Clamp the movement so both panels stay inside their own bounds, then hand
  // the neighbour the same delta so the group keeps summing to 100%.
  const applied = clamp(
    deltaPercent,
    Math.max(prevBounds.min - prev, next - nextBounds.max),
    Math.min(prevBounds.max - prev, next - nextBounds.min),
  )

  if (applied === 0) {
    return false
  }

  // The neighbour is derived from the already rounded value, so the pair keeps
  // the exact sum it had and repeated drags cannot drift.
  const newPrev = roundSize(prev + applied)
  const result = current.slice()
  result[range.prevIndex] = newPrev
  result[range.nextIndex] = roundSize(prev + next - newPrev)

  return setSizes(result)
}

function resizeByHandle(handleKey: string, deltaPercent: number) {
  const range = rangesByHandle.value.get(handleKey)

  if (!range) {
    return false
  }

  const changed = resize(range, deltaPercent)

  if (changed) {
    setCollapsed(handleKey, false)
  }

  return changed
}

function isCollapsed(handleKey: string) {
  return collapsedHandles.value[handleKey] === true
}

function setCollapsed(handleKey: string, collapsed: boolean) {
  if (isCollapsed(handleKey) === collapsed) {
    return
  }

  collapsedHandles.value = { ...collapsedHandles.value, [handleKey]: collapsed }
}

function toggleCollapse(handleKey: string) {
  const range = rangesByHandle.value.get(handleKey)

  if (!range) {
    return
  }

  const current = sizes.value
  const prev = current[range.prevIndex] ?? 0
  const next = current[range.nextIndex] ?? 0
  const result = current.slice()

  if (isCollapsed(handleKey)) {
    const remembered = expandedSizes.get(handleKey)

    result[range.prevIndex] =
      remembered?.[0] ?? initialSizes.get(panelKeys.value[range.prevIndex]!) ?? 0
    result[range.nextIndex] =
      remembered?.[1] ?? initialSizes.get(panelKeys.value[range.nextIndex]!) ?? 0

    expandedSizes.delete(handleKey)
  } else {
    expandedSizes.set(handleKey, [prev, next])

    const { min } = getPanelBounds(range.prevIndex)
    // Whatever the panel gives up goes to its neighbour, so the group keeps
    // summing to 100% while collapsed.
    result[range.prevIndex] = min
    result[range.nextIndex] = next + (prev - min)
  }

  setCollapsed(handleKey, !isCollapsed(handleKey))

  if (setSizes(result)) {
    commitChange()
  }
}

function commitChange() {
  emits('change', sizes.value.slice())
}

function reset(handleKey?: string) {
  const initial = panelKeys.value.map((key) => initialSizes.get(key) ?? 0)

  if (!handleKey) {
    expandedSizes.clear()
    collapsedHandles.value = {}
  }

  if (handleKey) {
    expandedSizes.delete(handleKey)
    setCollapsed(handleKey, false)

    const range = rangesByHandle.value.get(handleKey)

    if (!range) {
      return
    }

    const result = sizes.value.slice()
    result[range.prevIndex] = initial[range.prevIndex]!
    result[range.nextIndex] = initial[range.nextIndex]!

    if (setSizes(result)) {
      emits('reset', result)
    }

    return
  }

  if (setSizes(initial)) {
    emits('reset', initial)
  }
}

function computeInitialSizes() {
  const autoIndexes: number[] = []

  const result = panelChildren.value.map((item, index) => {
    const { min, max } = getPanelBounds(index)

    if (isAutoSize(item.payload.size)) {
      autoIndexes.push(index)
      return min
    }

    return clamp(item.payload.size!, min, max)
  })

  const fixedTotal = result.reduce(
    (total, size, index) => (autoIndexes.includes(index) ? total : total + size),
    0,
  )

  // Auto panels take their min-size first, then share what is left over.
  if (autoIndexes.length > 0) {
    const minTotal = autoIndexes.reduce((total, index) => total + result[index]!, 0)
    const remaining = Math.max(PERCENT_TOTAL - fixedTotal, 0)

    if (remaining < minTotal) {
      const scale = minTotal > 0 ? remaining / minTotal : 0
      autoIndexes.forEach((index) => (result[index] = result[index]! * scale))
    } else {
      const share = (remaining - minTotal) / autoIndexes.length
      autoIndexes.forEach((index) => (result[index] = result[index]! + share))
    }
  }

  const total = result.reduce((sum, size) => sum + size, 0)

  if (total > PERCENT_TOTAL) {
    if (import.meta.env?.DEV) {
      console.warn(
        `[pxd] PResizable: the configured sizes add up to ${Math.round(total * 100) / 100}%, they are scaled down to fit.`,
      )
    }

    const scale = PERCENT_TOTAL / total
    return result.map((size) => size * scale)
  }

  return result
}

function rememberInitialSizes(initial: number[]) {
  initialSizes.clear()
  panelKeys.value.forEach((key, index) => initialSizes.set(key, initial[index] ?? 0))
}

function reconcileSizes() {
  const children = panelChildren.value
  const nextKeys = children.map((item) => item.key)
  const previous = knownKeys.value
  const addedKeys = new Set(
    children.filter((item) => !previous.includes(item.key)).map((item) => item.key),
  )
  const removedCount = previous.filter((key) => !nextKeys.includes(key)).length

  knownKeys.value = nextKeys

  if (isControlled.value || (addedKeys.size === 0 && removedCount === 0)) {
    return
  }

  const keptTotal = nextKeys.reduce(
    (total, key) => (addedKeys.has(key) ? total : total + panelSizeOf(key)),
    0,
  )

  // Added panels take the size they were configured with; panels the user
  // already resized keep their proportions inside whatever space is left.
  const addedTargets = new Map<string, number>()
  const autoKeys: string[] = []
  let fixedTotal = 0

  children.forEach((item, index) => {
    if (!addedKeys.has(item.key)) {
      return
    }

    const { min, max } = getPanelBounds(index)

    if (isAutoSize(item.payload.size)) {
      autoKeys.push(item.key)
      return
    }

    const target = clamp(item.payload.size!, min, max)
    fixedTotal += target
    addedTargets.set(item.key, target)
  })

  if (autoKeys.length > 0) {
    const share = (PERCENT_TOTAL - fixedTotal) / autoKeys.length
    autoKeys.forEach((key) => addedTargets.set(key, share))
  }

  const addedTotal = [...addedTargets.values()].reduce((sum, size) => sum + size, 0)
  const keptCount = nextKeys.length - addedKeys.size
  const keptTarget = Math.max(PERCENT_TOTAL - addedTotal, 0)
  const scale = keptTotal > 0 ? keptTarget / keptTotal : keptCount > 0 ? keptTarget / keptCount : 0

  const result = nextKeys.map((key) =>
    addedTargets.has(key)
      ? addedTargets.get(key)!
      : keptTotal > 0
        ? panelSizeOf(key) * scale
        : scale,
  )

  nextKeys.forEach((key, index) => {
    if (!initialSizes.has(key)) {
      initialSizes.set(key, result[index]!)
    }
  })

  setSizes(result)
}

function syncSizes() {
  if (panelChildren.value.length === 0) {
    return
  }

  if (!seeded.value) {
    seeded.value = true
    knownKeys.value = panelKeys.value

    if (isControlled.value) {
      warnModelLength()
      return
    }

    const initial = computeInitialSizes().map(roundSize)
    rememberInitialSizes(initial)
    internalSizes.value = initial

    return
  }

  reconcileSizes()
}

function warnModelLength() {
  if (!import.meta.env?.DEV) {
    return
  }

  const provided = props.modelValue?.length ?? 0

  if (provided !== panelKeys.value.length) {
    console.warn(
      `[pxd] PResizable: v-model holds ${provided} size${provided === 1 ? '' : 's'} but the group has ${panelKeys.value.length} panels.`,
    )
  }
}

let syncScheduled = false

function scheduleSync() {
  if (syncScheduled) {
    return
  }

  syncScheduled = true
  void nextTick(() => {
    syncScheduled = false
    syncSizes()
  })
}

function registerPanel(key: string, config: PanelConfig, el?: HTMLElement | null) {
  registry.register(key, { kind: 'panel', ...config }, el)
  scheduleSync()
}

function unregisterPanel(key: string) {
  registry.unregister(key)
  scheduleSync()
}

function registerHandle(key: string, el?: HTMLElement | null) {
  registry.register(key, { kind: 'handle' }, el)
}

function unregisterHandle(key: string) {
  registry.unregister(key)
  expandedSizes.delete(key)

  if (isCollapsed(key)) {
    setCollapsed(key, false)
  }
}

defineExpose({
  getPanelSizes: () => sizes.value,
  reset,
})

provideResizableContext({
  name,
  props,
  sizes,
  getPanelIndex,
  getPanelId,
  getPanelSize,
  getPanelBounds,
  getContainerSize,
  getPanelRange: (handleKey) => rangesByHandle.value.get(handleKey) ?? null,
  registerPanel,
  unregisterPanel,
  registerHandle,
  unregisterHandle,
  resizeByHandle,
  isCollapsed,
  toggleCollapse,
  commitChange,
  reset,
})
</script>

<template>
  <div
    ref="containerRef"
    :data-orientation="direction"
    class="pxd-resizable flex size-full max-w-full flex-row overflow-hidden data-[orientation=vertical]:flex-col"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
