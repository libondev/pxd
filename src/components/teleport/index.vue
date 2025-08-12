<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, shallowRef, version, watch } from 'vue'
import { isServer } from '../../utils/is'

interface Props {
  to?: string | HTMLElement
  disabled?: boolean
}

defineOptions({
  name: 'PTeleport',
})

const props = withDefaults(
  defineProps<Props>(),
  { to: 'body' },
)

interface Location {
  parent: Node
  nextSibling: Node | null
}

const isVue3 = version.startsWith('3')

const containerRef = shallowRef<HTMLElement>()

let isTeleported = false
let homeLocation: Location | null

const targetEl = computed(() => {
  const { disabled, to } = props

  if (isServer || isVue3 || disabled || !to) {
    return null
  }

  if (to instanceof HTMLElement) {
    return to
  }

  let container: HTMLElement | null = null
  try {
    container = document.querySelector<HTMLElement>(to)
  } catch {}

  return container ?? document.body
})

watch(
  () => [targetEl.value, props.disabled],
  () => {
    if (isVue3 || isServer) {
      return
    }

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
  },
  { flush: 'post' },
)

onMounted(() => {
  if (isVue3 || isServer) {
    return
  }

  const el = containerRef.value
  if (el && el.parentNode) {
    homeLocation = {
      parent: el.parentNode,
      nextSibling: el.nextSibling,
    }

    if (!props.disabled && targetEl.value) {
      targetEl.value.append(el)
      isTeleported = true
    }
  }
})

onBeforeUnmount(() => {
  if (isVue3 || isServer) {
    return
  }

  containerRef.value?.remove()
  homeLocation = null
})
</script>

<template>
  <Teleport v-if="isVue3" :disabled="disabled" :to="to" defer>
    <slot />
  </Teleport>

  <div v-else ref="containerRef" class="pxd-teleport">
    <slot />
  </div>
</template>
