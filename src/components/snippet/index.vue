<script lang="ts" setup>
import type { Component } from 'vue'
import type { ComponentSize, ComponentVariantWithDefault } from '../../types/shared'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useCopyClick } from '../../composables/use-copy-click'
import { getCssUnitValue, isTruthyProp, toArray } from '../../utils/format'
import { snippetVariant } from './cn'

interface Props {
  text: string | string[]
  width?: string | number
  size?: ComponentSize
  prompt?: boolean | string
  variant?: ComponentVariantWithDefault
}

defineOptions({
  name: 'PSnippet',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
  prompt: '$ ',
  variant: 'default',
})

const emits = defineEmits<{
  copy: [string]
}>()

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
    <div class="pxd-snippet--container">
      <pre
        v-for="(t, i) of computedTextArray"
        :key="i"
        class="m-0 p-0"
        :data-prompt="prompt"
        :class="{ 'before:content-[attr(data-prompt)] before:select-none': prompt }"
        >{{ t }}</pre
      >
    </div>

    <div
      class="right-1 p-2 absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-md select-none hover:bg-background-hover active:bg-background-active"
      :class="{ copied: isCopied }"
      @click="onCopyButtonClick"
    >
      <Transition name="pxd-transition--fade-scale" mode="out-in">
        <Component :is="renderIcon" class="text-sm" />
      </Transition>
    </div>
  </div>
</template>
