<script setup lang="ts">
import { ExternalIcon } from 'gdsi/vue'
import { computed, useAttrs } from 'vue'
import { isExternalLink } from '../../utils/format'
import Button from '../button/index.vue'

interface Props {
  href: string
  text?: string
  type?: 'button' | 'text'
  align?: 'left' | 'center' | 'right'
  target?: '_blank' | '_self' | '_parent' | '_top'
  externalIcon?: boolean
}

type LinkAttrs =
  | {
    as: 'router-link'
    to: string
  }
  | {
    as: 'a'
    href: string
    target?: Props['target']
  }
  | null

defineOptions({
  name: 'PLinkButton',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    type: 'button',
    align: 'left',
    target: '_self',
  },
)

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const attrs = useAttrs()

const alignClassName = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const computedClasses = computed(() => {
  const basic = ['pxd-link-button', alignClassName[props.align]]

  if (props.type === 'text') {
    basic.push('font-medium hover:underline hover:opacity-60 active:opacity-80 motion-safe:transition-opacity')
  }

  return basic
})

const computedAttrs = computed<LinkAttrs>(() => {
  const { href, target, type } = props

  if (!href) {
    return null
  }

  const variant = type === 'text' ? 'simple' : attrs.variant || 'outline'

  if (isExternalLink(href)) {
    return {
      as: 'a',
      href,
      target,
      variant,
      rel: 'noopener noreferrer',
    }
  }

  return {
    as: 'router-link',
    to: href,
    variant,
  }
})

function onLinkClick(ev: MouseEvent) {
  emits('click', ev)
}
</script>

<template>
  <Button
    :class="computedClasses"
    v-bind="computedAttrs"
    @click="onLinkClick"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>

    <slot>
      {{ text }}
    </slot>

    <template #suffix>
      <slot name="suffix" />
      <ExternalIcon v-if="externalIcon" class="opacity-50 scale-y-90" />
    </template>
  </Button>
</template>
