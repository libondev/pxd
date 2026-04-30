<script lang="ts" setup>
import type { SnippetEmits, SnippetProps } from './types'
import type { Component } from 'vue'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { tv } from 'tailwind-variants'
import { computed } from 'vue'
import { useCopyClick } from '../../composables/use-copy-click'
import { useConfigProvider } from '../../contexts/config-provider'
import { getCssUnitValue, isTruthyProp, toArray } from '../../utils/format'

defineOptions({
  name: 'PSnippet',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SnippetProps>(), {
  prompt: '$ ',
  variant: 'default',
})

const emits = defineEmits<SnippetEmits>()

const snippetVariant = tv({
  base: 'pxd-snippet pl-3 pr-1.5 gap-4 relative flex items-center rounded-lg border tabular-nums motion-safe:transition-appearance',
  variants: {
    size: {
      sm: 'min-h-8 py-2 text-sm',
      md: 'min-h-10 py-2.5 text-sm',
      lg: 'min-h-12 py-3 text-base',
    },
    variant: {
      default: 'border-gray-alpha-300 bg-background-100',
      primary: 'border-gray-alpha-300 bg-primary text-gray-100',
      success: 'border-gray-alpha-300 bg-blue-200 text-blue-900',
      error: 'border-gray-alpha-300 bg-red-200 text-red-900',
      warning: 'border-gray-alpha-300 bg-amber-200 text-amber-900',
    },
    prompt: {
      true: 'pxd-snippet--prompt',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    prompt: false,
  },
})

const configProvider = useConfigProvider()

const { isCopied, copyText } = useCopyClick()

const renderIcon = computed<Component>(() => (isCopied.value ? CheckIcon : CopyIcon))
const computedTextArray = computed(() => toArray(props.text))

const computedClasses = computed(() => {
  return snippetVariant({
    size: props.size || configProvider.size,
    variant: props.variant,
    prompt: isTruthyProp(props.prompt),
  })
})

async function onCopyButtonClick() {
  const text = computedTextArray.value.join('\n')

  await copyText(text)

  emits('copy', text)
}
</script>

<template>
  <div :class="computedClasses" :style="{ width: getCssUnitValue(props.width) }" v-bind="$attrs">
    <div class="pxd-snippet--container flex-1">
      <pre
        v-for="(t, i) of computedTextArray"
        :key="i"
        class="m-0 p-0"
        :data-prompt="prompt"
        :class="{ 'before:content-[attr(data-prompt)] before:select-none': prompt }"
        >{{ t }}</pre
      >
    </div>

    <div class="min-w-5 relative shrink-0">
      <button
        class="right-0 p-1.5 absolute top-1/2 -translate-y-1/2 cursor-pointer appearance-none rounded-sm self-focus-ring outline-none select-none hover:bg-background-hover hover:shadow-border-base active:bg-background-active motion-safe:transition-appearance"
        :class="{ copied: isCopied }"
        @click="onCopyButtonClick"
      >
        <Transition name="pxd-transition--fade-scale" mode="out-in" appear>
          <Component :is="renderIcon" class="text-sm pointer-events-none" />
        </Transition>
      </button>
    </div>
  </div>
</template>
