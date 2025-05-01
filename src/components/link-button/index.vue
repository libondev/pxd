<script setup lang="ts">
import { ExternalIcon } from 'gdsi/vue'
import { computed } from 'vue'
import { isExternalLink } from '../../utils/format'
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
  const { href, target } = props

  if (!href) {
    return null
  }

  if (isExternalLink(href)) {
    return {
      as: 'a',
      href,
      target,
    }
  }

  return {
    as: 'router-link',
    to: href,
  }
})

function onLinkClick(ev: MouseEvent) {
  emits('click', ev)
}
</script>

<template>
  <Button
    role="link"
    tabindex="0"
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
