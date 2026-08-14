<script lang="ts" setup>
import type { CalendarDay } from './types'

defineOptions({
  name: 'PCalendarDay',
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
    class="pxd-calendar--grid-cell self-focus-ring outline-none motion-safe:transition-colors"
    :class="[
      compact
        ? 'h-8 flex aspect-square items-center justify-center justify-self-center rounded-md'
        : 'min-h-14 p-2 border-r border-b text-left',
      selected
        ? 'bg-primary text-primary-foreground'
        : 'hover:bg-background-hover active:bg-background-active',
      !day.isCurrentMonth && !selected ? 'text-foreground-secondary opacity-60' : '',
      day.isDisabled ? 'cursor-not-allowed opacity-35' : 'cursor-pointer',
    ]"
    :aria-current="day.isToday ? 'date' : undefined"
    :aria-selected="selected"
    :disabled="day.isDisabled"
    @click="selectDate"
  >
    <span
      class="size-8 inline-flex items-center justify-center rounded-md"
      :class="[day.isToday && !selected ? 'bg-background-active' : '']"
    >
      <slot v-bind="day" :is-selected="selected">{{ day.date }}</slot>
    </span>
  </button>
</template>
