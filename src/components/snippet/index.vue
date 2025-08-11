<script lang="ts" setup>
import type { ComponentSize, ComponentVariantWithDefault } from '../../types/shared'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useCopyClick } from '../../composables/use-copy-click'
import { getCssUnitValue, toArray } from '../../utils/format'
import { getFallbackValue } from '../../utils/value'

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

const SIZES = {
  sm: 'min-h-7.5 pl-3.5 pr-1.5 py-2 text-sm',
  md: 'min-h-9 pl-3.5 pr-2.5 py-2.5 text-sm',
  lg: 'min-h-10 pl-3.5 pr-3.5 py-3 text-base',
}

const VARIANTS = {
  default: 'border-gray-alpha-300 bg-background-100',
  primary: 'text-gray-100 border-gray-alpha-300 bg-primary',
  success: 'text-blue-900 border-gray-alpha-300 bg-blue-200',
  error: 'text-red-900 border-gray-alpha-300 bg-red-200',
  warning: 'text-amber-900 border-gray-alpha-300 bg-amber-200',
}

const config = useConfigProvider()

const computedClass = computed(() => {
  const classes = [
    'pxd-snippet pr-12 relative flex items-center rounded-lg border motion-safe:transition-all',
    getFallbackValue(props.variant, VARIANTS),
    getFallbackValue(props.size, SIZES, config.size),
  ]

  if (props.prompt) {
    classes.push('pxd-snippet--prompt')
  }

  return classes.join(' ')
})

const computedTextArray = computed(() => toArray(props.text))

const { isCopied, copyText } = useCopyClick()

async function onCopyButtonClick() {
  const text = computedTextArray.value.join('\n')

  await copyText(text)

  emits('copy', text)
}
</script>

<template>
  <div :class="computedClass" :style="{ width: getCssUnitValue(props.width) }">
    <div class="pxd-snippet--container">
      <pre v-for="(t, i) of computedTextArray" :key="i" class="m-0 p-0" :data-prompt="prompt" :class="{ 'before:content-[attr(data-prompt)] before:select-none': prompt }">{{ t }}</pre>
    </div>

    <div
      class="right-1 p-2 absolute top-1/2 -translate-y-1/2 cursor-pointer touch-none rounded-md select-none hover:bg-background-hover active:bg-background-active"
      :class="{ copied: isCopied }"
      @click="onCopyButtonClick"
    >
      <Transition name="pxd-transition--fade-scale" mode="out-in">
        <component :is="isCopied ? CheckIcon : CopyIcon" class="text-sm" />
      </Transition>
    </div>
  </div>
</template>
