<script lang="ts" setup>
import type { LinkButtonEmits, LinkButtonProps } from './types'
import ExternalIcon from '@gdsicon/vue/external'
import { computed, useAttrs } from 'vue'
import { isExternalLink } from '../../utils/format'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PLinkButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<LinkButtonProps>(), {
  align: 'left',
  target: '_self',
})

const emits = defineEmits<LinkButtonEmits>()

const attrs = useAttrs()

const computedAttrs = computed(() => {
  const { align, target, href } = props

  const baseAttrs = {
    align,
    target,
    rel: 'noopener noreferrer',
    ...attrs,
  }

  if (!href) {
    return baseAttrs
  }

  if (isExternalLink(href)) {
    return {
      ...baseAttrs,
      as: 'a',
      href,
    } as const
  }

  return {
    ...baseAttrs,
    as: 'router-link',
    to: href,
  } as const
})

function onLinkClick(ev: MouseEvent) {
  emits('click', ev)
}
</script>

<template>
  <PButton class="pxd-link-button" v-bind="computedAttrs" @click="onLinkClick">
    <template #prefix>
      <slot name="prefix" />
    </template>

    <slot>
      {{ text }}
    </slot>

    <template #suffix>
      <slot name="suffix" />
      <ExternalIcon v-if="externalIcon" class="text-xs scale-y-90 opacity-50" />
    </template>
  </PButton>
</template>
