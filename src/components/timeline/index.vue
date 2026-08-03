<script lang="ts" setup>
import type { TimelineProps } from './types'
import type { VNode } from 'vue'
import { Fragment, useSlots } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'

defineOptions({
  name: 'PTimeline',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TimelineProps>(), {
  mode: 'start',
})

const slots = useSlots()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-timeline m-0 w-full max-w-full list-none',
    variants: {
      mode: {
        start: 'is-start pl-10',
        end: 'is-end pr-10',
        alternate: 'is-alternate px-5',
        'alternate-reverse': 'is-alternate-reverse px-5',
        horizontal: 'is-horizontal p-0 flex overflow-x-auto overflow-y-hidden',
      },
    },
  },
  {
    selection: () => ({
      mode: props.mode,
    }),
  },
)

function flattenItems(children: VNode[]): VNode[] {
  return children.flatMap((child) => {
    if (child.type === Fragment && Array.isArray(child.children)) {
      return flattenItems(child.children as VNode[])
    }

    return child
  })
}

function TimelineItems() {
  const children = flattenItems(slots.default?.() ?? [])
  return props.reverse ? [...children].reverse() : children
}
</script>

<template>
  <ul :class="classes" v-bind="attrs">
    <TimelineItems />
  </ul>
</template>

<style>
.pxd-timeline.is-end .pxd-timeline-item--wrapper {
  text-align: right;
}

.pxd-timeline.is-end .pxd-timeline-item--tail {
  right: 0.25rem;
  left: auto;
}

.pxd-timeline.is-end .pxd-timeline-item--node {
  right: 0;
  left: auto;
}

.pxd-timeline:is(.is-alternate, .is-alternate-reverse) .pxd-timeline-item--tail,
.pxd-timeline:is(.is-alternate, .is-alternate-reverse) .pxd-timeline-item--node,
.pxd-timeline:is(.is-alternate, .is-alternate-reverse) .pxd-timeline-item--dot {
  left: 50%;
  transform: translateX(-50%);
}

.pxd-timeline.is-alternate .pxd-timeline-item:nth-child(odd) .pxd-timeline-item--wrapper,
.pxd-timeline.is-alternate-reverse .pxd-timeline-item:nth-child(even) .pxd-timeline-item--wrapper {
  left: 50%;
  width: 50%;
}

.pxd-timeline.is-alternate .pxd-timeline-item:nth-child(even) .pxd-timeline-item--wrapper,
.pxd-timeline.is-alternate-reverse .pxd-timeline-item:nth-child(odd) .pxd-timeline-item--wrapper {
  width: 50%;
  text-align: right;
}

.pxd-timeline.is-horizontal .pxd-timeline-item {
  display: grid;
  grid-template-columns: 0.625rem minmax(0, 1fr);
  grid-template-rows: 0.625rem auto;
  flex: 1 0 12rem;
  min-width: 0;
  padding: 0;
}

.pxd-timeline.is-horizontal .pxd-timeline-item--tail {
  position: relative;
  top: 0.25rem;
  right: auto;
  left: auto;
  grid-row: 1;
  grid-column: 2;
  width: auto;
  height: 0;
  margin-left: 0;
  border-top: 2px solid var(--color-gray-300);
  border-left: 0;
}

.pxd-timeline.is-horizontal .pxd-timeline-item--node {
  position: relative;
  grid-row: 1;
  grid-column: 1;
}

.pxd-timeline.is-horizontal .pxd-timeline-item--dot {
  position: relative;
  left: auto;
  grid-row: 1;
  grid-column: 1;
  transform: none;
}

.pxd-timeline.is-horizontal .pxd-timeline-item--wrapper {
  top: 0;
  grid-row: 2;
  grid-column: 1 / -1;
  max-width: none;
  padding: 0;
  margin-top: 0.75rem;
}

.pxd-timeline.is-horizontal .pxd-timeline-item--content {
  overflow-wrap: break-word;
}
</style>
