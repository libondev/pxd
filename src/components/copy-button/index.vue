<script lang="ts" setup>
import type { CopyButtonProps, CopyButtonEmits } from './types'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { useCopyClick } from '../../composables/use-copy-click'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PCopyButton',
  inheritAttrs: false,
})

const props = defineProps<CopyButtonProps>()
const emits = defineEmits<CopyButtonEmits>()

const { isCopied, copyText } = useCopyClick()

function onCopyClick(ev: PointerEvent) {
  copyText(props.text)

  emits('copy', props.text, ev)
}
</script>

<template>
  <PButton class="pxd-copy-button" v-bind="$attrs" @click="onCopyClick">
    <span v-if="$slots.default" class="pxd-copy-button--text">
      <slot :copied="isCopied" />
    </span>

    <slot name="icon" :copied="isCopied">
      <Transition
        name="pxd-transition--fade-scale"
        mode="out-in"
        class="pxd-copy-button--icon not-first:ms-1.5 pointer-events-none"
      >
        <CheckIcon v-if="isCopied" />
        <CopyIcon v-else />
      </Transition>
    </slot>
  </PButton>
</template>
