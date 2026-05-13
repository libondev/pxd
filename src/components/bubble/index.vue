<script lang="ts" setup>
import type { BubbleProps } from './types'
import { computed } from 'vue'
import PAvatar from '../avatar/index.vue'

defineOptions({
  name: 'PBubble',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BubbleProps>(), {
  role: 'system',
})

const ariaLabel = computed(() => (props.role === 'user' ? 'User message' : 'System message'))
</script>

<template>
  <article
    class="pxd-bubble group/bubble [&+&]:mt-2 gap-2 flex max-w-full data-[role='user']:flex-row-reverse"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    :data-role="role"
    role="article"
    v-bind="$attrs"
  >
    <div v-if="avatar" data-bubble-avatar class="pxd-bubble--avatar shrink-0" aria-hidden="true">
      <slot name="avatar">
        <PAvatar :src="avatar" :alt="`${role} avatar`" size="32" />
      </slot>
    </div>

    <div
      class="pxd-bubble--wrapper text-sm gap-1 flex w-max max-w-[calc(100%-2.5rem)] flex-col [[data-bubble-avatar]+&]:max-w-[calc(100%-5rem)]"
    >
      <header
        v-if="header || $slots.header"
        class="pxd-bubble--header flex cursor-default items-center text-13 text-foreground-secondary group-data-[role='user']/bubble:justify-end"
      >
        <slot name="header">
          {{ header }}
        </slot>
      </header>

      <div
        class="pxd-bubble--content py-2 px-3 overflow-hidden rounded-md border border-gray-alpha-100 bg-background-100 bg-gray-100 break-all whitespace-pre-wrap group-data-[role='system']/bubble:rounded-tl-none group-data-[role='user']/bubble:rounded-tr-none"
      >
        <PSpinner v-if="loading" class="translate-y-0.5" />
        <slot v-else>{{ text }}</slot>
      </div>

      <footer
        v-if="$slots.footer"
        class="pxd-bubble--footer flex items-center group-data-[role='user']/bubble:justify-end"
      >
        <slot name="footer" />
      </footer>
    </div>
  </article>
</template>
