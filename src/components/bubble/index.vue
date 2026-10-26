<script lang="ts" setup>
import type { BubbleProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import PAvatar from '../avatar/index.vue'
import PSpinner from '../spinner/index.vue'

defineOptions({
  name: 'PBubble',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BubbleProps>(), {
  role: 'system',
  variant: 'default',
})

const ariaLabel = computed(() => (props.role === 'user' ? 'User message' : 'System message'))

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-bubble group/bubble sibling:mbs-4 text-sm gap-2 flex max-w-full cursor-default',
    variants: {
      role: {
        user: 'ps-10 flex-row-reverse',
        system: 'pe-10',
        assistant: 'pe-10',
      },
    },
  },
  {
    selection: () => ({ role: props.role }),
  },
)

const { classes: contentClasses } = useTailwindVariant(
  {
    base: 'pxd-bubble--content px-2.5 py-2 relative overflow-hidden rounded-lg border border-gray-alpha-100 break-all whitespace-pre-wrap motion-safe:transition-colors',
    variants: {
      role: {
        user: 'bg-primary text-primary-foreground motion-safe:transition-[filter]',
        system: 'bg-gray-100',
        assistant: 'bg-gray-100',
      },
      variant: {
        default: '',
        ghost: 'bg-background border-transparent text-foreground',
      },
      interactive: {},
    },
    compoundVariants: [
      {
        role: ['system', 'assistant'],
        variant: 'default',
        interactive: true,
        class: 'hover:bg-gray-300',
      },
      {
        role: 'user',
        variant: 'default',
        interactive: true,
        class: 'hover:brightness-90',
      },
      {
        role: 'user',
        variant: 'ghost',
        interactive: true,
        class: 'hover:bg-gray-200',
      },
    ],
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      role: props.role,
      variant: props.variant,
      interactive: props.interactive,
    }),
  },
)
</script>

<template>
  <article
    data-bubble
    :class="classes"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    :data-role="role"
    :data-variant="variant"
    role="article"
    v-bind="attrs"
  >
    <div v-if="avatar" data-bubble-avatar class="pxd-bubble--avatar shrink-0" aria-hidden="true">
      <slot name="avatar">
        <PAvatar :src="avatar" :alt="`${role} avatar`" size="32" />
      </slot>
    </div>

    <div class="pxd-bubble--wrapper gap-1 flex w-max flex-col">
      <header
        v-if="header || $slots.header"
        class="pxd-bubble--header flex items-center text-[0.8125rem] text-foreground-secondary group-data-[role=user]/bubble:justify-end"
      >
        <slot name="header">{{ header }}</slot>
      </header>

      <div :class="contentClasses">
        <PSpinner v-if="loading" class="translate-y-0.5" />
        <template v-else>
          <slot>
            <span>{{ text }}</span>
          </slot>
          <div
            v-if="$slots.reactions"
            class="pxd-bubble--reactions mbs-1.5 gap-2 flex items-center"
          >
            <slot name="reactions" />
          </div>
        </template>
      </div>

      <footer
        v-if="$slots.footer"
        class="pxd-bubble--footer flex items-center group-data-[role=user]/bubble:justify-end"
      >
        <slot name="footer" />
      </footer>
    </div>
  </article>
</template>

<style lang="postcss">
.pxd-bubble:is([data-role='system'], [data-role='assistant']) {
  & + & .pxd-bubble--content {
    border-top-left-radius: 0;
  }

  &:has(+ &) .pxd-bubble--content {
    border-bottom-left-radius: 0;
  }
}

.pxd-bubble[data-role='user'] {
  & + & .pxd-bubble--content {
    border-top-right-radius: 0;
  }

  &:has(+ &) .pxd-bubble--content {
    border-bottom-right-radius: 0;
  }
}
</style>
