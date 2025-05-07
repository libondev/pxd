<script setup lang="ts">
import { ExternalIcon } from 'gdsi/vue'
import { computed } from 'vue'
import { isExternalLink } from '../../utils/format'
import Button from '../button/index.vue'

interface Props {
  href: string
  text?: string
  shape?: 'button' | 'text'
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

const alignClassName = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const computedClasses = computed(() => {
  const basic = ['pxd-link-button !no-underline', alignClassName[props.align]]

  if (props.shape === 'text') {
    basic.push('!p-0 !h-auto font-medium border-none hover:!bg-transparent hover:!underline active:opacity-60 motion-safe:transition-opacity')
  }

  return basic
})

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
      rel: 'noopener noreferrer',
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
