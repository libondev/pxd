<script lang="ts" setup>
import type { ButtonProps } from './types'
import { computed } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { BASIC_HEIGHTS, SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useButtonGroupContext } from '../../contexts/button.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp } from '../../utils/format.js'
import PSpinner from '../spinner/index.vue'

defineOptions({
  name: 'PButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ButtonProps>(), {
  iconOnly: false,
  shape: 'default',
  as: 'button',
})

const configProvider = useConfigProvider()
const buttonGroupContext = useButtonGroupContext()

const isDisabled = computed<boolean>(
  () =>
    isTruthyProp(props.disabled) ||
    isTruthyProp(props.loading) ||
    buttonGroupContext?.props.disabled ||
    false,
)

const computedVariant = computed(() => {
  return props.variant || buttonGroupContext?.props.variant || 'default'
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-button inline-flex shrink-0 cursor-pointer touch-manipulation items-center font-inherit select-none focus-visible:z-1 motion-safe:transition-appearance within-group:not-first:rounded-l-none within-group:not-first:border-l-0 within-group:not-last:rounded-r-none',
    variants: {
      size: {
        xxs: `${BASIC_HEIGHTS.xxs} gap-0.5 px-0.5 rounded-sm ${SIZE_TEXT_CLASS.xxs}`,
        xs: `${BASIC_HEIGHTS.xs} gap-1 px-1 rounded-sm ${SIZE_TEXT_CLASS.xs}`,
        sm: `${BASIC_HEIGHTS.sm} gap-1 px-2 rounded-md ${SIZE_TEXT_CLASS.sm}`,
        md: `${BASIC_HEIGHTS.md} gap-1.5 px-3 rounded-md ${SIZE_TEXT_CLASS.md}`,
        lg: `${BASIC_HEIGHTS.lg} gap-1.5 px-4 rounded-lg ${SIZE_TEXT_CLASS.lg}`,
      },
      shape: {
        square: 'rounded-none',
        rounded: 'rounded-full',
        default: '',
      },
      variant: {
        simple: '',
        link: 'font-medium hover:underline hover:opacity-70 active:opacity-90 motion-safe:transition-opacity',
        default: 'bg-background-100 text-foreground hover:bg-gray-200 active:bg-gray-300',
        ghost:
          'border-transparent bg-transparent text-foreground hover:bg-background-hover active:bg-background-active',
        primary:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        error: 'text-white border-transparent bg-red-800 hover:bg-red-700 active:bg-red-900',
        warning:
          'text-black border-transparent bg-amber-800 hover:bg-amber-700 active:bg-amber-900',
        success:
          'text-white border-transparent bg-green-900 hover:bg-green-700 active:bg-green-800',
      },
      disabled: {
        true: 'is-disabled hover:bg-gray-100 active:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700',
      },
      fullWidth: {
        true: 'w-full',
      },
      iconOnly: {
        true: 'px-0 aspect-square',
        false: 'within-group:flex-1',
      },
      align: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
        between: 'justify-between',
      },
    },
    compoundVariants: [
      {
        variant: ['default', 'ghost', 'primary', 'error', 'warning', 'success'],
        class: 'border self-focus-ring outline-none',
      },
    ],
  },
  {
    selection: () => {
      const { size, shape, fullWidth, iconOnly, align } = props
      const isIconOnly = iconOnly ? 'center' : align
      const fallbackAlign = isIconOnly || buttonGroupContext?.props.align || 'center'

      return {
        size: size || buttonGroupContext?.props.size || configProvider.size,
        shape: buttonGroupContext ? 'default' : shape,
        variant: computedVariant.value,
        fullWidth,
        disabled: isDisabled.value,
        iconOnly,
        align: fallbackAlign,
      }
    },
  },
)

useAgentNode({
  name: 'button',
  state: () => ({
    disabled: isDisabled.value,
    loading: props.loading ?? false,
  }),
  actions: {},
})
</script>

<template>
  <Component
    data-button
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    tabindex="0"
    :aria-busy="loading"
    :aria-disabled="isDisabled"
    :class="classes"
    :data-icon-only="iconOnly"
    :data-variant="computedVariant"
    :disabled="isDisabled"
    v-bind="attrs"
  >
    <PSpinner v-if="!iconOnly && loading" />
    <slot v-else-if="!loading" name="prefix" />

    <span class="min-w-0 flex items-center whitespace-nowrap">
      <PSpinner v-if="iconOnly && loading" />
      <slot v-else>{{ text }}</slot>
    </span>

    <slot name="suffix" />
  </Component>
</template>
