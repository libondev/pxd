<script lang="ts" setup>
import type { ContextUsageProps } from './types'
import { computed, ref } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'

defineOptions({
  name: 'PContextUsage',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ContextUsageProps>(), {
  legend: true,
})

const TINT_STEP = 10
const TINT_FLOOR = 20
const DIM_OPACITY = 0.2

const hoveredIndex = ref<number | null>(null)

const usedTokens = computed(() => props.data.reduce((sum, segment) => sum + segment.tokens, 0))

const usedPercentage = computed(() => {
  if (props.total <= 0) {
    return 0
  }

  return Math.round(Math.min((usedTokens.value / props.total) * 100, 100))
})

const freeTokens = computed(() => Math.max(props.total - usedTokens.value, 0))

const items = computed(() =>
  [...props.data]
    .sort((a, b) => b.tokens - a.tokens)
    .map((segment, index) => ({
      ...segment,
      tint: Math.max(100 - index * TINT_STEP, TINT_FLOOR),
      percentage: props.total > 0 ? (segment.tokens / props.total) * 100 : 0,
    })),
)

const viewItems = computed(() =>
  items.value.map((item, index) => {
    const isDimmed = hoveredIndex.value !== null && hoveredIndex.value !== index

    return {
      ...item,
      color: `color-mix(in srgb, var(--color-primary) ${item.tint}%, var(--color-background-100))`,
      opacity: isDimmed ? DIM_OPACITY : 1,
    }
  }),
)

const configProvider = useConfigProvider()
const { classes, attrs } = useTailwindVariant(
  {
    base: 'pxd-context-usage--track flex w-full overflow-hidden rounded-full bg-gray-200',
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-2.5',
      },
    },
  },
  {
    selection: () => ({ size: props.size || configProvider.size }),
  },
)

function onItemEnter(index: number) {
  hoveredIndex.value = index
}

function onItemLeave() {
  hoveredIndex.value = null
}
</script>

<template>
  <div
    data-context-usage
    role="meter"
    aria-label="Context usage"
    class="pxd-context-usage gap-2 flex w-full flex-col"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="usedPercentage"
    :aria-valuetext="usedPercentage + '% used'"
    v-bind="attrs"
  >
    <div :class="classes" aria-hidden="true">
      <div
        v-for="(item, index) in viewItems"
        :key="index"
        class="pxd-context-usage--segment basis-0 min-w-[1%] border-l bg-(--context-usage-color) motion-safe:transition-opacity"
        :style="{
          '--context-usage-color': item.color,
          flexGrow: item.tokens,
          opacity: item.opacity,
        }"
        @pointerenter="onItemEnter(index)"
        @pointerleave="onItemLeave()"
      />
      <div
        class="pxd-context-usage--free basis-0 pointer-events-none"
        :style="{ flexGrow: freeTokens }"
      />
    </div>

    <ul v-if="legend" class="pxd-context-usage--legend gap-1 flex flex-col">
      <li
        v-for="(item, index) in viewItems"
        :key="index"
        class="min-w-0 gap-2 text-sm m-0! flex cursor-default items-center motion-safe:transition-opacity"
        :style="{ opacity: item.opacity }"
        @pointerenter="onItemEnter(index)"
        @pointerleave="onItemLeave()"
      >
        <i
          aria-hidden="true"
          class="pxd-context-usage--dot size-2 shrink-0 rounded-full bg-(--context-usage-color)"
          :style="{ '--context-usage-color': item.color }"
        />
        <span class="min-w-0 flex-1 truncate text-foreground-secondary">{{ item.name }}</span>
        <span class="text-gray-900">{{ item.percentage.toFixed(1) }}%</span>
      </li>
    </ul>
  </div>
</template>
