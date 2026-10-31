<script lang="ts" setup>
import type { ComponentSize } from '../../types/shared/props'
import type {
  TodoChangeDetail,
  TodoEmits,
  TodoItemKey,
  TodoOption,
  TodoProps,
  TodoStats,
  TodoStatus,
} from './types'
import CheckIcon from '@gdsicon/vue/check'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import ListUnorderedIcon from '@gdsicon/vue/list-unordered'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import MinusIcon from '@gdsicon/vue/minus'
import { computed, shallowRef, useSlots, watch } from 'vue'
import { useDetailsCollapse } from '../../composables/_internal/use-details-collapse.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'

defineOptions({
  name: 'PTodoList',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
})

const props = withDefaults(defineProps<TodoProps>(), {
  variant: 'default',
  options: () => [],
  readonly: false,
  expand: true,
})
const emits = defineEmits<TodoEmits>()

const MARKER_CLASSES: Record<TodoStatus, string> = {
  pending: 'border-2 border-gray-alpha-400',
  in_progress: '',
  completed: 'bg-teal-600 text-white',
  canceled: 'bg-gray-alpha-400 text-white',
}

const SIZE_CLASSES: Record<
  ComponentSize,
  {
    header: string
    list: string
    marker: string
    meta: string
  }
> = {
  sm: {
    header: 'p-2',
    list: 'py-2 ps-2 gap-1',
    marker: 'p-0.75',
    meta: 'text-xs',
  },
  md: {
    header: 'px-2.5 py-2',
    list: 'py-2 ps-2 gap-1.5',
    marker: 'p-1',
    meta: 'text-sm',
  },
  lg: {
    header: 'px-3 py-2.5',
    list: 'py-3 ps-3 gap-2',
    marker: 'p-1.5',
    meta: 'text-base',
  },
}

const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
  canceled: 'pending',
}

const innerValue = shallowRef<TodoOption[] | undefined>(props.defaultValue)
const contentRef = shallowRef<HTMLElement>()

const currentOptions = computed(() => props.modelValue ?? innerValue.value ?? props.options)
const stats = computed<TodoStats>(() => {
  const options = currentOptions.value
  const result: TodoStats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    canceled: 0,
    total: options.length,
  }

  for (const item of options) {
    const status = resolveStatus(item)

    if (status === 'in_progress') {
      result.inProgress++
    } else if (status === 'completed') {
      result.completed++
    } else if (status === 'canceled') {
      result.canceled++
    } else {
      result.pending++
    }
  }

  return result
})
const summaryText = computed(() => {
  const { inProgress, pending, total, canceled } = stats.value
  const totalCount = total - canceled
  const currentCount = totalCount - inProgress - pending

  return totalCount > 0 ? `${currentCount}/${totalCount}` : ''
})

const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)
const emptyText = computed(() => props.empty ?? configProvider.locale.results.noData)

const slots = useSlots()

const hasItemSlot = computed(() => !!slots.item)
const hasEmptySlot = computed(() => !!slots.empty)
const hasItemContentSlot = computed(() => !!slots['item-content'])

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-todo-list group/todo w-full max-w-full',
    variants: {
      size: {
        sm: 'rounded-lg text-[13px]',
        md: 'text-sm',
        lg: 'text-base',
      },
      variant: {
        default: 'rounded-xl border bg-background-100',
        simple: '',
      },
    },
  },
  {
    selection: () => ({ variant: props.variant, size: computedSize.value }),
  },
)

const { isOpen, detailsOpen, onToggleClick, onDetailsToggle } = useDetailsCollapse(
  contentRef,
  () => props.expand,
)

function resolveStatus(item: TodoOption): TodoStatus {
  return item.status ?? 'pending'
}
function commit(index: number, status: TodoStatus) {
  const prev = currentOptions.value[index]

  if (!prev) {
    return
  }

  const prevStatus = resolveStatus(prev)

  if (prevStatus === status) {
    return
  }

  const item: TodoOption = { ...prev, status }
  const options = currentOptions.value.map((option, i) => (i === index ? item : option))

  if (props.modelValue === undefined) {
    innerValue.value = options
  }

  const detail: TodoChangeDetail = { item, index, status, prevStatus, options }

  emits('change', detail)
  emits('update:model-value', options)
}

function onItemClick(index: number, item: TodoOption) {
  if (props.readonly || item.disabled) {
    return
  }

  commit(index, NEXT_STATUS[resolveStatus(item)])
}

function resolveIndex(target: TodoItemKey): number {
  const byId = currentOptions.value.findIndex((item) => item.id === target)

  return byId > -1 ? byId : (target as number)
}

function setStatus(target: TodoItemKey, status: TodoStatus) {
  if (props.readonly) {
    return
  }

  const index = resolveIndex(target)

  if (index < 0 || index >= currentOptions.value.length) {
    return
  }

  commit(index, status)
}

function start(target: TodoItemKey) {
  setStatus(target, 'in_progress')
}

function complete(target: TodoItemKey) {
  setStatus(target, 'completed')
}

function cancel(target: TodoItemKey) {
  setStatus(target, 'canceled')
}

function reset(target: TodoItemKey) {
  setStatus(target, 'pending')
}

watch(
  () => props.options,
  (options) => {
    if (props.modelValue === undefined) {
      innerValue.value = options
    }
  },
)

defineExpose({
  stats,
  start,
  complete,
  cancel,
  reset,
})
</script>

<template>
  <details
    data-todo-list
    :class="classes"
    :open="detailsOpen"
    v-bind="attrs"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-todo-list--header group/todo gap-2 flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center border-none bg-transparent font-inherit self-focus-ring outline-none select-none"
      :class="
        variant === 'default'
          ? ['font-medium text-foreground', SIZE_CLASSES[computedSize].header]
          : 'text-foreground-secondary hover:text-foreground motion-safe:transition-colors'
      "
      @click.prevent="onToggleClick"
    >
      <ListUnorderedIcon class="size-em shrink-0" />

      <slot
        name="header"
        :expanded="isOpen"
        :stats="stats"
        :title="title"
        :summary="summaryText"
      >
        <span class="pxd-todo-list--title min-w-0 truncate">
          {{ title }}
        </span>

        <span
          v-if="summaryText"
          class="pxd-todo-list--summary font-normal shrink-0 text-foreground-secondary"
          :class="SIZE_CLASSES[computedSize].meta"
          aria-live="polite"
        >
          {{ summaryText }}
        </span>
      </slot>

      <ChevronRightIcon
        class="size-em shrink-0 text-foreground-secondary motion-safe:transition-transform-opacity"
        :class="{
          'rotate-90 opacity-100': isOpen,
          'ml-auto': variant === 'default',
          'opacity-0 group-hover:opacity-100': variant === 'simple',
        }"
      />
    </summary>

    <div
      ref="contentRef"
      class="grid-template-cols-1fr grid overflow-hidden motion-safe:transition-[grid-template-rows]"
      :class="isOpen ? 'grid-template-rows-1fr' : 'grid-template-rows-0fr'"
    >
      <ul
        class="pxd-todo-list--content m-0 max-h-40 flex scrollbar-gutter-stable list-none flex-col overflow-y-auto"
        :class="[
          SIZE_CLASSES[computedSize].list,
          {
            'border-t': variant === 'default',
            'ms-1.5 mbs-1.5 border-l': variant === 'simple',
          },
        ]"
      >
        <li
          v-if="currentOptions.length === 0"
          class="pxd-todo-list--empty text-foreground-secondary"
        >
          <slot v-if="hasEmptySlot" name="empty" />
          <template v-else>{{ emptyText }}</template>
        </li>

        <template v-for="(item, index) in currentOptions" :key="item.id ?? index">
          <li
            v-if="hasItemSlot"
            class="pxd-todo-list--item gap-2 flex items-center"
            :data-status="resolveStatus(item)"
            @click="onItemClick(index, item)"
          >
            <slot
              name="item"
              :item="item"
              :index="index"
              :status="resolveStatus(item)"
              :toggle="() => onItemClick(index, item)"
            />
          </li>

          <li
            v-else
            class="pxd-todo-list--item gap-2 flex items-center"
            :class="{
              'cursor-pointer': !readonly && !item.disabled,
              'opacity-50': item.disabled,
            }"
            :data-status="resolveStatus(item)"
            @click="onItemClick(index, item)"
          >
            <button
              class="pxd-todo-list--indicator p-0 block size-em shrink-0 border-none bg-transparent leading-none text-inherit self-focus-ring"
              type="button"
              :disabled="readonly || item.disabled"
              :aria-label="item.content == null ? undefined : String(item.content)"
              @click.stop="onItemClick(index, item)"
            >
              <LoaderCircleIcon
                v-if="resolveStatus(item) === 'in_progress'"
                class="motion-safe:animate-spin block size-full text-blue-900"
              />

              <span
                v-else
                class="pxd-todo-list--marker block size-full rounded-full"
                :class="[MARKER_CLASSES[resolveStatus(item)], SIZE_CLASSES[computedSize].marker]"
              >
                <CheckIcon v-if="resolveStatus(item) === 'completed'" class="block size-full" />
                <MinusIcon v-else-if="resolveStatus(item) === 'canceled'" class="block size-full" />
              </span>
            </button>

            <div class="pxd-todo-list--body min-w-0 flex-1">
              <div v-if="hasItemContentSlot" class="pxd-todo-list--text min-w-0">
                <slot
                  name="item-content"
                  :item="item"
                  :index="index"
                  :status="resolveStatus(item)"
                />
              </div>

              <template v-else>
                <div
                  class="pxd-todo-list--text min-w-0"
                  :class="{
                    'text-foreground-secondary line-through': resolveStatus(item) === 'completed',
                  }"
                >
                  {{ item.content }}
                </div>

                <div
                  v-if="item.description"
                  :class="{ 'line-through': resolveStatus(item) === 'completed' }"
                  class="pxd-todo-list--description text-xs mbs-0.5 text-foreground-secondary"
                >
                  {{ item.description }}
                </div>
              </template>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </details>
</template>
