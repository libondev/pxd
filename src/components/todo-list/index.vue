<script lang="ts" setup>
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
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import ListUnorderedIcon from '@gdsicon/vue/list-unordered'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import MinusIcon from '@gdsicon/vue/minus'
import { computed, shallowRef, useSlots, watch } from 'vue'
import { useCollapseMotion } from '../../composables/_internal/use-collapse-motion.js'
import { useConfigProvider } from '../../contexts/config-provider.js'

defineOptions({
  name: 'PTodoList',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TodoProps>(), {
  options: () => [],
  readonly: false,
  collapsible: true,
  defaultExpanded: false,
})
const emits = defineEmits<TodoEmits>()

const configProvider = useConfigProvider()
const slots = useSlots()

const hasItemSlot = computed(() => !!slots.item)
const hasEmptySlot = computed(() => !!slots.empty)
const hasItemContentSlot = computed(() => !!slots['item-content'])

const MARKER_CLASSES: Record<TodoStatus, string> = {
  pending: 'border-2 border-gray-alpha-400',
  in_progress: '',
  completed: 'p-1 bg-teal-600 text-white',
  canceled: 'p-1 bg-gray-alpha-400 text-white',
}

const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
  canceled: 'pending',
}

const innerValue = shallowRef<TodoOption[] | undefined>(props.defaultValue)
const isExpanded = shallowRef(props.defaultExpanded)
const contentRef = shallowRef<HTMLElement>()

const currentOptions = computed(() => props.modelValue ?? innerValue.value ?? props.options)

watch(
  () => props.options,
  (options) => {
    if (props.modelValue === undefined) {
      innerValue.value = options
    }
  },
)

const expanded = computed(() => !props.collapsible || isExpanded.value)
const { detailsOpen, isLeaving, skipEnterMotion } = useCollapseMotion(contentRef, expanded)

function resolveStatus(item: TodoOption): TodoStatus {
  return item.status ?? 'pending'
}

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

const headerTitle = computed(() => props.title ?? configProvider.locale.todo.title)

const summaryText = computed(() => {
  const { inProgress, pending, total, canceled } = stats.value
  const totalCount = total - canceled
  const currentCount = totalCount - inProgress - pending

  return totalCount > 0 ? `${currentCount}/${totalCount}` : ''
})

const emptyText = computed(() => props.empty ?? configProvider.locale.results.noData)

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
  emits('update:modelValue', options)
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

function expand() {
  isExpanded.value = true
}

function collapse() {
  isExpanded.value = false
}

function toggleExpand(next?: boolean) {
  isExpanded.value = next ?? !isExpanded.value
}

function onToggleClick(ev: MouseEvent) {
  if (!props.collapsible) {
    return
  }

  isExpanded.value = !isExpanded.value

  emits('toggle', isExpanded.value, ev)
}

function onDetailsToggle(ev: Event) {
  const details = ev.currentTarget as HTMLDetailsElement

  // Find-in-page / fragment navigation opens <details> natively.
  if (details.open && !expanded.value) {
    skipEnterMotion()
    isExpanded.value = true
  }
}

defineExpose({
  isExpanded,
  stats,
  expand,
  collapse,
  toggleExpand,
  start,
  complete,
  cancel,
  reset,
})
</script>

<template>
  <details
    class="pxd-todo-list group/todo w-full max-w-full rounded-xl border bg-background-100 text-foreground"
    :open="detailsOpen"
    v-bind="$attrs"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-todo-list--header group/todo gap-2 p-3 text-sm flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center justify-between border-none bg-transparent font-inherit text-inherit self-focus-ring outline-none select-none"
      :class="{ 'cursor-default': !collapsible }"
      @click.prevent="onToggleClick"
    >
      <ListUnorderedIcon class="size-4 font-medium shrink-0" />
      <slot
        name="header"
        :expanded="expanded"
        :stats="stats"
        :title="headerTitle"
        :summary="summaryText"
      >
        <span class="pxd-todo-list--title font-medium min-w-0 text-sm flex-1 truncate">
          {{ headerTitle }}
        </span>

        <span
          v-if="summaryText"
          class="pxd-todo-list--summary text-sm shrink-0 text-foreground-secondary"
          aria-live="polite"
        >
          {{ summaryText }}
        </span>
      </slot>

      <ChevronDownIcon
        v-if="collapsible"
        class="pxd-todo-list--caret text-xs shrink-0 opacity-0 group-hover/todo:opacity-100 motion-safe:transition-transform-opacity"
        :class="{ 'rotate-180 opacity-100': isExpanded }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-todo-list--content overflow-hidden"
      :class="{ 'motion-safe:transition-[height]': isExpanded || isLeaving }"
    >
      <ul class="pxd-todo-list--list m-0 p-3 gap-1.5 flex list-none flex-col border-t">
        <li
          v-if="currentOptions.length === 0"
          class="pxd-todo-list--empty text-sm text-foreground-secondary"
        >
          <slot v-if="hasEmptySlot" name="empty" />
          <template v-else>{{ emptyText }}</template>
        </li>

        <template v-for="(item, index) in currentOptions" :key="item.id ?? index">
          <li
            v-if="hasItemSlot"
            class="pxd-todo-list--item gap-1.5 flex items-center"
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
            class="pxd-todo-list--item gap-1.5 flex items-center"
            :class="{
              'cursor-pointer': !readonly && !item.disabled,
              'opacity-50': item.disabled,
            }"
            :data-status="resolveStatus(item)"
            @click="onItemClick(index, item)"
          >
            <button
              class="pxd-todo-list--indicator p-0 size-4 block shrink-0 border-none bg-transparent leading-none text-inherit self-focus-ring"
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
                :class="MARKER_CLASSES[resolveStatus(item)]"
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
                  class="pxd-todo-list--text min-w-0 text-sm"
                  :class="{
                    'text-foreground-secondary line-through': resolveStatus(item) === 'completed',
                  }"
                >
                  {{ item.content }}
                </div>

                <div
                  v-if="item.description"
                  class="pxd-todo-list--description text-sm text-foreground-secondary"
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
