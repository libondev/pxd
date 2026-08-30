<script lang="ts" setup>
import type { CalendarDay } from '../calendar/types'
import { createTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'

const cellClasses = createTailwindVariant({
  base: 'pxd-calendar--grid-cell self-focus-ring outline-none motion-safe:transition-colors',
  variants: {
    compact: {
      true: 'h-8 flex aspect-square items-center justify-center justify-self-center rounded-md',
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
})

const dateClasses = createTailwindVariant({
  base: 'size-8 inline-flex items-center justify-center rounded-md',
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
})

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
  select: [day: CalendarDay]
}>()

function selectDate() {
  if (props.day.isDisabled) {
    return
  }

  emits('select', props.day)
}
</script>

<template>
  <button
    type="button"
    role="gridcell"
    :class="
      cellClasses({
        compact,
        selected,
        disabled: day.isDisabled,
      })
    "
    :aria-current="day.isToday ? 'date' : undefined"
    :aria-selected="selected"
    :disabled="day.isDisabled"
    v-bind="$attrs"
    @click="selectDate"
  >
    <span
      :class="
        dateClasses({
          today: day.isToday && !selected,
          outsideMonth: !day.isCurrentMonth && !selected,
          disabled: day.isDisabled,
        })
      "
    >
      <slot v-bind="day" :is-selected="selected">{{ day.date }}</slot>
    </span>
  </button>
</template>
