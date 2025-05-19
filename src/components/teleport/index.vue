<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useSlots, version, watch } from 'vue'

interface Props {
  to?: string
}

defineOptions({
  name: 'PTeleport',
})

const props = withDefaults(
  defineProps<Props>(),
  { to: 'body' },
)

let isMounted = false
const isVue3 = version.startsWith('3')

const renderSlots = useSlots()
const containerRef = shallowRef<HTMLElement>()

const targetContainer = computed(() => isVue3 ? null : document.querySelector(props.to))

const unwatchChildrenUpdate = watch(
  () => renderSlots.default?.(),
  () => {
    if (containerRef.value && targetContainer.value) {
      if (isMounted) {
        containerRef.value.remove()
      }

      targetContainer.value.append(containerRef.value)
    }
  },
  { flush: 'post' },
)

function setup() {
  nextTick(() => {
    if (isVue3 || !containerRef.value) {
      unwatchChildrenUpdate()
      return
    }

    if (!targetContainer.value) {
      return
    }

    targetContainer.value.append(containerRef.value)
  })
}

function teardown() {
  if (isVue3) {
    return
  }

  containerRef.value?.remove()
}

onMounted(() => {
  isMounted = true

  if (typeof window === 'undefined') {
    return
  }

  setup()
})

onBeforeUnmount(() => {
  teardown()
})
</script>

<template>
  <Teleport v-if="isVue3" :to="to">
    <slot />
  </Teleport>

  <div v-else ref="containerRef" class="pxd-teleport">
    <slot />
  </div>
</template>
