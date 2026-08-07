<script lang="ts" setup>
import type { PageNumberEmits, PageNumberProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, ref, watch } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'

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
  pageSize: 20,
  total: 0,
  disabled: false,
  showQuickJumper: false,
})

const emits = defineEmits<PageNumberEmits>()
const configProvider = useConfigProvider()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const pageInput = ref(String(props.modelValue))
const pageItemSizeClass = computed(() => {
  return {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10',
  }[props.size || configProvider.size]
})

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

watch(
  () => props.modelValue,
  (page) => {
    pageInput.value = String(page)
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
      class="pxd-page-number--prev inline-flex items-center justify-center rounded-md self-focus-ring outline-none enabled:cursor-pointer enabled:hover:bg-background-hover enabled:hover:text-foreground enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-35 motion-safe:transition-colors"
      :class="pageItemSizeClass"
      :disabled="disabled || modelValue <= 1"
      aria-label="Previous page"
      @click="setPage(modelValue - 1)"
    >
      <ChevronRightIcon class="size-4 rotate-180" aria-hidden="true" />
    </button>

    <template v-for="item in pageItems" :key="item">
      <span
        v-if="typeof item === 'string'"
        class="pxd-page-number--ellipsis inline-flex shrink-0 cursor-default items-center justify-center"
        :class="pageItemSizeClass"
        aria-hidden="true"
      >
        …
      </span>

      <button
        v-else
        type="button"
        class="pxd-page-number--item text-sm inline-flex shrink-0 items-center justify-center rounded-md border self-focus-ring outline-none enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 motion-safe:transition-colors"
        :class="[
          pageItemSizeClass,
          item === modelValue
            ? 'font-medium border-primary bg-background-100 text-primary'
            : 'border-transparent hover:bg-background-hover hover:text-foreground',
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
      class="pxd-page-number--next inline-flex items-center justify-center rounded-md self-focus-ring outline-none enabled:cursor-pointer enabled:hover:bg-background-hover enabled:hover:text-foreground enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-35 motion-safe:transition-colors"
      :class="pageItemSizeClass"
      :disabled="disabled || modelValue >= pageCount"
      aria-label="Next page"
      @click="setPage(modelValue + 1)"
    >
      <ChevronRightIcon class="size-4" aria-hidden="true" />
    </button>

    <input
      v-if="showQuickJumper"
      v-model="pageInput"
      type="number"
      class="pxd-page-number--jumper h-8 w-16 px-2 text-sm appearance-none rounded-md border border-border bg-background-100 text-center text-foreground self-focus-ring outline-none disabled:cursor-not-allowed disabled:opacity-35"
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
