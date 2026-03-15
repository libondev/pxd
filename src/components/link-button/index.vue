<script setup lang="ts">
import ExternalIcon from '@gdsicon/vue/external'
import { computed } from 'vue'

import type { LinkButtonEmits, LinkButtonProps } from './types'

import { isExternalLink } from '../../utils/format'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PLinkButton',
})

const props = withDefaults(defineProps<LinkButtonProps>(), {
  align: 'left',
  target: '_self',
})

const emits = defineEmits<LinkButtonEmits>()

const computedAttrs = computed(() => {
  const { externalIcon, text, href, ...restProps } = props

  const baseAttrs = {
    ...restProps,
    class: 'pxd-link-button',
    rel: 'noopener noreferrer',
    onClick: onLinkClick,
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
  <PButton v-bind="computedAttrs">
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
