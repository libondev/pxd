<script lang="ts" setup>
import type { TeleportLocation, TeleportProps } from './types'
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { isServer, isVue3 } from '../../utils/is.js'

defineOptions({
  name: 'PTeleport',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TeleportProps>(), { to: 'body' })

const inVue3 = isVue3()
const inServer = isServer()
let isTeleported = false
let homeLocation: TeleportLocation | null

// A teleported subtree cannot be prerendered: the content never reaches the HTML, so
// hydration would rebuild it elsewhere and leave the server copy orphaned. Render it
// in place for the server pass and for hydrating, then move it. A fresh client render
// has nothing to match, and rendering it in place once exposes it to the host's
// containing block and scroll offsets — which floating layers measure.
const isHydrating = Boolean(getCurrentInstance()?.vnode.el)
const mounted = shallowRef(!inServer && !isHydrating)

const isDisabled = computed(() => props.disabled || !mounted.value)
const containerRef = shallowRef<HTMLElement>()

const targetEl = computed(() => {
  const { disabled, to } = props

  if (inServer || inVue3 || disabled || !to) {
    return null
  }

  if (to instanceof HTMLElement) {
    return to
  }

  let container: HTMLElement | null = null
  try {
    container = document.querySelector<HTMLElement>(to as string)
  } catch {}

  return container ?? document.body
})

function syncContainer() {
  const el = containerRef.value

  if (!el || !homeLocation) {
    return
  }

  if (props.disabled) {
    if (isTeleported) {
      const { parent, nextSibling } = homeLocation
      parent.insertBefore(el, nextSibling)
      isTeleported = false
    }

    return
  }

  if (targetEl.value) {
    targetEl.value.append(el)
    isTeleported = true
  }
}

onMounted(() => {
  mounted.value = true

  if (inVue3 || inServer) {
    return
  }

  const el = containerRef.value
  if (el && el.parentNode) {
    homeLocation = {
      parent: el.parentNode,
      nextSibling: el.nextSibling,
    }

    syncContainer()
  }

  watch(() => [targetEl.value, props.disabled], syncContainer)
})

onBeforeUnmount(() => {
  if (inVue3) {
    return
  }

  containerRef.value?.remove()
  homeLocation = null
})
</script>

<template>
  <Teleport v-if="inVue3" :disabled="isDisabled" :to="to" v-bind="$attrs">
    <slot />
  </Teleport>

  <div v-else data-teleport ref="containerRef" class="pxd-teleport" v-bind="$attrs">
    <slot />
  </div>
</template>
