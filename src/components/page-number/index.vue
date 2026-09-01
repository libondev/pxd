<script lang="ts" setup>
import type { ComponentSize } from '../../types/shared/props'
import type { ListModelValue, ListOptions } from '../list/types'
import type { PageNumberEmits, PageNumberProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, ref, watch } from 'vue'
import { BASIC_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PSelect from '../select/index.vue'

defineOptions({
  name: 'PPageNumber',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<PageNumberProps>(), {
  modelValue: 1,
  pageSize: 10,
  total: 0,
  disabled: false,
  showPageSize: true,
  showQuickJumper: false,
  pageSizeOptions: () => [10, 25, 50, 100],
})

const mappedPageSizeOptions = computed<ListOptions>(() => {
  const label = configProvider.locale.pagination.perPage

  return props.pageSizeOptions.map((size) => ({
    label: String(size) + label,
    value: size,
  }))
})

const emits = defineEmits<PageNumberEmits>()

const configProvider = useConfigProvider()

const pageInput = ref(String(props.modelValue))
const internalPageSize = ref(props.pageSize)
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const pagesBtnSize = computed(() => {
  const inheritSize = props.size || configProvider.size

  return {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  }[inheritSize] as ComponentSize
})
const pageItemSizeClass = computed(() => BASIC_HEIGHTS[pagesBtnSize.value])

const pageItems = computed<(number | 'ellipsis-left' | 'ellipsis-right')[]>(() => {
  if (pageCount.value <= 7) {
    return Array.from({ length: pageCount.value }, (_, index) => index + 1)
  }

  if (props.modelValue <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', pageCount.value]
  }

  if (props.modelValue >= pageCount.value - 3) {
    return [
      1,
      'ellipsis-left',
      pageCount.value - 4,
      pageCount.value - 3,
      pageCount.value - 2,
      pageCount.value - 1,
      pageCount.value,
    ]
  }

  return [
    1,
    'ellipsis-left',
    props.modelValue - 1,
    props.modelValue,
    props.modelValue + 1,
    'ellipsis-right',
    pageCount.value,
  ]
})

function setPage(page: number) {
  if (!props.disabled && page !== props.modelValue) {
    emits('update:modelValue', page)
  }
}

function submitPageInput() {
  const page = Number(pageInput.value)

  if (!Number.isInteger(page)) {
    pageInput.value = String(props.modelValue)
    return
  }

  const nextPage = Math.min(Math.max(page, 1), pageCount.value)
  pageInput.value = String(nextPage)
  setPage(nextPage)
}

function onPageInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    submitPageInput()
  }
}

function onPageSizeChange(value: ListModelValue) {
  emits('update:pageSize', Number(value))
}

watch(
  () => props.modelValue,
  (page) => {
    pageInput.value = String(page)
  },
)

watch(
  () => props.pageSize,
  (value) => {
    internalPageSize.value = value
  },
)
</script>

<template>
  <nav
    class="pxd-page-number gap-1 inline-flex w-full max-w-full items-center"
    aria-label="Pagination"
    :aria-disabled="disabled"
    v-bind="$attrs"
  >
    <button
      type="button"
      class="pxd-page-number--prev inline-flex aspect-square items-center justify-center rounded-md border border-transparent self-focus-ring outline-none enabled:cursor-pointer enabled:hover:bg-background-hover enabled:hover:text-foreground enabled:active:bg-background-active disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
      :class="pageItemSizeClass"
      :disabled="disabled || modelValue <= 1"
      :aria-label="configProvider.locale.compare.prev"
      @click="setPage(modelValue - 1)"
    >
      <ChevronRightIcon class="size-4 rotate-180" aria-hidden="true" />
    </button>

    <template v-for="item in pageItems" :key="item">
      <button
        v-if="typeof item === 'string'"
        class="pxd-page-number--ellipsis text-sm inline-flex aspect-square shrink-0 cursor-default items-center justify-center rounded-md disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :class="pageItemSizeClass"
        :disabled="disabled"
        aria-hidden="true"
      >
        …
      </button>

      <button
        v-else
        type="button"
        class="pxd-page-number--item text-sm inline-flex aspect-square shrink-0 items-center justify-center rounded-md self-focus-ring outline-none enabled:cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :class="[
          pageItemSizeClass,
          item === modelValue
            ? 'font-medium bg-primary text-primary-foreground'
            : 'hover:bg-background-hover hover:text-foreground',
        ]"
        :aria-current="item === modelValue ? 'page' : undefined"
        :aria-label="`Page ${item}`"
        :disabled="disabled"
        @click="setPage(item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      class="pxd-page-number--next inline-flex aspect-square items-center justify-center rounded-md border border-transparent self-focus-ring outline-none enabled:cursor-pointer enabled:hover:bg-background-hover enabled:hover:text-foreground enabled:active:bg-background-active disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
      :class="pageItemSizeClass"
      :disabled="disabled || modelValue >= pageCount"
      :aria-label="configProvider.locale.compare.next"
      @click="setPage(modelValue + 1)"
    >
      <ChevronRightIcon class="size-4" aria-hidden="true" />
    </button>

    <PSelect
      v-if="showPageSize"
      v-model="internalPageSize"
      :disabled="disabled"
      :size="pagesBtnSize"
      :options="mappedPageSizeOptions"
      @change="onPageSizeChange"
    />

    <input
      v-if="showQuickJumper"
      v-model="pageInput"
      type="number"
      :class="pageItemSizeClass"
      class="pxd-page-number--jumper w-16 px-3 text-sm appearance-none rounded-md border border-border bg-background-100 text-center text-left text-foreground self-focus-ring outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700"
      :min="1"
      :max="pageCount"
      step="1"
      inputmode="numeric"
      :disabled="disabled"
      aria-label="Jump to page"
      @blur="submitPageInput"
      @keydown="onPageInputKeydown"
    />
  </nav>
</template>
