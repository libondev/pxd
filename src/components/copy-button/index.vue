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

    <Transition
      name="pxd-transition--fade-scale"
      mode="out-in"
      class="pxd-copy-button--icon shrink-0"
    >
      <CheckIcon v-if="isCopied" />
      <CopyIcon v-else />
    </Transition>

    <template v-if="$slots.suffix" #suffix>
      <span class="shrink-0">
        <slot name="suffix" :copied="isCopied" />
      </span>
    </template>
  </PButton>
</template>
