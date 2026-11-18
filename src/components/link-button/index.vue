<script lang="ts" setup>
import type { LinkButtonEmits, LinkButtonProps } from './types'
import ExternalIcon from '@gdsicon/vue/external'
import { computed, getCurrentInstance, useAttrs } from 'vue'
import { isExternalLink } from '../../utils/format.js'
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

const hasRouterLink = Boolean(getCurrentInstance()?.appContext.components.RouterLink)
const attrs = useAttrs()

const linkAttrs = computed(() => {
  const { href, target } = props

  if (!href) {
    return { as: 'button', type: 'button' }
  }

  if (isExternalLink(href)) {
    return { as: 'a', href, target, rel: attrs.rel ?? 'noopener noreferrer' }
  }

  return hasRouterLink ? { as: 'router-link', to: href } : { as: 'a', href }
})

const buttonAttrs = computed(() => ({ ...attrs, ...linkAttrs.value }))

function onLinkClick(event: MouseEvent) {
  emits('click', event)
}
</script>

<template>
  <PButton
    data-link-button
    class="pxd-link-button"
    v-bind="buttonAttrs"
    :align="align"
    @click="onLinkClick"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>

    <template v-if="$slots.default" #default>
      <slot />
    </template>

    <template v-if="$slots.suffix || externalIcon" #suffix>
      <ExternalIcon v-if="externalIcon" class="text-xs scale-y-90 opacity-50" />
      <slot name="suffix" />
    </template>
  </PButton>
</template>
