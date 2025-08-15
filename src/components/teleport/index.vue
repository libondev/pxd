<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { isServer, isVue3 } from '../../utils/is'

interface Props {
  to?: string | HTMLElement
  disabled?: boolean
}

interface Location {
  parent: Node
  nextSibling: Node | null
}

defineOptions({
  name: 'PTeleport',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  { to: 'body' },
)

const containerRef = shallowRef<HTMLElement>()

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

let isTeleported = false
let homeLocation: Location | null

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

  watch(
    () => [targetEl.value, props.disabled],
    () => {
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
  )
})

onBeforeUnmount(() => {
  if (isVue3) {
    return
  }

  containerRef.value?.remove()
  homeLocation = null
})
</script>

<template>
  <Teleport v-if="isVue3" :disabled="disabled" :to="to">
    <slot />
  </Teleport>

  <div v-else ref="containerRef" class="pxd-teleport">
    <slot />
  </div>
</template>
