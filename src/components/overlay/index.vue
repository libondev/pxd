<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getScrollContainer } from '../../utils/dom'
import PTeleport from '../teleport/index.vue'

interface Props {
  zIndex?: number
  background?: string
  modelValue?: boolean
  appendToBody?: boolean
  overlayClass?: string
}

defineOptions({
  name: 'POverlay',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    zIndex: 10,
    background: 'hsla(var(--background-100-value), .8)',
    modelValue: false,
    appendToBody: true,
  },
)

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const overlayRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => {
  return {
    '--z': props.zIndex,
    '--bg': props.background,
  }
})

function onOverlayClick(ev: MouseEvent) {
  emits('click', ev)
}

let scrollContainer: HTMLElement

watch(() => props.modelValue, (visible) => {
  if (!visible) {
    if (scrollContainer) {
      scrollContainer.classList.remove('scroll-disabled')
    }

    return
  }

  nextTick(() => {
    if (!scrollContainer) {
      const container = getScrollContainer(overlayRef.value!)
      scrollContainer = container === window ? document.documentElement : container as HTMLElement
    }

    scrollContainer.classList.add('scroll-disabled')
  })
}, { immediate: true })

onBeforeUnmount(() => {
  if (scrollContainer) {
    scrollContainer.classList.remove('scroll-disabled')
  }
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in">
      <div
        v-if="modelValue"
        ref="overlayRef"
        class="pxd-overlay fixed inset-0 z-(--z) bg-(--bg)"
        :class="overlayClass"
        :style="computedStyle"
        @click="onOverlayClick"
      />
    </Transition>
  </PTeleport>
</template>
