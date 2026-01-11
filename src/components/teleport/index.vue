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

const inVue3 = isVue3()
const inServer = isServer()

let isTeleported = false
let homeLocation: Location | null

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
    container = document.querySelector<HTMLElement>(to)
  } catch {}

  return container ?? document.body
})

onMounted(() => {
  if (inVue3 || inServer) {
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
  if (inVue3) {
    return
  }

  containerRef.value?.remove()
  homeLocation = null
})
</script>

<template>
  <Teleport v-if="inVue3" :disabled="disabled" :to="to" v-bind="$attrs">
    <slot />
  </Teleport>

  <div v-else ref="containerRef" class="pxd-teleport" v-bind="$attrs">
    <slot />
  </div>
</template>
