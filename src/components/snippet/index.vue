<script lang="ts" setup>
import type { ComponentSize, ComponentVariant } from '../../types/components'
import { CheckIcon, CopyIcon } from 'gdsi/vue'
import { computed, ref } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { getCssUnitValue, toArray } from '../../utils/format'

interface Props {
  text: string | string[]
  width?: string | number
  size?: ComponentSize
  prompt?: boolean | string
  variant?: ComponentVariant
}

defineOptions({
  name: 'PxdSnippet',
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
  sm: 'px-1.5 py-2 min-h-7.5 text-sm',
  md: 'px-2.5 py-2.5 min-h-9 text-sm',
  lg: 'px-3.5 py-3 min-h-10.5 text-base',
}

const VARIANTS = {
  default: 'border-gray-alpha-300 bg-background',
  primary: 'text-gray-100 border-gray-alpha-300 bg-primary',
  success: 'text-blue-900 border-gray-alpha-300 bg-blue-200',
  error: 'text-red-900 border-gray-alpha-300 bg-red-200',
  warning: 'text-amber-900 border-gray-alpha-300 bg-amber-200',
}

const config = useConfigProvider()

const computedClasses = computed(() => {
  const basic = ['pxd-snippet relative pr-14 rounded-md flex w-max items-center border motion-safe:transition-all']

  basic.push(SIZES[props.size || config.size])

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
    <div>
      <pre v-for="(t, i) of computedTextArray" :key="i" class="!m-0 !p-0" :data-prompt="prompt" :class="{ 'before:content-[attr(data-prompt)] before:select-none': prompt }">{{ t }}</pre>
    </div>

    <div
      class="absolute top-1/2 -translate-y-1/2 right-0.5 p-2 cursor-pointer"
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
