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

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-bubble group/bubble [&+&]:mt-2 gap-2 flex max-w-full',
    variants: {
      role: {
        user: 'pl-10 flex-row-reverse',
        system: 'pr-10',
        assistant: 'pr-10',
      },
    },
  },
  {
    selection: () => ({ role: props.role }),
  },
)

const { classes: contentClasses } = useTailwindVariant(
  {
    base: 'pxd-bubble--content p-2 relative overflow-hidden rounded-md border border-gray-alpha-100 break-all whitespace-pre-wrap motion-safe:transition-colors',
    variants: {
      role: {
        user: 'bg-primary text-primary-foreground hover:brightness-85 motion-safe:transition-[filter]',
        system: 'bg-gray-100 hover:bg-gray-300',
        assistant: 'bg-gray-100 hover:bg-gray-300',
      },
      variant: {},
    },
    compoundVariants: [
      {
        variant: 'ghost',
        class: 'bg-background border-transparent text-foreground hover:bg-gray-200',
      },
    ],
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      role: props.role,
      variant: props.variant,
    }),
  },
)

const ariaLabel = computed(() => (props.role === 'user' ? 'User message' : 'System message'))
</script>

<template>
  <article
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

    <div class="pxd-bubble--wrapper text-sm gap-1 flex w-max flex-col">
      <header
        v-if="header || $slots.header"
        class="pxd-bubble--header flex cursor-default items-center text-13 text-foreground-secondary group-data-[role=user]/bubble:justify-end"
      >
        <slot name="header">
          {{ header }}
        </slot>
      </header>

      <div :class="contentClasses">
        <PSpinner v-if="loading" class="translate-y-0.5" />
        <template v-else>
          <slot>{{ text }}</slot>
          <div v-if="$slots.reactions" class="pxd-bubble--reactions">
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
