<script lang="ts" setup>
import type { CodeBlockEmits, CodeBlockProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import FileIcon from '@gdsicon/vue/file'
import { computed, onMounted, onUnmounted, shallowRef, useSlots, watch } from 'vue'
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
const activeLine = shallowRef<number | null>(null)

const lines = computed(() => props.code.split('\n'))

const highlightedSet = computed(() => new Set(props.highlightedLines))
const addedSet = computed(() => new Set(props.addedLines))
const removedSet = computed(() => new Set(props.removedLines))
const isLineMode = computed(
  () =>
    props.lineNumbers ||
    highlightedSet.value.size > 0 ||
    addedSet.value.size > 0 ||
    removedSet.value.size > 0,
)
const isOversized = computed(() => props.code.length > MAX_HIGHLIGHT_LENGTH)
const maxHeight = computed(() => getCssUnitValue(props.maxHeight, DEFAULT_MAX_HEIGHT))
const isClipped = computed(() => props.collapsible && !expanded.value)
const languageClass = computed(() => {
  const language = props.language?.trim().toLowerCase()

  // Oversized blocks drop the language class so the scanner skips them instead of tokenizing.
  return language && !isOversized.value ? `language-${language}` : undefined
})
const lineAnchorPrefix = computed(() => getLineAnchorPrefix(props.code))
const activeSwitcherValue = computed(
  () => props.switcher?.value ?? props.switcher?.options[0]?.value,
)
const activeSwitcherLabel = computed(() => {
  const option = props.switcher?.options.find((item) => item.value === activeSwitcherValue.value)

  return option?.label ?? option?.value
})
const activeTabValue = computed(() => props.tabs?.value ?? props.tabs?.options[0]?.value)

const configProvider = useConfigProvider()

const resolvedSize = computed(() => props.size || configProvider.size)
const lineRowClass = computed(() => (resolvedSize.value === 'lg' ? 'h-6' : 'h-5'))
const lineCodeClass = computed(() => (resolvedSize.value === 'lg' ? 'leading-6' : 'leading-5'))

const { scheduleHighlight } = useCodeHighlight()
const slots = useSlots()

const hasHeader = computed(() => !!(props.title || props.switcher || slots.header || slots.actions))

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-code-block min-w-0 relative flex max-w-full flex-col text-gray-1000',
    variants: {
      size: {
        sm: 'text-[0.8125rem]',
        md: 'text-[0.8125rem]',
        lg: 'text-[0.9375rem]',
      },
    },
  },
  {
    selection: () => ({
      size: props.size || configProvider.size,
    }),
  },
)

/** FNV-1a over the code: line anchors must stay stable across reloads to be shareable. */
function getLineAnchorPrefix(code: string) {
  let hash = 0x811c9dc5

  for (let index = 0; index < code.length; index++) {
    hash ^= code.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return `C${(hash >>> 0).toString(16).padStart(8, '0')}`
}

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

function getLineAnchor(line: number) {
  return `${lineAnchorPrefix.value}-L${line}`
}

function toggleLineAnchor(line: number) {
  const { pathname, search } = window.location

  if (activeLine.value === line) {
    activeLine.value = null
    history.replaceState(null, '', `${pathname}${search}`)

    return
  }

  activeLine.value = line
  history.replaceState(null, '', `#${getLineAnchor(line)}`)
}

function syncActiveLineFromHash() {
  const hash = window.location.hash.slice(1)
  const line = Number(hash.slice(`${lineAnchorPrefix.value}-L`.length))

  if (hash.startsWith(`${lineAnchorPrefix.value}-L`) && line >= 1 && line <= lines.value.length) {
    activeLine.value = line
    document.getElementById(hash)?.scrollIntoView({ block: 'nearest' })

    return
  }

  activeLine.value = null
}

function onHashChange() {
  syncActiveLineFromHash()
}

function onSwitcherChange(event: Event) {
  emits('switcher-change', (event.target as HTMLSelectElement).value)
}

function onTabSelect(value: string) {
  emits('tabs-change', value)
}

function onTabsKeydown(event: KeyboardEvent) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

  if (!keys.includes(event.key)) {
    return
  }

  event.preventDefault()

  const tabEls = [
    ...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]'),
  ]
  const currentIndex = tabEls.findIndex((element) => element === document.activeElement)
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % tabEls.length
  } else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + tabEls.length) % tabEls.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else {
    nextIndex = tabEls.length - 1
  }

  tabEls[nextIndex]?.focus()
  tabEls[nextIndex]?.click()
}

watch(
  () => [
    props.code,
    props.language,
    props.size,
    props.maxHeight,
    props.collapsible,
    props.lineNumbers,
    props.highlightedLines,
    props.addedLines,
    props.removedLines,
    expanded.value,
  ],
  () => {
    scheduleHighlight()
    measureOverflow()
  },
  { flush: 'post' },
)

watch(
  () => props.code,
  () => {
    activeLine.value = null
  },
)

onMounted(() => {
  measureOverflow()
  syncActiveLineFromHash()
  window.addEventListener('hashchange', onHashChange)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChange)
})
</script>

<template>
  <div data-code-block :class="classes" v-bind="attrs">
    <div
      v-if="tabs"
      class="pxd-code-block--tabs-bar pt-4 pb-3 scrollbar-none flex items-center overflow-x-auto"
    >
      <div role="tablist" class="min-w-0 flex items-center" @keydown="onTabsKeydown">
        <button
          v-for="option in tabs.options"
          :key="option.value"
          type="button"
          role="tab"
          :tabindex="option.value === activeTabValue ? 0 : -1"
          :aria-selected="option.value === activeTabValue"
          class="h-8 px-3 font-medium cursor-pointer rounded-md text-[0.8125rem] text-gray-900 not-aria-selected:hover:text-gray-1000 aria-selected:bg-gray-200 aria-selected:text-gray-1000 motion-safe:transition-colors"
          @click="onTabSelect(option.value)"
        >
          {{ option.label || option.value }}
        </button>
      </div>
    </div>

    <div
      v-if="hasHeader"
      class="pxd-code-block--header gap-2 ps-3 pe-0.75 h-9 flex items-center rounded-t-lg border bg-background-200"
    >
      <slot name="header">
        <FileIcon class="size-4 shrink-0 text-gray-900" aria-hidden="true" />
        <span class="min-w-0 truncate text-[0.8125rem] text-gray-900">{{ title }}</span>
      </slot>

      <div class="gap-1 min-w-0 ms-auto flex items-center">
        <slot name="actions" />

        <div v-if="switcher" class="h-7 group/select relative shrink-0">
          <div
            aria-hidden="true"
            class="px-2 gap-1 flex h-full cursor-pointer items-center rounded-md bg-background-200 text-[0.8125rem] whitespace-nowrap text-gray-900 group-hover/select:bg-gray-200 has-focus-visible:self-focus-ring motion-safe:transition-colors"
          >
            <span class="truncate">{{ activeSwitcherLabel }}</span>
            <ChevronDownIcon class="size-3 shrink-0" />
          </div>

          <select
            class="inset-0 absolute cursor-pointer opacity-0 outline-none"
            :value="activeSwitcherValue"
            @change="onSwitcherChange"
          >
            <option v-for="option in switcher.options" :key="option.value" :value="option.value">
              {{ option.label || option.value }}
            </option>
          </select>
        </div>

        <PCopyButton
          v-if="copyBtn !== 'hidden'"
          icon
          size="xs"
          variant="ghost"
          :text="code"
          @copy="onCopy"
        />
      </div>
    </div>

    <div
      class="pxd-code-block--content overflow-hidden border border-gray-alpha-300"
      :class="hasHeader ? 'rounded-b-lg border-t-0' : 'rounded-lg'"
    >
      <div class="group/code-block relative">
        <div
          ref="bodyEl"
          class="pxd-code-block--body overflow-x-hidden overflow-y-auto self-focus-ring"
          tabindex="0"
          :style="{ maxHeight: expanded ? undefined : maxHeight }"
        >
          <pre
            v-if="isLineMode"
            class="pxd-code-block--pre py-4 notranslate overflow-x-auto font-mono"
            translate="no"
          ><div
              v-for="(line, index) in lines"
              :id="getLineAnchor(index + 1)"
              :key="index"
              class="pxd-code-block--line relative ps-4 pe-4 flex items-center data-highlighted:bg-blue-300 data-highlighted:shadow-[inset_2px_0_0_0_var(--color-blue-900)] data-active:bg-amber-300 data-active:shadow-[inset_2px_0_0_0_var(--color-amber-900)] data-added:bg-green-300 data-added:shadow-[inset_2px_0_0_0_var(--color-green-900)] data-removed:bg-red-300 data-removed:shadow-[inset_2px_0_0_0_var(--color-red-900)]"
              :class="lineRowClass"
              :data-highlighted="highlightedSet.has(index + 1) || undefined"
              :data-added="addedSet.has(index + 1) || undefined"
              :data-removed="removedSet.has(index + 1) || undefined"
              :data-active="activeLine === index + 1 || undefined"
            >
              <button
                v-if="lineNumbers"
                type="button"
                tabindex="-1"
                aria-hidden="true"
                class="pxd-code-block--line-number w-8 pe-4 shrink-0 text-right text-gray-600 tabular-nums cursor-pointer select-none hover:text-gray-1000 motion-safe:transition-colors"
                @click="toggleLineAnchor(index + 1)"
              >{{ index + 1 }}</button>

              <code
                v-text="line"
                class="pxd-code-block--line-code whitespace-pre bg-transparent! border-0! p-0! m-0!"
                :class="[languageClass, lineCodeClass]"
              />
            </div></pre>

          <pre
            v-else
            class="pxd-code-block--pre p-3 notranslate min-w-0 flex-1 overflow-x-auto font-mono"
            translate="no"
          ><code v-text="code" class="bg-transparent! border-0! p-0! m-0!" :class="languageClass" /></pre>
        </div>

        <div
          v-if="isClipped"
          class="pxd-code-block--fade inset-x-0 bottom-0 h-16 backdrop-blur-xl pointer-events-none absolute"
        />

        <div
          v-if="copyBtn !== 'hidden' && !hasHeader"
          class="end-3.5 top-2 max-sm:opacity-100 absolute focus-within:opacity-100 motion-safe:transition-opacity"
          :class="{ 'opacity-0 group-hover/code-block:opacity-100': copyBtn === 'hover' }"
        >
          <PCopyButton icon size="sm" variant="ghost" :text="code" @copy="onCopy" />
        </div>
      </div>

      <div v-if="collapsible && isOverflowing" class="border-t border-gray-alpha-300">
        <PButton variant="ghost" size="sm" full-width class="rounded-none" @click="toggleExpanded">
          {{ configProvider.locale.codeBlock[expanded ? 'collapse' : 'expand'] }}
        </PButton>
      </div>
    </div>
  </div>
</template>

<style>
.pxd-code-block {
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

.pxd-code-block--fade {
  mask-image: linear-gradient(to top, black, transparent);
}

.pxd-code-block--line[data-added='true']::after,
.pxd-code-block--line[data-removed='true']::after {
  position: absolute;
  inset: 0;
  padding-left: 0.5rem;
  font-weight: 500;
  pointer-events: none;
}

.pxd-code-block--line[data-added='true']::after {
  content: '+';
  color: var(--color-green-900);
}

.pxd-code-block--line[data-removed='true']::after {
  content: '-';
  color: var(--color-red-900);
}

@media (max-width: 600px) {
  .pxd-code-block--line-number {
    display: none;
  }
}
</style>
