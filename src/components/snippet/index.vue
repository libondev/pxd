<script lang="ts" setup>
import type { SnippetEmits, SnippetProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { BASIC_MIN_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp, toArray } from '../../utils/format.js'
import PCopyButton from '../copy-button/index.vue'

defineOptions({
  name: 'PSnippet',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SnippetProps>(), {
  prompt: '$ ',
  variant: 'default',
})

const emits = defineEmits<SnippetEmits>()

const configProvider = useConfigProvider()

const computedTextList = computed(() => toArray(props.text))
const copyText = computed(() => computedTextList.value.join('\n'))

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-snippet ps-3 pe-1 gap-4 relative flex items-center rounded-lg border tabular-nums',
    variants: {
      size: {
        sm: `${BASIC_MIN_HEIGHTS.sm} py-2 pe-0.75 text-sm`,
        md: `${BASIC_MIN_HEIGHTS.md} py-2.5 pe-1 text-sm`,
        lg: `${BASIC_MIN_HEIGHTS.lg} py-3 pe-2 text-base`,
      },
      variant: {
        default: 'border-gray-alpha-300 bg-background-100 text-gray-1000',
        inverted: 'border-transparent bg-gray-1000 text-gray-100',
        primary: 'border-gray-alpha-300 bg-primary text-primary-foreground',
        success: 'border-blue-400 bg-blue-200 text-blue-900',
        error: 'border-red-400 bg-red-200 text-red-900',
        warning: 'border-amber-400 bg-amber-200 text-amber-900',
        secondary: 'border-gray-alpha-300 bg-gray-200 text-gray-1000',
        ghost: 'border-transparent text-gray-1000',
      },
      prompt: {
        true: 'pxd-snippet--prompt',
      },
    },
  },
  {
    selection: () => ({
      size: props.size || configProvider.size,
      variant: props.variant,
      prompt: isTruthyProp(props.prompt),
    }),
  },
)

function onCopy(text: string) {
  emits('copy', text)
}
</script>

<template>
  <div :class="classes" :data-variant="variant" v-bind="attrs">
    <div class="pxd-snippet--container flex-1">
      <pre
        v-for="(t, i) of computedTextList"
        :key="i"
        class="m-0 p-0"
        :data-prompt="prompt"
        :class="{ 'before:content-[attr(data-prompt)] before:select-none': prompt }"
        >{{ t }}</pre>
    </div>

    <div class="min-w-5 relative shrink-0">
      <PCopyButton
        size="sm"
        icon
        variant="ghost"
        :text="copyText"
        class="right-0 p-1.5 absolute top-1/2 -translate-y-1/2 text-inherit"
        @copy="onCopy"
      />
    </div>
  </div>
</template>
