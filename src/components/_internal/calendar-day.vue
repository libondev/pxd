<script lang="ts" setup>
import type { CalendarDay } from '../calendar/types'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'

defineOptions({
  name: 'PCalendarDay',
  inheritAttrs: false,
})

const props = defineProps<{
  day: CalendarDay
  selected: boolean
  compact: boolean
}>()

const emits = defineEmits<{
  change: [day: CalendarDay]
}>()

const { attrs, classes: cellClasses } = useTailwindVariant(
  {
    base: 'pxd-calendar--grid-cell shrink-0 self-focus-ring outline-none motion-safe:transition-colors',
    variants: {
      compact: {
        true: 'min-h-8 sm:text-sm flex aspect-square items-center justify-center justify-self-center rounded-md',
        false: 'min-h-14 p-2 border-r border-b text-left',
      },
      selected: {
        true: 'bg-primary text-primary-foreground',
        false: 'hover:bg-background-hover active:bg-background-active',
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      compact: props.compact,
      selected: props.selected,
      disabled: props.day.isDisabled,
    }),
  },
)

const { classes: dateClasses } = useTailwindVariant(
  {
    base: 'min-w-8 min-h-8 inline-flex items-center justify-center rounded-md',
    variants: {
      today: {
        true: 'bg-background-active',
      },
      outsideMonth: {
        true: 'text-foreground-secondary opacity-60',
      },
      disabled: {
        true: 'opacity-35',
      },
    },
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      today: props.day.isToday && !props.selected,
      outsideMonth: !props.day.isCurrentMonth && !props.selected,
      disabled: props.day.isDisabled,
    }),
  },
)

function selectDate() {
  if (props.day.isDisabled) {
    return
  }

  emits('change', props.day)
}
</script>

<template>
  <button
    data-calendar-day
    type="button"
    role="gridcell"
    :class="cellClasses"
    :aria-current="day.isToday ? 'date' : undefined"
    :aria-selected="selected"
    :disabled="day.isDisabled"
    v-bind="attrs"
    @click="selectDate"
  >
    <span :class="dateClasses">
      <slot v-bind="day" :is-selected="selected">{{ day.date }}</slot>
    </span>
  </button>
</template>
