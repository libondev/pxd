<script setup lang="ts">
import { ExternalIcon } from 'gdsi/vue'
import Button from '../button/index.vue'

interface Props {
  href: string
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

defineOptions({
  name: 'PLinkButton',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    align: 'left',
    target: '_self',
  },
)

const alignClassName = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

function linkAttrs(): LinkAttrs {
  const firstChar = props.href.slice(0, 1)

  if (['#', '/'].includes(firstChar)) {
    return {
      as: 'router-link',
      to: props.href,
    }
  }

  return {
    as: 'a',
    href: props.href,
    target: props.target,
  }
}
</script>

<template>
  <Button
    v-bind="linkAttrs()"
    rel="noopener noreferrer"
    class="pxd-link-button"
    :class="alignClassName[align]"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>

    <slot />

    <template #suffix>
      <slot name="suffix" />
      <ExternalIcon v-if="externalIcon" class="opacity-50 scale-y-90" />
    </template>
  </Button>
</template>
