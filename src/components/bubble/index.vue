<script lang="ts" setup>
import type { BubbleProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import PAvatar from '../avatar/index.vue'

defineOptions({
  name: 'PBubble',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BubbleProps>(), {
  role: 'system',
  variant: 'default',
})

const { attrs, classes: bubbleClasses } = useTailwindVariant({
  base: 'pxd-bubble group/bubble [&+&]:mt-2 gap-2 flex max-w-full',
  variants: {
    role: {
      user: 'pl-10 flex-row-reverse',
      system: 'pr-10',
    },
  },
})

const { classes: bubbleContentClasses } = useTailwindVariant(
  {
    base: 'pxd-bubble--content py-2 px-3 overflow-hidden rounded-md border border-gray-alpha-100 break-all whitespace-pre-wrap',
    variants: {
      role: {
        user: 'rounded-tr-none bg-primary text-primary-foreground',
        system: 'rounded-tl-none bg-gray-100',
      },
      variant: {},
    },
    compoundVariants: [
      {
        variant: 'ghost',
        class: 'bg-background border-transparent text-foreground',
      },
    ],
  },
  {
    mergeAttrsClass: false,
  },
)

const computedClasses = computed(() => {
  const { role } = props

  return bubbleClasses({
    role,
  })
})

const computedContentClasses = computed(() => {
  const { role, variant } = props

  return bubbleContentClasses({
    role,
    variant,
  })
})

const ariaLabel = computed(() => (props.role === 'user' ? 'User message' : 'System message'))
</script>

<template>
  <article
    :class="computedClasses"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    :data-role="role"
    role="article"
    v-bind="attrs"
  >
    <div v-if="avatar" data-bubble-avatar class="pxd-bubble--avatar shrink-0" aria-hidden="true">
      <slot name="avatar">
        <PAvatar :src="avatar" :alt="`${role} avatar`" size="32" />
      </slot>
    </div>

    <div class="pxd-bubble--wrapper text-sm gap-1 flex w-max flex-col">
      <header
        v-if="header || $slots.header"
        class="pxd-bubble--header flex cursor-default items-center text-13 text-foreground-secondary group-data-[role=user]/bubble:justify-end"
      >
        <slot name="header">
          {{ header }}
        </slot>
      </header>

      <div :class="computedContentClasses">
        <PSpinner v-if="loading" class="translate-y-0.5" />
        <slot v-else>{{ text }}</slot>
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
