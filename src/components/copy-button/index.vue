<script lang="ts" setup>
import type { CopyButtonProps, CopyButtonEmits } from './types'
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { useSlots, computed } from 'vue'
import { useCopyClick } from '../../composables/use-copy-click.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PCopyButton',
  inheritAttrs: false,
})

const props = defineProps<CopyButtonProps>()
const emits = defineEmits<CopyButtonEmits>()

const slots = useSlots()

const iconShape = computed(() => {
  return !slots.prefix && !slots.suffix
})

const { isCopied, copyText } = useCopyClick()

async function onCopyClick(ev: PointerEvent) {
  const text = `${(typeof props.content === 'function' ? props.content(ev) : props.content) ?? ''}`

  try {
    await copyText(text)
    emits('copy', text, ev)
  } catch (error) {
    emits('error', error, ev)
  }
}
</script>

<template>
  <PButton
    data-copy-button
    class="pxd-copy-button"
    v-bind="$attrs"
    :icon="iconShape"
    @click="onCopyClick"
  >
    <template v-if="$slots.prefix" #prefix>
      <span class="shrink-0">
        <slot name="prefix" :copied="isCopied" />
      </span>
    </template>

    <span class="pxd-copy-button--icon grid shrink-0">
      <Transition name="pxd-transition--fade-scale">
        <CheckIcon v-if="isCopied" class="col-start-1 row-start-1" />
        <CopyIcon v-else class="col-start-1 row-start-1" />
      </Transition>
    </span>

    <template v-if="$slots.suffix" #suffix>
      <span class="shrink-0">
        <slot name="suffix" :copied="isCopied" />
      </span>
    </template>
  </PButton>
</template>
