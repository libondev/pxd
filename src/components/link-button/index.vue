<script setup lang="ts">
import type { ButtonVariant } from '../../types/components/button'
import ExternalIcon from '@gdsicon/vue/external'
import { computed, useAttrs } from 'vue'
import { isExternalLink } from '../../utils/format'
import PButton from '../button/index.vue'

interface Props {
  href: string
  text?: string
  align?: 'left' | 'center' | 'right'
  target?: '_blank' | '_self' | '_parent' | '_top'
  variant?: ButtonVariant
  externalIcon?: boolean
}

defineOptions({
  name: 'PLinkButton',
})

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  target: '_self',
})

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const attrs = useAttrs()

const linkButtonAttrs = computed(() => {
  const { externalIcon, text, href, ...restProps } = props

  const baseAttrs = {
    ...attrs,
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
  <PButton v-bind="linkButtonAttrs">
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
