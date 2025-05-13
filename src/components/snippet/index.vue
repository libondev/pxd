<script lang="ts" setup>
import type { ComponentSize, ComponentVariantWithDefault } from '../../types/components'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { computed, ref } from 'vue'
import { useComputedSize } from '../../composables/useComputedSize'
import { getCssUnitValue, toArray } from '../../utils/format'

interface Props {
  text: string | string[]
  width?: string | number
  size?: ComponentSize
  prompt?: boolean | string
  variant?: ComponentVariantWithDefault
}

defineOptions({
  name: 'PSnippet',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    prompt: '$ ',
    variant: 'default',
  },
)

const emits = defineEmits<{
  copy: [string]
}>()

const isCopied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout>

const SIZES = {
  sm: 'min-h-7.5 px-1.5 py-2 text-sm',
  md: 'min-h-9 px-2.5 py-2.5 text-sm',
  lg: 'min-h-10 px-3.5 py-3 text-base',
}

const VARIANTS = {
  default: 'border-gray-alpha-300 bg-background',
  primary: 'text-gray-100 border-gray-alpha-300 bg-primary',
  success: 'text-blue-900 border-gray-alpha-300 bg-blue-200',
  error: 'text-red-900 border-gray-alpha-300 bg-red-200',
  warning: 'text-amber-900 border-gray-alpha-300 bg-amber-200',
}

const computedSize = useComputedSize(props.size, SIZES)

const computedClasses = computed(() => {
  const basic = ['pxd-snippet relative pr-14 rounded-md flex w-max items-center border motion-safe:transition-all']

  basic.push(computedSize.value)

  if (props.variant) {
    basic.push(VARIANTS[props.variant] || VARIANTS.default)
  }

  if (props.prompt) {
    basic.push('pxd-snippet-prompt')
  }

  return basic
})

const computedTextArray = computed(() => toArray(props.text))

function onCopyClick() {
  clearTimeout(copiedTimer)

  const text = computedTextArray.value.join('\n')

  navigator.clipboard.writeText(text)

  isCopied.value = true

  emits('copy', text)

  copiedTimer = setTimeout(() => {
    isCopied.value = false
  }, 1500)
}
</script>

<template>
  <div :class="computedClasses" :style="{ width: getCssUnitValue(props.width) }">
    <div class="pxd-snippet--container">
      <pre v-for="(t, i) of computedTextArray" :key="i" class="m-0 p-0" :data-prompt="prompt" :class="{ 'before:content-[attr(data-prompt)] before:select-none': prompt }">{{ t }}</pre>
    </div>

    <div
      class="absolute top-1/2 -translate-y-1/2 right-1 p-2 cursor-pointer hover:bg-background-hover active:bg-background-active rounded-md"
      :class="{ copied: isCopied }"
      @click="onCopyClick"
    >
      <Transition name="fade-scale" mode="out-in">
        <Component :is="isCopied ? CheckIcon : CopyIcon" class="w-4 h-4" />
      </Transition>
    </div>
  </div>
</template>

<style>
@media (prefers-reduced-motion: no-preference) {
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: all 0.15s ease-in-out;
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    opacity: 0;
    transform: scale(.68);
  }
}
</style>
