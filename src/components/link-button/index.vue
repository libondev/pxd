<script setup lang="ts">
import { ExternalIcon } from 'gdsi/vue'
import { computed } from 'vue'
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
  | null

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

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const alignClassName = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const computedAttrs = computed<LinkAttrs>(() => {
  if (!props.href) {
    return null
  }

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
})

function onLinkClick(ev: MouseEvent) {
  emits('click', ev)
}
</script>

<template>
  <Button
    role="link"
    rel="noopener noreferrer"
    class="pxd-link-button !no-underline"
    :class="alignClassName[align]"
    v-bind="computedAttrs"
    @click="onLinkClick"
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
