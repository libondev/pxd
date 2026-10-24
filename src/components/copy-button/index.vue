<script lang="ts" setup>
import type { CopyButtonProps, CopyButtonEmits } from './types'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { useCopyClick } from '../../composables/use-copy-click.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PCopyButton',
  inheritAttrs: false,
})

const props = defineProps<CopyButtonProps>()
const emits = defineEmits<CopyButtonEmits>()

const { isCopied, copyText } = useCopyClick()

async function onCopyClick(ev: PointerEvent) {
  const text = (typeof props.text === 'function' ? props.text(ev) : props.text) || ''

  await copyText(text)
  emits('copy', text, ev)
}
</script>

<template>
  <PButton data-copy-button class="pxd-copy-button" v-bind="$attrs" @click="onCopyClick">
    <slot v-if="$slots.default" :copied="isCopied" />

    <Transition
      name="pxd-transition--fade-scale"
      mode="out-in"
      class="pxd-copy-button--icon not-first:ms-1.5"
    >
      <CheckIcon v-if="isCopied" />
      <CopyIcon v-else />
    </Transition>
  </PButton>
</template>
