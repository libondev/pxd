<script lang="ts" setup>
import type { CodeBlockEmits, CodeBlockProps } from './types'
import { computed, onMounted, shallowRef, watch } from 'vue'
import {
  MAX_HIGHLIGHT_LENGTH,
  useCodeHighlight,
} from '../../composables/_internal/use-code-highlight.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getCssUnitValue } from '../../utils/format.js'
import PButton from '../button/index.vue'
import PCopyButton from '../copy-button/index.vue'

defineOptions({
  name: 'PCodeBlock',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CodeBlockProps>(), {
  copyBtn: 'hover',
})

const emits = defineEmits<CodeBlockEmits>()

const DEFAULT_MAX_HEIGHT = '20rem'

const bodyEl = shallowRef<HTMLElement | null>(null)
const expanded = shallowRef(false)
const isOverflowing = shallowRef(false)

const lineCount = computed(() => props.code.split('\n').length)
const isOversized = computed(() => props.code.length > MAX_HIGHLIGHT_LENGTH)
const maxHeight = computed(() => getCssUnitValue(props.maxHeight, DEFAULT_MAX_HEIGHT))
const isClipped = computed(() => props.collapsible && !expanded.value)
const languageClass = computed(() => {
  const language = props.language?.trim().toLowerCase()

  // Oversized blocks drop the language class so the scanner skips them instead of tokenizing.
  return language && !isOversized.value ? `language-${language}` : undefined
})

const configProvider = useConfigProvider()
const { scheduleHighlight } = useCodeHighlight()
const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-code-block relative flex flex-col overflow-hidden rounded-lg border border-gray-alpha-300 bg-(--code-block-bg) text-gray-1000',
    variants: {
      size: {
        sm: 'text-[10px]',
        md: 'text-[13px]',
        lg: 'text-[15px]',
      },
    },
  },
  {
    selection: () => ({
      size: props.size || configProvider.size,
    }),
  },
)

function measureOverflow() {
  const element = bodyEl.value

  if (!props.collapsible || expanded.value || !element) {
    return
  }

  isOverflowing.value = element.scrollHeight > element.clientHeight + 1
}

function toggleExpanded() {
  expanded.value = !expanded.value
}

function onCopy(text: string) {
  emits('copy', text)
}

watch(
  () => [
    props.code,
    props.language,
    props.size,
    props.maxHeight,
    props.collapsible,
    expanded.value,
  ],
  () => {
    scheduleHighlight()
    measureOverflow()
  },
  { flush: 'post' },
)

onMounted(measureOverflow)
</script>

<template>
  <div data-code-block :class="classes" v-bind="attrs">
    <div
      v-if="title || $slots.header || $slots.actions"
      class="pxd-code-block--header gap-3 px-3 py-2 text-sm flex items-center border-b border-gray-alpha-300"
    >
      <slot name="header">{{ title }}</slot>

      <div class="gap-1 ms-auto flex items-center">
        <slot name="actions" />
      </div>
    </div>

    <div class="group/code-block relative">
      <div
        ref="bodyEl"
        class="pxd-code-block--body overflow-x-hidden overflow-y-auto self-focus-ring"
        tabindex="0"
        :style="{ maxHeight: expanded ? undefined : maxHeight }"
      >
        <div class="flex font-mono">
          <div
            v-if="lineNumbers"
            aria-hidden="true"
            class="pxd-code-block--gutter p-3 shrink-0 border-e border-gray-alpha-300 text-right text-gray-700 tabular-nums select-none"
          >
            <span v-for="line of lineCount" :key="line" class="block">{{ line }}</span>
          </div>

          <pre
            class="pxd-code-block--pre p-3 notranslate min-w-0 flex-1 overflow-x-auto"
            translate="no"
          ><code v-text="code" :class="languageClass" /></pre>
        </div>
      </div>

      <div
        v-if="isClipped"
        class="inset-x-0 bottom-0 h-16 pointer-events-none absolute bg-linear-to-t from-(--code-block-bg) to-transparent"
      />

      <div
        v-if="copyBtn !== 'hidden'"
        class="end-3 top-3 max-sm:opacity-100 absolute focus-within:opacity-100 motion-safe:transition-opacity"
        :class="{ 'opacity-0 group-hover/code-block:opacity-100': copyBtn === 'hover' }"
      >
        <PCopyButton
          icon
          size="sm"
          variant="ghost"
          class="bg-(--code-block-bg)"
          :text="code"
          @copy="onCopy"
        />
      </div>
    </div>

    <div v-if="collapsible && isOverflowing" class="border-t border-gray-alpha-300">
      <PButton variant="ghost" size="sm" full-width class="rounded-none" @click="toggleExpanded">
        {{ configProvider.locale.codeBlock[expanded ? 'collapse' : 'expand'] }}
      </PButton>
    </div>
  </div>
</template>

<style>
.pxd-code-block {
  --code-block-bg: var(--color-background-100);

  --syntax-comment: hsl(var(--color-gray-700-value));
  --syntax-keyword: hsl(var(--color-purple-900-value));
  --syntax-operator: hsl(var(--color-gray-800-value));
  --syntax-string: hsl(var(--color-green-900-value));
  --syntax-constant: hsl(var(--color-blue-900-value));
  --syntax-function: hsl(var(--color-teal-900-value));
  --syntax-type: hsl(var(--color-blue-900-value));
  --syntax-variable: hsl(var(--color-amber-900-value));
  --syntax-property: hsl(var(--color-gray-1000-value));
  --syntax-tag: hsl(var(--color-red-900-value));
  --syntax-selector: hsl(var(--color-green-900-value));
  --syntax-inserted: hsl(var(--color-green-900-value));
  --syntax-deleted: hsl(var(--color-red-900-value));
}

.pxd-code-block code::highlight(comment),
.pxd-code-block code::highlight(quote) {
  color: var(--syntax-comment);
}

.pxd-code-block code::highlight(keyword),
.pxd-code-block code::highlight(storage),
.pxd-code-block code::highlight(at-rule),
.pxd-code-block code::highlight(doctype),
.pxd-code-block code::highlight(important),
.pxd-code-block code::highlight(section) {
  color: var(--syntax-keyword);
}

.pxd-code-block code::highlight(operator),
.pxd-code-block code::highlight(punctuation) {
  color: var(--syntax-operator);
}

.pxd-code-block code::highlight(string),
.pxd-code-block code::highlight(regexp),
.pxd-code-block code::highlight(attribute-value),
.pxd-code-block code::highlight(link),
.pxd-code-block code::highlight(raw) {
  color: var(--syntax-string);
}

.pxd-code-block code::highlight(numeric),
.pxd-code-block code::highlight(boolean),
.pxd-code-block code::highlight(constant),
.pxd-code-block code::highlight(symbol),
.pxd-code-block code::highlight(character-entity),
.pxd-code-block code::highlight(anchor),
.pxd-code-block code::highlight(entity) {
  color: var(--syntax-constant);
}

.pxd-code-block code::highlight(function),
.pxd-code-block code::highlight(decorator),
.pxd-code-block code::highlight(animation) {
  color: var(--syntax-function);
}

.pxd-code-block code::highlight(type),
.pxd-code-block code::highlight(support) {
  color: var(--syntax-type);
}

.pxd-code-block code::highlight(variable),
.pxd-code-block code::highlight(interpolation) {
  color: var(--syntax-variable);
}

.pxd-code-block code::highlight(property),
.pxd-code-block code::highlight(key),
.pxd-code-block code::highlight(attribute-name) {
  color: var(--syntax-property);
}

.pxd-code-block code::highlight(tag) {
  color: var(--syntax-tag);
}

.pxd-code-block code::highlight(selector) {
  color: var(--syntax-selector);
}

.pxd-code-block code::highlight(inserted) {
  color: var(--syntax-inserted);
}

.pxd-code-block code::highlight(deleted) {
  color: var(--syntax-deleted);
}
</style>
